import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Search, Loader2, Plane, MapPin, Calendar, Users, ChevronRight, ArrowRight, X, Briefcase, Clock, Compass, Ticket, RotateCw, AlertCircle, Info, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import HeroScroll from '../components/HeroScroll';

const Skylooms = () => {
    const navigate = useNavigate();
    const { searchParams, setSearchParams } = useBooking();
    const [loading, setLoading] = useState(false);
    const [airports, setAirports] = useState([]);
    const [activeFeature, setActiveFeature] = useState('BOOKING'); // BOOKING, CANCEL, RETRIEVE, STATUS
    const [statusQuery, setStatusQuery] = useState('');
    const [pnrValue, setPnrValue] = useState('');
    const [statusResult, setStatusResult] = useState(null);
    const [isSourceOpen, setIsSourceOpen] = useState(false);
    const [isDestOpen, setIsDestOpen] = useState(false);
    const [sourceSearch, setSourceSearch] = useState('');
    const [destSearch, setDestSearch] = useState('');

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

    const handleFeatureAction = () => {
        if (activeFeature === 'BOOKING') {
            navigate('/book');
        } else if (activeFeature === 'CANCEL') {
            navigate(`/cancel/${pnrValue}`);
        } else if (activeFeature === 'RETRIEVE') {
            navigate(`/manage?pnr=${pnrValue}`);
        } else if (activeFeature === 'STATUS') {
            fetchStatus();
        }
    };

    const fetchStatus = async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:8000/api/flights/status/?query=${statusQuery}`);
            if (res.ok) {
                const data = await res.json();
                setStatusResult(data);
            }
        } catch (err) {
            console.error("Failed to fetch status", err);
        } finally {
            setLoading(false);
        }
    };

    const features = [
        { id: 'BOOKING', icon: Search, label: 'Search Flights', desc: 'Secure the lowest fares to 130+ destinations across the globe.' },
        { id: 'CANCEL', icon: RotateCw, label: 'Cancellation', desc: 'Manage changes or cancel your booking with full refund support.' },
        { id: 'RETRIEVE', icon: Ticket, label: 'Retrieve Ticket', desc: 'Download your e-tickets or check-in for your upcoming flight.' },
        { id: 'STATUS', icon: Clock, label: 'Flight Status', desc: 'Real-time arrival and departure updates for all SkyLooms flights.' },
    ];

    const ActiveFeature = features.find(f => f.id === activeFeature);
    const ActiveIcon = ActiveFeature?.icon;

    const filteredSources = airports.filter(a => 
        a.city.toLowerCase().includes(sourceSearch.toLowerCase()) || 
        a.code.toLowerCase().includes(sourceSearch.toLowerCase())
    );

    const filteredDests = airports.filter(a => 
        a.city.toLowerCase().includes(destSearch.toLowerCase()) || 
        a.code.toLowerCase().includes(destSearch.toLowerCase())
    );

    return (
        <div className="bg-[var(--bg-main)] min-h-screen text-[var(--text-main)] overflow-x-hidden">
            {/* Hero Section with Scroll Animation */}
            <HeroScroll />

            {/* Transition Section */}
            <div className="container relative z-20 py-12 md:py-20 px-4 md:px-6">
                <div className="text-center mb-12">
                    <motion.h2 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-4xl md:text-7xl font-light mb-6"
                    >
                        THE FUTURE OF <span className="font-bold text-sky-400 font-serif italic uppercase tracking-wider">Aviation</span>
                    </motion.h2>
                    <motion.div 
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        transition={{ duration: 1.5, delay: 0.3 }}
                        className="w-32 md:w-48 h-1 bg-sky-500/30 mx-auto" 
                    />
                </div>

                {/* Features Navigation Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-12 md:mb-16">
                    {features.map((f, i) => (
                        <motion.div
                            key={f.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`glass-panel p-6 md:p-8 cursor-pointer transition-all duration-500 relative group border-[var(--glass-border)] ${activeFeature === f.id ? 'border-sky-500 bg-sky-500/5' : 'hover:bg-white/5 border-[var(--glass-border)]'}`}
                            onClick={() => setActiveFeature(f.id)}
                        >
                            {activeFeature === f.id && (
                                <motion.div layoutId="featureActive" className="absolute top-0 left-0 right-0 h-1 bg-sky-500" />
                            )}
                            <f.icon className={`mb-4 md:mb-6 transition-colors duration-500 ${activeFeature === f.id ? 'text-sky-400 scale-110' : 'text-muted group-hover:text-main-color'}`} size={32} />
                            <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-3 text-main-color">{f.label}</h3>
                            <p className="text-muted text-xs md:text-sm leading-relaxed">{f.desc}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Content Area Based on Active Feature */}
                <motion.div 
                    layout
                    className="glass-panel p-6 md:p-12 min-h-[360px] flex flex-col items-center justify-center relative overflow-hidden transition-all duration-500"
                >
                    <div className="absolute bottom-4 right-4 opacity-[0.04] pointer-events-none hidden md:block">
                        {ActiveIcon && <ActiveIcon size={180} />}
                    </div>

                    <div className={`w-full relative z-10 text-center mx-auto ${activeFeature === 'STATUS' ? 'max-w-5xl' : 'max-w-2xl'}`}>
                        <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-main-color">{ActiveFeature?.label}</h2>

                        {activeFeature === 'BOOKING' && (
                            <div className="space-y-6 md:space-y-8">
                                <p className="text-lg md:text-xl text-muted">Find the best deals on flights across the world.</p>
                                <div className="flex flex-col md:flex-row gap-4">
                                    {/* Departure Selection */}
                                    <div className="flex-1 relative">
                                        <div 
                                            className="bg-white/5 rounded-2xl p-4 border border-[var(--glass-border)] text-left cursor-pointer hover:bg-white/10 transition group"
                                            onClick={() => { setIsSourceOpen(!isSourceOpen); setIsDestOpen(false); }}
                                        >
                                            <span className="text-xs text-sky-400 font-bold uppercase tracking-widest block mb-1">Departure</span>
                                            <span className="text-xl md:text-2xl font-bold text-main-color">{searchParams.source || 'Select Origin'}</span>
                                        </div>
                                        {isSourceOpen && (
                                            <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--bg-accent)] border border-[var(--glass-border)] rounded-2xl shadow-2xl z-50 max-h-64 overflow-y-auto p-2 scrollbar-hide animate-slide-up">
                                                <input 
                                                    autoFocus
                                                    className="w-full bg-white/5 border-b border-[var(--glass-border)] p-3 mb-2 outline-none text-sm rounded-xl focus:bg-white/10 text-main-color"
                                                    placeholder="Search city or code..."
                                                    value={sourceSearch}
                                                    onChange={e => setSourceSearch(e.target.value)}
                                                />
                                                {filteredSources.map(a => (
                                                    <div key={a.id} className="p-3 hover:bg-sky-500/20 rounded-xl cursor-pointer transition text-left flex justify-between items-center" onClick={() => { setSearchParams({...searchParams, source: a.code}); setIsSourceOpen(false); }}>
                                                        <div>
                                                            <div className="font-bold text-main-color text-sm">{a.city}</div>
                                                            <div className="text-[10px] text-muted">{a.name}</div>
                                                        </div>
                                                        <div className="bg-white/10 text-main-color px-2 py-1 rounded text-[10px] font-bold">{a.code}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Destination Selection */}
                                    <div className="flex-1 relative">
                                        <div 
                                            className="bg-white/5 rounded-2xl p-4 border border-[var(--glass-border)] text-left cursor-pointer hover:bg-white/10 transition group"
                                            onClick={() => { setIsDestOpen(!isDestOpen); setIsSourceOpen(false); }}
                                        >
                                            <span className="text-xs text-sky-400 font-bold uppercase tracking-widest block mb-1">Destination</span>
                                            <span className="text-xl md:text-2xl font-bold text-main-color">{searchParams.destination || 'Search Destination'}</span>
                                        </div>
                                        {isDestOpen && (
                                            <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--bg-accent)] border border-[var(--glass-border)] rounded-2xl shadow-2xl z-50 max-h-64 overflow-y-auto p-2 scrollbar-hide animate-slide-up">
                                                <input 
                                                    autoFocus
                                                    className="w-full bg-white/5 border-b border-[var(--glass-border)] p-3 mb-2 outline-none text-sm rounded-xl focus:bg-white/10 text-main-color"
                                                    placeholder="Search city or code..."
                                                    value={destSearch}
                                                    onChange={e => setDestSearch(e.target.value)}
                                                />
                                                {filteredDests.map(a => (
                                                    <div key={a.id} className="p-3 hover:bg-sky-500/20 rounded-xl cursor-pointer transition text-left flex justify-between items-center" onClick={() => { setSearchParams({...searchParams, destination: a.code}); setIsDestOpen(false); }}>
                                                        <div>
                                                            <div className="font-bold text-main-color text-sm">{a.city}</div>
                                                            <div className="text-[10px] text-muted">{a.name}</div>
                                                        </div>
                                                        <div className="bg-white/10 text-main-color px-2 py-1 rounded text-[10px] font-bold">{a.code}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <button 
                                    className="btn-primary px-12 py-4 rounded-full text-lg w-full md:w-auto shadow-2xl shadow-sky-500/20 active:scale-95 transition-all" 
                                    onClick={() => navigate('/book')}
                                >
                                    Search Flights Now
                                </button>
                            </div>
                        )}

                        {(activeFeature === 'CANCEL' || activeFeature === 'RETRIEVE') && (
                            <div className="space-y-6">
                                <p className="text-base md:text-lg text-muted">Please enter your 6-digit PNR reference number below.</p>
                                <div className="relative group mx-auto max-w-sm">
                                    <input 
                                        type="text"
                                        placeholder="ABC123"
                                        value={pnrValue}
                                        onChange={(e) => setPnrValue(e.target.value.toUpperCase())}
                                        className="w-full bg-white/5 border-2 border-[var(--glass-border)] rounded-2xl p-4 text-3xl text-center font-black tracking-[0.4em] text-main-color focus:border-sky-500 outline-none transition uppercase placeholder:text-muted/20"
                                        maxLength={6}
                                    />
                                    {pnrValue.length > 0 && (
                                        <motion.button 
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-sky-500 rounded-lg"
                                            onClick={() => setPnrValue('')}
                                        >
                                            <X size={20} />
                                        </motion.button>
                                    )}
                                </div>
                                <button 
                                    className="btn-primary px-8 py-3 rounded-full text-base w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-sky-500/10"
                                    disabled={pnrValue.length < 6}
                                    onClick={handleFeatureAction}
                                >
                                    {activeFeature === 'CANCEL' ? 'Proceed to Cancellation' : 'Retrieve Booking'}
                                </button>
                            </div>
                        )}

                        {activeFeature === 'STATUS' && (
                            <div className="space-y-8">
                                <p className="text-xl text-muted">Search by Flight Number or Route (e.g. SL701 or JNB-CPT)</p>
                                <div className="flex gap-4 max-w-xl mx-auto">
                                    <input 
                                        type="text"
                                        placeholder="Flight ID or Route"
                                        value={statusQuery}
                                        onChange={(e) => setStatusQuery(e.target.value.toUpperCase())}
                                        className="flex-1 bg-white/5 border border-[var(--glass-border)] rounded-2xl p-4 text-xl font-bold focus:border-sky-500 outline-none transition text-main-color"
                                    />
                                    <button 
                                        className="bg-sky-500 text-white rounded-2xl px-6 py-4 hover:bg-sky-600 transition disabled:opacity-50"
                                        onClick={fetchStatus}
                                        disabled={loading || !statusQuery}
                                    >
                                        {loading ? <Loader2 className="animate-spin" /> : <Search />}
                                    </button>
                                </div>

                                {statusResult && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-[#0b101e] border border-white/5 rounded-2xl p-6 text-left flex flex-col md:flex-row gap-8 lg:gap-16 w-full shadow-2xl items-center mt-8 cursor-default"
                                    >
                                        {/* Left Side: Identifiers */}
                                        <div className="flex flex-col gap-1 w-full md:w-auto shrink-0 md:min-w-[120px]">
                                            <div className="flex items-center gap-2 text-white font-bold">
                                                <Plane size={16} className="text-[#1da1f2]" />
                                                <span>{statusResult.flight_number}</span>
                                            </div>
                                            <span className="text-white/50 text-[10px] uppercase tracking-[0.2em] font-bold">{statusResult.aircraft}</span>
                                        </div>

                                        {/* Center Left: Route/Times */}
                                        <div className="flex items-center justify-between xl:justify-center gap-6 md:gap-8 flex-1 w-full">
                                            <div className="flex flex-col items-center md:items-start gap-1">
                                                <h4 className="text-4xl lg:text-5xl font-black text-white">{statusResult.source?.code}</h4>
                                                <span className="text-white/60 text-[10px] uppercase tracking-widest">{statusResult.source?.city}</span>
                                                <span className="text-white font-bold mt-2 text-lg">{statusResult.departure_time || '--:--'}</span>
                                            </div>

                                            <div className="flex flex-col items-center gap-2 mx-4">
                                                <span className="text-white/80 font-bold text-[10px] tracking-[0.2em]">{statusResult.status}</span>
                                                <Plane size={24} className="text-[#1da1f2]" />
                                                <span className="text-[#1da1f2] font-bold text-[10px] uppercase tracking-[0.3em] whitespace-nowrap">NON-STOP</span>
                                            </div>

                                            <div className="flex flex-col items-center md:items-end gap-1 text-right">
                                                <h4 className="text-4xl lg:text-5xl font-black text-white">{statusResult.destination?.code}</h4>
                                                <span className="text-white/60 text-[10px] uppercase tracking-widest">{statusResult.destination?.city}</span>
                                                <span className="text-white font-bold mt-2 text-lg">{statusResult.arrival_time || '--:--'}</span>
                                            </div>
                                        </div>

                                        {/* Right Side: Details list & Button */}
                                        <div className="flex flex-col w-full md:w-[280px] lg:w-[320px] shrink-0 gap-4 mt-6 md:mt-0 pt-6 md:pt-0 border-t md:border-t-0 border-white/10 md:pl-8 md:border-l">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-white/50">Terminal</span>
                                                <span className="font-bold text-white">{statusResult.terminal}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-white/50">Gate</span>
                                                <span className="font-bold text-white">{statusResult.gate}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-white/50">Speed</span>
                                                <span className="font-bold text-white">{statusResult.speed}</span>
                                            </div>
                                            
                                            <button 
                                                className="w-full bg-[#0b5c87] hover:bg-sky-400 text-white font-bold py-3 mt-2 rounded-xl transition flex items-center justify-center gap-2 text-sm shadow-[0_4px_20px_rgba(29,161,242,0.3)] relative z-20 cursor-pointer"
                                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/flight/${statusResult.flight_number}`); }}
                                            >
                                                Flight Details <ArrowRight size={16} />
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Showcase Section */}
            <section className="container py-20 md:py-32 px-4 md:px-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className="text-left"
                    >
                        <h3 className="text-sky-400 font-bold uppercase tracking-[0.3em] mb-4 text-sm md:text-base">The Experience</h3>
                        <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight text-main-color">Elevated Beyond <br/>Compare</h2>
                        <p className="text-lg text-muted mb-10 leading-relaxed max-w-xl">
                            Every SkyLooms flight is an invitation to discovery. From our meticulously crafted cabins to our world-class hospitality, we don't just bridge cities; we connect dreams.
                        </p>
                        <div className="grid grid-cols-2 gap-8 lg:gap-12">
                            <div>
                                <h4 className="text-3xl md:text-4xl font-black text-main-color mb-2">130+</h4>
                                <p className="text-muted text-[10px] md:text-xs uppercase font-bold tracking-widest">Global Destinations</p>
                            </div>
                            <div>
                                <h4 className="text-3xl md:text-4xl font-black text-main-color mb-2">24/7</h4>
                                <p className="text-muted text-[10px] md:text-xs uppercase font-bold tracking-widest">Expert Care</p>
                            </div>
                        </div>
                    </motion.div>
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="relative w-full max-w-2xl mx-auto"
                    >
                        <div className="absolute -inset-6 md:-inset-10 bg-sky-500/10 blur-[60px] md:blur-[100px] rounded-full" />
                        <img 
                            src="https://images.stockcake.com/public/f/b/6/fb6acf1b-fcaa-4152-b48b-6b0e2b0c5374_large/airplane-mid-flight-stockcake.jpg" 
                            alt="Skylooms Experience" 
                            className="rounded-3xl lg:rounded-[2.5rem] shadow-2xl relative z-10 border border-[var(--glass-border)] w-full object-cover aspect-video max-h-[450px]"
                        />
                    </motion.div>
                </div>
            </section>

            {/* Stats / Proof Section */}
            <section className="bg-sky-500/5 py-16 md:py-32 border-y border-[var(--glass-border)] px-4">
                <div className="container grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
                    {[
                        { val: '4.9/5', label: 'Safety Rating' },
                        { val: '1.2M', label: 'Yearly Travelers' },
                        { val: '99.8%', label: 'Arrival Precision' },
                        { val: '0ms', label: 'Average Delay' }
                    ].map((s, i) => (
                        <div key={i}>
                            <h3 className="text-3xl md:text-5xl font-black text-sky-400 mb-2">{s.val}</h3>
                            <p className="text-muted text-[10px] md:text-xs uppercase font-black tracking-[0.2em]">{s.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Final CTA */}
            <section className="container py-12 md:py-24 text-center px-4 md:px-0">
                <div className="glass-panel p-8 md:p-16 lg:p-20 relative overflow-hidden bg-gradient-to-br from-sky-600/20 to-indigo-600/10 rounded-[1.5rem] lg:rounded-[2.5rem] max-w-4xl mx-auto flex flex-col items-center justify-center border-[var(--glass-border)]">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
                    <h2 className="text-3xl md:text-5xl font-black mb-4 md:mb-6 relative z-10 leading-tight text-center text-main-color">THE SKY IS CALLING.</h2>
                    <p className="text-base md:text-xl text-muted mb-8 md:mb-10 max-w-xl relative z-10 px-4 text-center w-full">Answer it with SkyLooms. Experience the pinnacle of modern travel.</p>
                    <button className="btn-primary px-8 md:px-12 py-3 md:py-4 rounded-full text-base md:text-lg relative z-10 hover:scale-105 transition-all shadow-xl shadow-sky-500/20 active:scale-95" onClick={() => navigate('/book')}>
                        Start Your Journey
                    </button>
                    <div className="absolute -bottom-16 -left-16 w-32 md:w-48 h-32 md:h-48 bg-sky-500/20 blur-[60px] md:blur-[80px] rounded-full" />
                    <div className="absolute -top-16 -right-16 w-32 md:w-48 h-32 md:h-48 bg-indigo-500/20 blur-[60px] md:blur-[80px] rounded-full" />
                </div>
            </section>

            {/* Minimal Footer */}
            <footer className="container py-12 border-t border-[var(--glass-border)] flex justify-between items-center opacity-40">
                <div className="text-xl font-bold tracking-tighter text-main-color">SKYLOOMS</div>
                <div className="text-xs font-bold uppercase tracking-widest text-main-color">© 2026 SkyLooms International</div>
            </footer>
        </div>
    );
};

export default Skylooms;
