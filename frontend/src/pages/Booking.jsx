import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Loader2, Plane, MapPin, Calendar, Users, ChevronDown, Repeat, X, ArrowLeft, Plus, Minus, Check, AlertCircle, Package, Building, ArrowRight } from 'lucide-react';
import { useBooking } from '../context/BookingContext';

const Booking = () => {
    const { searchParams, setSearchParams, setDurationDays, setSelectedFlights } = useBooking();
    const [loading, setLoading] = useState(false);
    const [airports, setAirports] = useState([]);
    const [flights, setFlights] = useState([]);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState('SOURCE'); // SOURCE, DESTINATION, GUESTS, DATES
    const [searchValue, setSearchValue] = useState('');
    
    // Guest State (Internal to modal, syncs with searchParams on continue)
    const [guests, setGuests] = useState({
        adults: 1,
        young_adults: 0,
        children: 0,
        infants: 0
    });

    const [seatStatus, setSeatStatus] = useState({});

    const navigate = useNavigate();

    // Real-time polling for seat availability
    useEffect(() => {
        if (!flights || flights.length === 0) return;
        
        const fetchSeatData = async () => {
            const ids = new Set();
            flights.forEach(f => {
                if (f.type === 'PACKAGE') {
                    ids.add(f.outbound.id);
                    ids.add(f.return.id);
                } else {
                    ids.add(f.id);
                }
            });
            
            if (ids.size === 0) return;
            
            try {
                const res = await fetch(`http://localhost:8000/api/flights/seats/?ids=${Array.from(ids).join(',')}`);
                if (res.ok) {
                    const data = await res.json();
                    setSeatStatus(data);
                }
            } catch (err) {
                console.error("Failed to poll seat data", err);
            }
        };

        fetchSeatData();
        const interval = setInterval(fetchSeatData, 3000);
        
        return () => clearInterval(interval);
    }, [flights]);

    useEffect(() => {
        fetchAirports();
        // Auto-search if coming from landing page with parameters
        if (searchParams.source && searchParams.destination && searchParams.departureDate) {
            handleSearch();
        }
    }, []);

    const fetchAirports = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/airports/');
            if (res.ok) {
                const data = await res.json();
                setAirports(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSearch = async (passedParams = null) => {
        const params = passedParams || searchParams;
        setLoading(true);
        setIsModalOpen(false);

        const dur = (new Date(params.returnDate) - new Date(params.departureDate)) / (1000 * 3600 * 24);
        setDurationDays(dur > 0 ? dur : 0);

        try {
            const sourceParam = params.source ? `source=${params.source}&` : '';
            const destParam = params.destination ? `destination=${params.destination}&` : '';
            const dateParam = params.departureDate ? `date=${params.departureDate}&` : '';
            
            // For Round Trip, we need to fetch both ways
            const res = await fetch(`http://localhost:8000/api/flights/search/?${sourceParam}${destParam}${dateParam}`);
            let data = [];
            if (res.ok) {
                data = await res.json();
            }

            if (params.journeyType === 'round_trip') {
                if (params.source || params.destination) {
                    const retSource = params.destination ? `source=${params.destination}&` : '';
                    const retDest = params.source ? `destination=${params.source}&` : '';
                    const returnDateParam = params.returnDate ? `date=${params.returnDate}` : '';
                    const resRet = await fetch(`http://localhost:8000/api/flights/search/?${retSource}${retDest}${returnDateParam}`);
                    if (resRet.ok) {
                        const retData = await resRet.json();
                        
                        // Logic to pair flights
                        const packages = [];
                        data.forEach((out) => {
                            const possibleReturn = retData.find(ret => 
                                new Date(ret.departure_time) > new Date(out.arrival_time) &&
                                ret.destination?.code === out.source?.code &&
                                ret.source?.code === out.destination?.code
                            );
                            if (possibleReturn) {
                                packages.push({
                                    type: 'PACKAGE',
                                    outbound: out,
                                    return: possibleReturn,
                                    id: `pkg-${out.id}-${possibleReturn.id}`
                                });
                            }
                        });
                        setFlights(packages);
                    }
                } else {
                    const packages = [];
                    data.forEach((out) => {
                        const possibleReturn = data.find(ret => 
                            ret.source?.code === out.destination?.code && 
                            ret.destination?.code === out.source?.code && 
                            new Date(ret.departure_time) > new Date(out.arrival_time)
                        );
                        if (possibleReturn) {
                            packages.push({
                                type: 'PACKAGE',
                                outbound: out,
                                return: possibleReturn,
                                id: `pkg-${out.id}-${possibleReturn.id}`
                            });
                        }
                    });
                    setFlights(packages.length > 0 ? packages : data);
                }
            } else {
                setFlights(data);
            }

            if (passedParams) {
                setSearchParams(passedParams);
            }
            setTimeout(() => {
                document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDealClick = (destCode) => {
        const newParams = {
            ...searchParams,
            source: 'JNB',
            destination: destCode
        };
        handleSearch(newParams);
    };

    const handleSelectFlight = (flightOrPkg) => {
        if (flightOrPkg.type === 'PACKAGE') {
            setSelectedFlights([flightOrPkg.outbound, flightOrPkg.return]);
        } else {
            setSelectedFlights([flightOrPkg]);
        }
        
        const dur = (new Date(searchParams.returnDate) - new Date(searchParams.departureDate)) / (1000 * 3600 * 24);
        if (searchParams.journeyType === 'round_trip' && dur > 1) {
            navigate('/recommendations');
        } else {
            navigate('/seats');
        }
    };

    const openStep = (step) => {
        setCurrentStep(step);
        setIsModalOpen(true);
        setSearchValue('');
    };

    const nextStep = () => {
        if (currentStep === 'SOURCE') setCurrentStep('DESTINATION');
        else if (currentStep === 'DESTINATION') setCurrentStep('GUESTS');
        else if (currentStep === 'GUESTS') setCurrentStep('DATES');
        else handleSearch();
    };

    const prevStep = () => {
        if (currentStep === 'DESTINATION') setCurrentStep('SOURCE');
        else if (currentStep === 'GUESTS') setCurrentStep('DESTINATION');
        else if (currentStep === 'DATES') setCurrentStep('GUESTS');
    };

    const filteredAirports = airports.filter(a => 
        (a.name?.toLowerCase() || "").includes(searchValue.toLowerCase()) || 
        (a.code?.toLowerCase() || "").includes(searchValue.toLowerCase()) ||
        (a.city?.toLowerCase() || "").includes(searchValue.toLowerCase())
    );

    const groupedAirports = filteredAirports.reduce((acc, airport) => {
        const key = airport.country === 'South Africa' ? 'Domestic Destinations (South Africa)' : 'International Destinations';
        if (!acc[key]) acc[key] = [];
        acc[key].push(airport);
        return acc;
    }, {});

    const updateGuestCount = (type, delta) => {
        setGuests(prev => {
            const newVal = Math.max(0, prev[type] + delta);
            if (type === 'adults' && newVal < 1) return prev;
            return { ...prev, [type]: newVal };
        });
    };

    const totalGuests = guests.adults + guests.young_adults + guests.children + guests.infants;

    useEffect(() => {
        setSearchParams(prev => ({ ...prev, passengers: totalGuests }));
    }, [guests, setSearchParams, totalGuests]);

    return (
        <div className="pb-20 min-h-screen">
            {/* Hero Banner */}
            <div style={{ position: 'relative', width: '100%', height: '420px', overflow: 'hidden' }}>
                <img
                    src="/hero.png"
                    alt="Skylooms Book"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
                />
                {/* Dark overlay for text legibility */}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.6) 70%, var(--bg-main) 100%)' }} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '80px' }}>
                    <h1 style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: 'clamp(3rem, 8vw, 7rem)', color: 'white', letterSpacing: '0.04em', textShadow: '0 4px 30px rgba(0,0,0,0.5)', lineHeight: 1 }}>
                        Book Your Flight
                    </h1>
                    <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(1rem, 2vw, 1.4rem)', fontStyle: 'italic', color: 'rgba(255,255,255,0.7)', marginTop: '0.75rem', letterSpacing: '0.1em' }}>
                        Every journey begins with a single flight.
                    </p>
                </div>
            </div>

            <div className="container">
                {/* Services Navigation Hub */}
                <div className="flex flex-wrap items-center justify-center gap-4 mb-2 -mt-10 relative z-10 px-4">
                    <Link to="/book" className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-sky-500 text-white font-bold shadow-lg shadow-sky-500/20 transition-all border border-sky-400/30">
                        <Plane size={18} />
                        <span>Flights</span>
                    </Link>
                    <Link to="/hotels" className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 backdrop-blur-md text-white font-semibold hover:bg-white/10 transition-all border border-white/10">
                        <Building size={18} className="text-purple-400" />
                        <span>Hotels</span>
                    </Link>
                    <Link to="/cargo" className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 backdrop-blur-md text-white font-semibold hover:bg-white/10 transition-all border border-white/10">
                        <Package size={18} className="text-amber-400" />
                        <span>Cargo</span>
                    </Link>
                    <Link to="/group-bookings" className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 backdrop-blur-md text-white font-semibold hover:bg-white/10 transition-all border border-white/10">
                        <Users size={18} className="text-emerald-400" />
                        <span>Groups</span>
                    </Link>
                </div>

                {/* Visual Search Card Trigger */}
                <div className="search-card-container">
                    <div className="grid md:grid-cols-4 gap-0 rounded-2xl overflow-hidden cursor-pointer glass-panel shadow-xl border border-white/10">
                        <div className="p-4 border-r border-white/10 hover:bg-white/5 transition" onClick={() => openStep('SOURCE')}>
                            <span className="search-input-label flex items-center gap-1"><Plane size={14}/> Flying From</span>
                            <div className="search-input-value mt-1">{searchParams.source || 'Search airport'}</div>
                        </div>
                        <div className="p-4 border-r border-white/10 hover:bg-white/5 transition" onClick={() => openStep('DESTINATION')}>
                            <span className="search-input-label flex items-center gap-1"><MapPin size={14}/> Flying To</span>
                            <div className="search-input-value mt-1">{searchParams.destination || 'Destinations'}</div>
                        </div>
                        <div className="p-4 border-r border-white/10 hover:bg-white/5 transition" onClick={() => openStep('GUESTS')}>
                            <span className="search-input-label flex items-center gap-1"><Users size={14}/> Who's Travelling?</span>
                            <div className="search-input-value mt-1">{totalGuests} Guest{totalGuests > 1 ? 's' : ''}, {searchParams.cabinClass}</div>
                        </div>
                        <div className="p-4 hover:bg-white/5 transition" onClick={() => openStep('DATES')}>
                            <span className="search-input-label flex items-center gap-1"><Calendar size={14}/> Travelling When?</span>
                            <div className="search-input-value mt-1">{searchParams.departureDate || 'Add Dates'}</div>
                        </div>
                    </div>
                </div>

                {/* MODAL SEARCH FLOW */}
                {isModalOpen && (
                    <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                        <div className="search-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="close-overlay" onClick={() => setIsModalOpen(false)}><X size={24}/></div>
                            
                            {/* Modal Header Tabs */}
                            <div className="modal-header border-b border-white/10">
                                <div className={`modal-tab ${currentStep === 'SOURCE' ? 'active' : ''} ${searchParams.source ? 'completed' : ''}`} onClick={() => setCurrentStep('SOURCE')}>
                                    <div className="tab-icon-wrapper">{searchParams.source ? <Check size={18}/> : <Plane size={18}/>}</div>
                                    <div className="tab-info">
                                        <span className="tab-label">Flying From</span>
                                        <span className="tab-value">{searchParams.source || 'Search...'}</span>
                                    </div>
                                </div>
                                <div className={`modal-tab ${currentStep === 'DESTINATION' ? 'active' : ''} ${searchParams.destination ? 'completed' : ''}`} onClick={() => setCurrentStep('DESTINATION')}>
                                    <div className="tab-icon-wrapper">{searchParams.destination ? <Check size={18}/> : <MapPin size={18}/>}</div>
                                    <div className="tab-info">
                                        <span className="tab-label">Flying To</span>
                                        <span className="tab-value">{searchParams.destination || 'Destinations'}</span>
                                    </div>
                                </div>
                                <div className={`modal-tab ${currentStep === 'GUESTS' ? 'active' : ''} completed`} onClick={() => setCurrentStep('GUESTS')}>
                                    <div className="tab-icon-wrapper"><Users size={18}/></div>
                                    <div className="tab-info">
                                        <span className="tab-label">Who's Travelling?</span>
                                        <span className="tab-value">Guests x{totalGuests}</span>
                                    </div>
                                </div>
                                <div className={`modal-tab ${currentStep === 'DATES' ? 'active' : ''} ${searchParams.departureDate ? 'completed' : ''}`} onClick={() => setCurrentStep('DATES')}>
                                    <div className="tab-icon-wrapper"><Calendar size={18}/></div>
                                    <div className="tab-info">
                                        <span className="tab-label">Travelling When?</span>
                                        <span className="tab-value">{searchParams.departureDate || 'Add Dates'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Body */}
                            <div className="modal-body">
                                {(currentStep === 'SOURCE' || currentStep === 'DESTINATION') && (
                                    <div className="animate-slide-up">
                                        <div className="relative mb-8">
                                            <input 
                                                autoFocus
                                                type="text" 
                                                className="w-full text-2xl py-4 border-b border-gray-200/20 focus:border-sky-500 outline-none transition-colors bg-transparent text-white"
                                                placeholder="Search airport here..."
                                                value={searchValue}
                                                onChange={(e) => setSearchValue(e.target.value)}
                                            />
                                        </div>
                                        
                                        {Object.entries(groupedAirports).map(([category, list]) => (
                                            <div key={category} className="mb-8">
                                                <h3 className="airport-category-title text-muted">{category}</h3>
                                                {list.map(a => (
                                                    <div key={a.id} className="airport-item hover:bg-white/5 rounded-xl transition" onClick={() => {
                                                        if (currentStep === 'SOURCE') setSearchParams({...searchParams, source: a.code});
                                                        else setSearchParams({...searchParams, destination: a.code});
                                                        nextStep();
                                                    }}>
                                                        <Plane className="text-sky-500" size={20} />
                                                        <div className="airport-details">
                                                            <div className="airport-name text-white font-bold">{a.city}, {a.country}</div>
                                                            <div className="airport-subname text-gray-400">{a.name}</div>
                                                        </div>
                                                        <div className="airport-code-badge bg-white/10 text-white">{a.code}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {currentStep === 'GUESTS' && (
                                    <div className="animate-slide-up flex gap-12 text-white">
                                        <div className="flex-1">
                                            <h3 className="text-2xl font-bold mb-6">Guests</h3>
                                            {[
                                                { id: 'adults', label: 'Adults', sub: 'Age 16+ years' },
                                                { id: 'young_adults', label: 'Young Adults', sub: 'Age 12 - 16 years' },
                                                { id: 'children', label: 'Children', sub: 'Age 2 - 11 years' },
                                                { id: 'infants', label: 'Infants', sub: 'Under 2 years' }
                                            ].map(g => (
                                                <div key={g.id} className="guest-row border-b border-white/10 pb-4 mb-4 flex justify-between items-center">
                                                    <div className="guest-info">
                                                        <h4 className="font-bold">{g.label}</h4>
                                                        <p className="text-gray-400 text-sm">{g.sub}</p>
                                                    </div>
                                                    <div className="guest-controls flex items-center gap-4">
                                                        <button className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition" onClick={() => updateGuestCount(g.id, -1)} disabled={g.id === 'adults' ? guests.adults <= 1 : guests[g.id] <= 0}><Minus size={14}/></button>
                                                        <span className="text-xl font-bold w-6 text-center">{guests[g.id]}</span>
                                                        <button className="w-8 h-8 rounded-full border border-sky-500 bg-sky-500/20 text-sky-400 flex items-center justify-center hover:bg-sky-500 hover:text-white transition" onClick={() => updateGuestCount(g.id, 1)}><Plus size={14}/></button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="w-[300px]">
                                            <h3 className="text-2xl font-bold mb-6">Cabin Class</h3>
                                            {['economy', 'business'].map(c => (
                                                <div 
                                                    key={c} 
                                                    className={`cabin-class-option p-4 rounded-xl border mb-3 cursor-pointer flex justify-between items-center transition ${searchParams.cabinClass === c ? 'border-sky-500 bg-sky-500/10' : 'border-white/10 hover:bg-white/5'}`}
                                                    onClick={() => setSearchParams({...searchParams, cabinClass: c})}
                                                >
                                                    <span className="capitalize text-lg font-semibold">{c}</span>
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${searchParams.cabinClass === c ? 'border-sky-500' : 'border-gray-500'}`}>
                                                        {searchParams.cabinClass === c && <div className="w-2.5 h-2.5 bg-sky-500 rounded-full"></div>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {currentStep === 'DATES' && (
                                    <div className="animate-slide-up">
                                         <div className="flex gap-4 mb-8">
                                            {['round_trip', 'one_way'].map(t => (
                                                <button 
                                                    key={t}
                                                    className={`px-6 py-2 rounded-full font-bold transition ${searchParams.journeyType === t ? 'bg-sky-500 text-white' : 'border border-white/20 text-gray-300 hover:bg-white/5'}`}
                                                    onClick={() => setSearchParams({...searchParams, journeyType: t})}
                                                >
                                                    {t.replace('_', ' ').toUpperCase()}
                                                </button>
                                            ))}
                                        </div>
                                        
                                        <div className="flex flex-col gap-6">
                                            <div className="flex items-center gap-4">
                                                <Calendar className="text-sky-500" />
                                                <div className="flex-1">
                                                    <label className="block text-xs font-bold text-gray-400 uppercase">Departure Date</label>
                                                    <input 
                                                        type="date" 
                                                        className="w-full text-xl font-bold outline-none border-b border-white/20 bg-transparent text-white py-2 focus:border-sky-500 transition-colors"
                                                        value={searchParams.departureDate}
                                                        onChange={(e) => setSearchParams({...searchParams, departureDate: e.target.value})}
                                                    />
                                                </div>
                                                {searchParams.journeyType === 'round_trip' && (
                                                    <div className="flex-1">
                                                        <label className="block text-xs font-bold text-gray-400 uppercase">Return Date</label>
                                                        <input 
                                                            type="date" 
                                                            className="w-full text-xl font-bold outline-none border-b border-white/20 bg-transparent text-white py-2 focus:border-sky-500 transition-colors"
                                                            value={searchParams.returnDate}
                                                            onChange={(e) => setSearchParams({...searchParams, returnDate: e.target.value})}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="modal-footer border-t border-white/10 flex justify-end gap-3 pt-6 mt-6">
                                {currentStep !== 'SOURCE' && (
                                    <button className="px-6 py-2 rounded-xl border border-white/20 text-white font-bold hover:bg-white/5 transition" onClick={prevStep}>Back</button>
                                )}
                                <button className="px-8 py-2 rounded-xl bg-sky-500 text-white font-bold hover:bg-sky-600 transition" onClick={nextStep}>
                                    {currentStep === 'DATES' ? 'Search Flights' : 'Continue'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Results Section */}
                {flights.length > 0 && (
                    <div id="results-section" className="mt-16 mb-20 animate-slide-up">
                        <h2 className="text-3xl font-bold mb-8 text-main-color">Available Flights</h2>
                        <div className="flex flex-col gap-6">
                            {flights.map(item => (
                                item.type === 'PACKAGE' ? (
                                    <div key={item.id} className="glass-panel p-8 group border-l-4 border-sky-500">
                                        <div className="flex flex-col md:flex-row justify-between items-center">
                                            <div className="flex-1 flex flex-col gap-8">
                                                {/* Outbound */}
                                                <div className="flex items-center gap-12">
                                                    <div className="w-16"><span className="text-xs uppercase text-sky-400 font-bold">Outbound</span></div>
                                                    <div className="text-center">
                                                        <h3 className="text-3xl font-bold text-white">{item.outbound.source?.code}</h3>
                                                        <p className="text-gray-400">{new Date(item.outbound.departure_time).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                                    </div>
                                                    <div className="flex flex-col items-center gap-1 text-gray-400">
                                                        <span className="text-xs uppercase">{item.outbound.flight_number}</span>
                                                        <div className="w-24 h-[2px] bg-sky-500/30 relative">
                                                            <Plane className="absolute top-[-8px] left-1/2 -translate-x-1/2 text-sky-500" size={16} />
                                                        </div>
                                                    </div>
                                                    <div className="text-center">
                                                        <h3 className="text-3xl font-bold text-white">{item.outbound.destination?.code}</h3>
                                                        <p className="text-gray-400">{new Date(item.outbound.arrival_time).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                                    </div>
                                                </div>
                                                {/* Return */}
                                                <div className="flex items-center gap-12">
                                                    <div className="w-16"><span className="text-xs uppercase text-amber-400 font-bold">Return</span></div>
                                                    <div className="text-center">
                                                        <h3 className="text-3xl font-bold text-white">{item.return.source?.code}</h3>
                                                        <p className="text-gray-400">{new Date(item.return.departure_time).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                                    </div>
                                                    <div className="flex flex-col items-center gap-1 text-gray-400">
                                                        <span className="text-xs uppercase">{item.return.flight_number}</span>
                                                        <div className="w-24 h-[2px] bg-amber-500/30 relative">
                                                            <Plane className="absolute top-[-8px] left-1/2 -translate-x-1/2 text-amber-500 rotate-180" size={16} />
                                                        </div>
                                                    </div>
                                                    <div className="text-center">
                                                        <h3 className="text-3xl font-bold text-white">{item.return.destination?.code}</h3>
                                                        <p className="text-gray-400">{new Date(item.return.arrival_time).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-10 mt-6 md:mt-0 pt-6 md:pt-0 border-t md:border-t-0 border-white/10 w-full md:w-auto">
                                                <div className="text-right flex-1">
                                                    <div className="flex flex-col items-end mb-2">
                                                        {(seatStatus[item.outbound.id]?.seat_status === 'critical' || seatStatus[item.return.id]?.seat_status === 'critical') ? (
                                                            <span className="flex items-center gap-1 text-red-500 font-bold bg-red-500/10 px-3 py-1 rounded-full text-xs animate-pulse">
                                                                <AlertCircle size={14}/> 
                                                                {Math.min(seatStatus[item.outbound.id]?.available_seats || 99, seatStatus[item.return.id]?.available_seats || 99)} seats left!
                                                            </span>
                                                        ) : (seatStatus[item.outbound.id]?.seat_status === 'low' || seatStatus[item.return.id]?.seat_status === 'low') ? (
                                                            <span className="flex items-center gap-1 text-amber-500 font-bold bg-amber-500/10 px-3 py-1 rounded-full text-xs">
                                                                <AlertCircle size={14}/> Fast filling
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                    <p className="text-sm text-gray-400">package total</p>
                                                    <p className="text-4xl font-bold text-sky-400">
                                                        ${(searchParams.cabinClass === 'economy' ? (parseFloat(item.outbound.price_economy) + parseFloat(item.return.price_economy)) : (parseFloat(item.outbound.price_business) + parseFloat(item.return.price_business))).toFixed(2)}
                                                    </p>
                                                </div>
                                                <button className="btn-primary px-8 py-3 whitespace-nowrap" onClick={() => handleSelectFlight(item)}>
                                                    Book Package
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div key={item.id} className="glass-panel p-8 flex flex-col md:flex-row justify-between items-center group">
                                        <div className="flex items-center gap-12">
                                            <div className="text-center">
                                                <h3 className="text-3xl font-bold text-white">{item.source?.code}</h3>
                                                <p className="text-gray-400">{new Date(item.departure_time).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                            <div className="flex flex-col items-center gap-1 text-gray-400">
                                                <span className="text-xs uppercase">{item.flight_number}</span>
                                                <div className="w-24 h-[2px] bg-sky-500/30 relative">
                                                    <Plane className="absolute top-[-8px] left-1/2 -translate-x-1/2 text-sky-500 group-hover:left-[90%] transition-all duration-1000" size={16} />
                                                </div>
                                                <span className="text-xs">Direct</span>
                                            </div>
                                            <div className="text-center">
                                                <h3 className="text-3xl font-bold text-white">{item.destination?.code}</h3>
                                                <p className="text-gray-400">{new Date(item.arrival_time).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-10 mt-6 md:mt-0">
                                            <div className="text-right">
                                                <div className="flex flex-col items-end mb-2">
                                                    {seatStatus[item.id]?.seat_status === 'critical' ? (
                                                        <span className="flex items-center gap-1 text-red-500 font-bold bg-red-500/10 px-3 py-1 rounded-full text-xs animate-pulse">
                                                            <AlertCircle size={14}/>
                                                            Only {seatStatus[item.id]?.available_seats} seats left
                                                        </span>
                                                    ) : seatStatus[item.id]?.seat_status === 'low' ? (
                                                        <span className="flex items-center gap-1 text-amber-500 font-bold bg-amber-500/10 px-3 py-1 rounded-full text-xs">
                                                            <AlertCircle size={14}/> Few seats remaining
                                                        </span>
                                                    ) : null}
                                                </div>
                                                <p className="text-sm text-gray-400">from</p>
                                                <p className="text-4xl font-bold text-sky-400">
                                                    ${searchParams.cabinClass === 'economy' ? item.price_economy : item.price_business}
                                                </p>
                                            </div>
                                            <button className="btn-primary px-8 py-3" onClick={() => handleSelectFlight(item)}>
                                                Book Now
                                            </button>
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>
                    </div>
                )}

                {/* Deals Section */}
                <div className="mt-20 mb-20 text-main-color">
                    <h2 className="text-4xl font-light mb-2">Deals from <span className="font-bold">Johannesburg (OR Tambo), South Africa</span></h2>
                    <p className="text-lg text-white/60 mb-8">Discover where your next journey could take you.</p>
                    
                    <div className="grid md:grid-cols-4 gap-6">
                        {[
                            { name: 'Cape Town', code: 'CPT', price: '75', img: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=600&q=80', tag: 'Domestic' },
                            { name: 'London', code: 'LHR', price: '650', img: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=600&q=80', tag: 'International' },
                            { name: 'Dubai', code: 'DXB', price: '400', img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80', tag: 'Regional' },
                            { name: 'New York', code: 'JFK', price: '500', img: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=600&q=80', tag: 'International' }
                        ].map(deal => (
                            <div 
                                key={deal.name} 
                                className="glass-panel relative overflow-hidden group h-[350px] cursor-pointer"
                                onClick={() => handleDealClick(deal.code)}
                            >
                                <img src={deal.img} alt={deal.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                                <div className="absolute top-4 left-4">
                                    <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-md text-xs font-bold text-white uppercase">{deal.tag}</span>
                                </div>
                                <div className="absolute bottom-6 left-6 text-white text-left">
                                    <h3 className="text-2xl font-bold">{deal.name}</h3>
                                    <p className="text-sm text-white/70">From ${deal.price}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Other Services Section */}
                <div className="mt-24 lg:mt-32 mb-20 lg:mb-32">
                    <div className="text-center mb-20 md:mb-24">
                        <h2 className="text-3xl md:text-5xl font-black mb-6 transition-all uppercase tracking-tight">
                            MORE WAYS TO <span className="text-sky-400 font-serif italic tracking-wider">Travel with Us</span>
                        </h2>
                        <div className="w-16 md:w-20 h-1 bg-sky-500/30 mx-auto mb-8" />
                        <p className="text-base md:text-lg text-white/50 max-w-2xl mx-auto font-light mb-16 px-4">Go beyond flights — explore our full suite of premium travel services.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
                        {/* Cargo Booking */}
                        <Link to="/cargo" className="glass-panel p-8 md:p-10 group relative overflow-hidden transition-all duration-500 hover:border-sky-500/50 hover:bg-sky-500/5 flex flex-col justify-between min-h-[460px]" style={{ textDecoration: 'none' }}>
                            <div className="flex flex-col">
                                <div className="w-12 h-12 bg-sky-500/10 text-sky-400 rounded-xl flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500 self-start">
                                    <Package size={24} />
                                </div>
                                <h3 className="text-xl md:text-2xl font-black text-white mb-4 uppercase tracking-tighter">Cargo Booking</h3>
                                <p className="text-slate-300 text-sm leading-relaxed mb-8 font-light">
                                    Ship freight globally with our express cargo solutions. From perishables to heavy loads — we handle it all with precision.
                                </p>
                                <div className="flex flex-wrap gap-2 mb-8">
                                    {['Express Priority', 'Global Network', 'Live Tracking'].map(tag => (
                                        <span key={tag} className="text-[8px] md:text-[9px] px-2.5 py-1 bg-white/5 text-white/60 border border-white/5 rounded-full font-bold uppercase tracking-widest">{tag}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sky-400 font-black group-hover:gap-4 transition-all duration-300">
                                <span className="uppercase text-[10px] tracking-[0.2em]">Book Cargo</span>
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>

                        {/* Group Booking */}
                        <Link to="/group-bookings" className="glass-panel p-8 md:p-10 group relative overflow-hidden transition-all duration-500 hover:border-sky-500/50 hover:bg-sky-500/5 flex flex-col justify-between min-h-[460px]" style={{ textDecoration: 'none' }}>
                            <div className="flex flex-col">
                                <div className="w-12 h-12 bg-sky-500/10 text-sky-400 rounded-xl flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500 self-start">
                                    <Users size={24} />
                                </div>
                                <h3 className="text-xl md:text-2xl font-black text-white mb-4 uppercase tracking-tighter">Group Bookings</h3>
                                <p className="text-slate-300 text-sm leading-relaxed mb-8 font-light">
                                    Travelling with 10 or more? Unlock exclusive group rates, flexible payment options, and a dedicated travel coordinator.
                                </p>
                                <div className="flex flex-wrap gap-2 mb-8">
                                    {['10+ Passengers', 'Custom Quotes', 'Dedicated Support'].map(tag => (
                                        <span key={tag} className="text-[8px] md:text-[9px] px-2.5 py-1 bg-white/5 text-white/60 border border-white/5 rounded-full font-bold uppercase tracking-widest">{tag}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sky-400 font-black group-hover:gap-4 transition-all duration-300">
                                <span className="uppercase text-[10px] tracking-[0.2em]">Request Quote</span>
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>

                        {/* Hotel Booking */}
                        <Link to="/hotels" className="glass-panel p-8 md:p-10 group relative overflow-hidden transition-all duration-500 hover:border-sky-500/50 hover:bg-sky-500/5 flex flex-col justify-between min-h-[460px]" style={{ textDecoration: 'none' }}>
                            <div className="flex flex-col">
                                <div className="w-12 h-12 bg-sky-500/10 text-sky-400 rounded-xl flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500 self-start">
                                    <Building size={24} />
                                </div>
                                <h3 className="text-xl md:text-2xl font-black text-white mb-4 uppercase tracking-tighter">Hotel Booking</h3>
                                <p className="text-slate-300 text-sm leading-relaxed mb-8 font-light">
                                    Curated luxury stays at the world's finest hotels. From Cape Town to Singapore — find your perfect home away from home.
                                </p>
                                <div className="flex flex-wrap gap-2 mb-8">
                                    {['Luxury Stays', 'Best Rate Guarantee', 'Instant Confirmation'].map(tag => (
                                        <span key={tag} className="text-[8px] md:text-[9px] px-2.5 py-1 bg-white/5 text-white/60 border border-white/5 rounded-full font-bold uppercase tracking-widest">{tag}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sky-400 font-black group-hover:gap-4 transition-all duration-300">
                                <span className="uppercase text-[10px] tracking-[0.2em]">Browse Hotels</span>
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Booking;
