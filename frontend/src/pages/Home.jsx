import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, Plane, MapPin, Calendar, Users, ChevronDown, Repeat, X, ArrowLeft, Plus, Minus, Check } from 'lucide-react';
import { useBooking } from '../context/BookingContext';

const Home = () => {
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

    const navigate = useNavigate();

    useEffect(() => {
        fetchAirports();
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

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setIsModalOpen(false);

        const dur = (new Date(searchParams.returnDate) - new Date(searchParams.departureDate)) / (1000 * 3600 * 24);
        setDurationDays(dur > 0 ? dur : 0);

        try {
            const sourceParam = searchParams.source ? `source=${searchParams.source}&` : '';
            const destParam = searchParams.destination ? `destination=${searchParams.destination}&` : '';
            const res = await fetch(`http://localhost:8000/api/flights/search/?${sourceParam}${destParam}`);
            if (res.ok) {
                const data = await res.json();
                setFlights(data);
                // Scroll to results
                setTimeout(() => {
                    document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectFlight = (flight) => {
        setSelectedFlights([flight]);
        const dur = (new Date(searchParams.returnDate) - new Date(searchParams.departureDate)) / (1000 * 3600 * 24);
        if (searchParams.journeyType === 'round_trip' && dur > 1) {
            navigate('/recommendations');
        } else {
            navigate('/checkout');
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
        a.name.toLowerCase().includes(searchValue.toLowerCase()) || 
        a.code.toLowerCase().includes(searchValue.toLowerCase()) ||
        a.city.toLowerCase().includes(searchValue.toLowerCase())
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
        <div className="flex-col">
            {/* Hero Section */}
            <section className="hero" style={{ backgroundImage: 'url(/hero.png)' }}>
            </section>

            <div className="container">
                {/* Visual Search Card Trigger */}
                <div className="search-card-container">
                    <div className="grid md:grid-cols-4 gap-0 border rounded-2xl overflow-hidden cursor-pointer bg-white shadow-xl">
                        <div className="p-4 border-r hover:bg-gray-50 transition" onClick={() => openStep('SOURCE')}>
                            <span className="search-input-label flex items-center gap-1"><Plane size={14}/> Flying From</span>
                            <div className="search-input-value mt-1">{searchParams.source || 'Search airport'}</div>
                        </div>
                        <div className="p-4 border-r hover:bg-gray-50 transition" onClick={() => openStep('DESTINATION')}>
                            <span className="search-input-label flex items-center gap-1"><MapPin size={14}/> Flying To</span>
                            <div className="search-input-value mt-1">{searchParams.destination || 'Destinations'}</div>
                        </div>
                        <div className="p-4 border-r hover:bg-gray-50 transition" onClick={() => openStep('GUESTS')}>
                            <span className="search-input-label flex items-center gap-1"><Users size={14}/> Who's Travelling?</span>
                            <div className="search-input-value mt-1">{totalGuests} Guest{totalGuests > 1 ? 's' : ''}, {searchParams.cabinClass}</div>
                        </div>
                        <div className="p-4 hover:bg-gray-50 transition" onClick={() => openStep('DATES')}>
                            <span className="search-input-label flex items-center gap-1"><Calendar size={14}/> Travelling When?</span>
                            <div className="search-input-value mt-1">{searchParams.departureDate || 'Add Dates'}</div>
                        </div>
                    </div>
                </div>

                {/* MODAL SEARCH FLOW */}
                {isModalOpen && (
                    <div className="modal-overlay">
                        <div className="search-modal">
                            <div className="close-overlay" onClick={() => setIsModalOpen(false)}><X size={24}/></div>
                            
                            {/* Modal Header Tabs */}
                            <div className="modal-header">
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
                                                className="w-full text-2xl py-4 border-b border-gray-200 focus:border-red-500 outline-none transition-colors"
                                                placeholder="Search airport here..."
                                                value={searchValue}
                                                onChange={(e) => setSearchValue(e.target.value)}
                                            />
                                        </div>
                                        
                                        {Object.entries(groupedAirports).map(([category, list]) => (
                                            <div key={category} className="mb-8">
                                                <h3 className="airport-category-title">{category}</h3>
                                                {list.map(a => (
                                                    <div key={a.id} className="airport-item" onClick={() => {
                                                        if (currentStep === 'SOURCE') setSearchParams({...searchParams, source: a.code});
                                                        else setSearchParams({...searchParams, destination: a.code});
                                                        nextStep();
                                                    }}>
                                                        <Plane className="text-red-600" size={20} />
                                                        <div className="airport-details">
                                                            <div className="airport-name">{a.city}, {a.country}</div>
                                                            <div className="airport-subname">{a.name}</div>
                                                        </div>
                                                        <div className="airport-code-badge">{a.code}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {currentStep === 'GUESTS' && (
                                    <div className="animate-slide-up flex gap-12">
                                        <div className="flex-1">
                                            <h3 className="text-2xl font-bold mb-6">Guests</h3>
                                            {[
                                                { id: 'adults', label: 'Adults', sub: 'Age 16+ years' },
                                                { id: 'young_adults', label: 'Young Adults', sub: 'Age 12 - 16 years' },
                                                { id: 'children', label: 'Children', sub: 'Age 2 - 11 years' },
                                                { id: 'infants', label: 'Infants', sub: 'Under 2 years' }
                                            ].map(g => (
                                                <div key={g.id} className="guest-row">
                                                    <div className="guest-info">
                                                        <h4>{g.label}</h4>
                                                        <p>{g.sub}</p>
                                                    </div>
                                                    <div className="guest-controls">
                                                        <button className="counter-btn" onClick={() => updateGuestCount(g.id, -1)} disabled={g.id === 'adults' ? guests.adults <= 1 : guests[g.id] <= 0}><Minus size={18}/></button>
                                                        <span className="text-xl font-bold w-6 text-center">{guests[g.id]}</span>
                                                        <button className="counter-btn active" onClick={() => updateGuestCount(g.id, 1)}><Plus size={18}/></button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="w-[300px]">
                                            <h3 className="text-2xl font-bold mb-6">Cabin Class</h3>
                                            {['economy', 'business'].map(c => (
                                                <div 
                                                    key={c} 
                                                    className={`cabin-class-option ${searchParams.cabinClass === c ? 'selected' : ''}`}
                                                    onClick={() => setSearchParams({...searchParams, cabinClass: c})}
                                                >
                                                    <span className="capitalize text-lg font-semibold">{c}</span>
                                                    <div className="radio-circle"></div>
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
                                                    className={`px-6 py-2 rounded-full font-bold transition ${searchParams.journeyType === t ? 'bg-indigo-950 text-white' : 'border'}`}
                                                    onClick={() => setSearchParams({...searchParams, journeyType: t})}
                                                >
                                                    {t.replace('_', ' ').toUpperCase()}
                                                </button>
                                            ))}
                                        </div>
                                        
                                        <div className="flex flex-col gap-6">
                                            <div className="flex items-center gap-4">
                                                <Calendar className="text-indigo-900" />
                                                <div className="flex-1">
                                                    <label className="block text-xs font-bold text-gray-400 uppercase">Departure Date</label>
                                                    <input 
                                                        type="date" 
                                                        className="w-full text-xl font-bold outline-none border-b py-2 focus:border-red-500"
                                                        value={searchParams.departureDate}
                                                        onChange={(e) => setSearchParams({...searchParams, departureDate: e.target.value})}
                                                    />
                                                </div>
                                                {searchParams.journeyType === 'round_trip' && (
                                                    <div className="flex-1">
                                                        <label className="block text-xs font-bold text-gray-400 uppercase">Return Date</label>
                                                        <input 
                                                            type="date" 
                                                            className="w-full text-xl font-bold outline-none border-b py-2 focus:border-red-500"
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
                            <div className="modal-footer">
                                {currentStep !== 'SOURCE' && (
                                    <button className="btn-ghost" onClick={prevStep}>Back</button>
                                )}
                                <button className="btn-dark" onClick={nextStep}>
                                    {currentStep === 'DATES' ? 'Search Flights' : 'Continue'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Deals Section */}
                <div className="mt-16 mb-20 text-white">
                    <h2 className="text-4xl font-light mb-2">Deals from <span className="font-bold">Johannesburg (OR Tambo), South Africa</span></h2>
                    <p className="text-lg text-white/60 mb-8">Discover where your next journey could take you.</p>
                    
                    <div className="grid md:grid-cols-4 gap-6">
                        {[
                            { name: 'Cape Town', price: '75', img: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=600&q=80', tag: 'Domestic' },
                            { name: 'London', price: '650', img: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=600&q=80', tag: 'International' },
                            { name: 'Dubai', price: '400', img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80', tag: 'Regional' },
                            { name: 'New York', price: '500', img: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=600&q=80', tag: 'International' }
                        ].map(deal => (
                            <div key={deal.name} className="glass-panel relative overflow-hidden group h-[350px] cursor-pointer">
                                <img src={deal.img} alt={deal.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                                <div className="absolute top-4 left-4">
                                    <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-md text-xs font-bold uppercase">{deal.tag}</span>
                                </div>
                                <div className="absolute bottom-6 left-6 text-white text-left">
                                    <h3 className="text-2xl font-bold">{deal.name}</h3>
                                    <p className="text-sm text-white/70">From ${deal.price}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Results Section */}
                {flights.length > 0 && (
                    <div id="results-section" className="mt-12 mb-20 animate-slide-up">
                        <h2 className="text-3xl font-bold mb-8 text-white">Available Flights</h2>
                        <div className="flex-col gap-6">
                            {flights.map(flight => (
                                <div key={flight.id} className="glass-panel p-8 flex flex-col md:flex-row justify-between items-center group">
                                    <div className="flex items-center gap-12">
                                        <div className="text-center">
                                            <h3 className="text-3xl font-bold">{flight.source?.code}</h3>
                                            <p className="text-muted">{new Date(flight.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                        <div className="flex flex-col items-center gap-1 text-muted">
                                            <span className="text-xs uppercase">{flight.flight_number}</span>
                                            <div className="w-24 h-[2px] bg-sky-500/30 relative">
                                                <Plane className="absolute top-[-8px] left-1/2 -translate-x-1/2 text-sky-500 group-hover:left-[90%] transition-all duration-1000" size={16} />
                                            </div>
                                            <span className="text-xs">Direct</span>
                                        </div>
                                        <div className="text-center">
                                            <h3 className="text-3xl font-bold">{flight.destination?.code}</h3>
                                            <p className="text-muted">{new Date(flight.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-10 mt-6 md:mt-0">
                                        <div className="text-right">
                                            <p className="text-sm text-muted">from</p>
                                            <p className="text-4xl font-bold text-sky-400">
                                                ${searchParams.cabinClass === 'economy' ? flight.price_economy : flight.price_business}
                                            </p>
                                        </div>
                                        <button className="btn-primary px-8 py-3" onClick={() => handleSelectFlight(flight)}>
                                            Book Now
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
