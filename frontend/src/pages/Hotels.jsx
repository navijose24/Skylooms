import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building, MapPin, Calendar, Users, Star, Search, Filter, Plane, Package, ArrowRight, ChevronRight, Heart } from 'lucide-react';

const Hotels = () => {
    const [searchQuery, setSearchQuery] = useState('');

    const hotels = [
        { id: 1, name: "The Silo Hotel", location: "Cape Town", price: 650, rating: 5, bg: "https://travellermade.com/wp-content/uploads/2012/07/TS-2.jpg" },
        { id: 2, name: "Burj Al Arab", location: "Dubai", price: 1200, rating: 5, bg: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80" },
        { id: 3, name: "The Savoy", location: "London", price: 450, rating: 4.8, bg: "https://images.unsplash.com/photo-1542314831-c6a4d14fff8e?auto=format&fit=crop&w=800&q=80" },
        { id: 4, name: "Marina Bay Sands", location: "Singapore", price: 550, rating: 4.9, bg: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80" }
    ];

    return (
        <div className="pb-20 min-h-screen selection:bg-purple-500/30">
            {/* Hero Banner */}
            <div style={{ position: 'relative', width: '100%', height: '420px', overflow: 'hidden' }}>
                <img
                    src="skylooms_hotel.jpeg"
                    alt="Skylooms Luxury Hotels"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
                />
                {/* Dark overlay for text legibility */}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.6) 70%, var(--bg-main) 100%)' }} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '80px' }}>
                    <h1 style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: 'clamp(3rem, 8vw, 7rem)', color: 'white', letterSpacing: '0.04em', textShadow: '0 4px 30px rgba(0,0,0,0.5)', lineHeight: 1 }}>
                        HOTELS
                    </h1>
                    <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(1rem, 2vw, 1.4rem)', fontStyle: 'italic', color: 'rgba(255,255,255,0.7)', marginTop: '0.75rem', letterSpacing: '0.1em' }}>
                        Curated collection of the world's most distinguished sanctuaries.
                    </p>
                </div>
            </div>

            <div className="container">
                {/* Services Navigation Hub */}
                <div className="flex flex-wrap items-center justify-center gap-3 mb-16 md:mb-24 -mt-10 relative z-20 px-4">
                    {[
                        { to: '/book', icon: Plane, label: 'Flights', color: 'text-sky-400' },
                        { to: '/hotels', icon: Building, label: 'Hotels', color: 'text-purple-400', active: true },
                        { to: '/cargo', icon: Package, label: 'Cargo', color: 'text-amber-500' },
                        { to: '/group-bookings', icon: Users, label: 'Groups', color: 'text-emerald-400' }
                    ].map((item) => (
                        <Link 
                            key={item.label}
                            to={item.to} 
                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl backdrop-blur-xl border transition-all duration-500 ${
                                item.active 
                                ? 'bg-purple-500 text-white border-purple-400 font-bold shadow-xl shadow-purple-500/20 scale-105' 
                                : 'bg-[var(--glass-bg)] text-main-color border-[var(--glass-border)] font-bold hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            <item.icon size={18} className={item.active ? 'text-white' : item.color} />
                            <span className="uppercase text-[10px] tracking-widest text-inherit">{item.label}</span>
                        </Link>
                    ))}
                </div>

                {/* Search Bar */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="max-w-6xl mx-auto mb-20"
                >
                    <div className="grid md:grid-cols-12 gap-0 overflow-hidden glass-panel border-[var(--glass-border)] shadow-2xl items-center p-2 rounded-[2.5rem]">
                        <div className="md:col-span-4 p-6 flex items-center gap-4 transition-colors hover:bg-white/5 rounded-3xl">
                            <MapPin size={24} className="text-purple-500 shrink-0"/>
                            <div className="flex-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted block mb-1">Destination</span>
                                <input 
                                    type="text" 
                                    className="w-full bg-transparent border-none outline-none text-main-color text-lg font-bold placeholder:text-muted/40" 
                                    placeholder="Search Global Stays" 
                                    value={searchQuery} 
                                    onChange={(e) => setSearchQuery(e.target.value)} 
                                />
                            </div>
                        </div>
                        <div className="md:col-span-3 p-6 flex items-center gap-4 transition-colors hover:bg-white/5 rounded-3xl">
                            <Calendar size={24} className="text-purple-500 shrink-0"/>
                            <div className="flex-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted block mb-1">Check-in</span>
                                <input type="date" className="w-full bg-transparent border-none outline-none text-main-color text-lg font-bold appearance-none" />
                            </div>
                        </div>
                        <div className="md:col-span-3 p-6 flex items-center gap-4 transition-colors hover:bg-white/5 rounded-3xl">
                            <Calendar size={24} className="text-purple-500 shrink-0"/>
                            <div className="flex-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted block mb-1">Check-out</span>
                                <input type="date" className="w-full bg-transparent border-none outline-none text-main-color text-lg font-bold appearance-none" />
                            </div>
                        </div>
                        <div className="md:col-span-2 p-2">
                            <button className="w-full bg-purple-500 hover:bg-purple-600 text-white font-black py-6 rounded-3xl transition-all shadow-lg shadow-purple-500/20 uppercase text-xs tracking-widest flex items-center justify-center gap-2 group active:scale-95">
                                <Search size={18} />
                                <span>Find Stay</span>
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12 border-b border-[var(--glass-border)] pb-10">
                    <div>
                        <h2 className="text-3xl md:text-5xl font-black text-main-color uppercase tracking-tighter mb-4">Marketplace</h2>
                        <p className="text-muted text-sm max-w-md">Find the perfect sanctuary from our curated world-class collection.</p>
                    </div>
                    <button className="flex items-center gap-3 px-6 py-4 border border-[var(--glass-border)] rounded-2xl hover:bg-white/5 transition-all text-xs font-black uppercase tracking-widest text-muted group">
                        <Filter size={18} className="group-hover:rotate-180 transition-transform duration-500" /> 
                        <span>Fine Tuning</span>
                    </button>
                </div>

                {/* Results Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {hotels.filter(h => h.location.toLowerCase().includes(searchQuery.toLowerCase()) || h.name.toLowerCase().includes(searchQuery.toLowerCase())).map((hotel, i) => (
                        <motion.div 
                            key={hotel.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="glass-panel group cursor-pointer overflow-hidden rounded-[2rem] border-white/5 hover:border-purple-500/40 transition-all duration-500"
                        >
                            <div className="relative h-64 overflow-hidden">
                                <img src={hotel.bg} alt={hotel.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                                
                                <div className="absolute top-6 left-6">
                                    <div className="bg-black/40 backdrop-blur-xl px-4 py-2 rounded-full flex items-center gap-2 border border-white/10">
                                        <Star size={14} className="text-purple-400 fill-purple-400"/>
                                        <span className="text-[10px] font-black text-white tracking-widest uppercase">{hotel.rating} Rating</span>
                                    </div>
                                </div>

                                <button className="absolute top-6 right-6 p-3 bg-black/40 backdrop-blur-xl rounded-full text-white/40 border border-white/10 hover:text-red-400 transition-colors">
                                    <Heart size={16} />
                                </button>

                                <div className="absolute bottom-6 left-6 right-6">
                                    <p className="text-[10px] font-black text-purple-400 uppercase tracking-[0.3em] mb-2">{hotel.location}</p>
                                    <h3 className="text-2xl font-black text-white group-hover:translate-x-1 transition-transform">{hotel.name}</h3>
                                </div>
                            </div>
                            
                            <div className="p-8">
                                <div className="flex justify-between items-center mb-8">
                                    <div>
                                        <p className="text-[10px] text-muted uppercase font-black tracking-widest mb-1">Standard Rate</p>
                                        <div className="flex items-end gap-1">
                                            <span className="text-3xl font-black text-main-color">${hotel.price}</span>
                                            <span className="text-xs font-bold text-muted mb-1">/ NIGHT</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        {[1, 2, 3, 4, 5].map(s => <div key={s} className="w-1 h-1 bg-purple-500/40 rounded-full" />)}
                                    </div>
                                </div>
                                <button className="w-full py-5 bg-white text-black hover:bg-purple-500 hover:text-white transition-all font-black rounded-2xl flex items-center justify-center gap-2 uppercase text-[10px] tracking-[0.2em] shadow-xl group/btn">
                                    View Avails <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Hotels;
