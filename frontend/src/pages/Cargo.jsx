import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Scale, MapPin, Calendar, Clock, Plane as PlaneTakeoff, Truck, Plane, Building, Users, ArrowRight, ChevronRight, CheckCircle2 } from 'lucide-react';

const Cargo = () => {
    const [step, setStep] = useState(1);
    const [trackingNumber, setTrackingNumber] = useState('');

    return (
        <div className="pb-20 min-h-screen selection:bg-amber-500/30">
            {/* Hero Banner */}
            <div style={{ position: 'relative', width: '100%', height: '420px', overflow: 'hidden' }}>
                <img
                    src="https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&w=1920&q=80"
                    alt="Skylooms Cargo"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
                />
                {/* Dark overlay for text legibility */}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.6) 70%, var(--bg-main) 100%)' }} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '80px' }}>
                    <h1 style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: 'clamp(3rem, 8vw, 7rem)', color: 'white', letterSpacing: '0.04em', textShadow: '0 4px 30px rgba(0,0,0,0.5)', lineHeight: 1 }}>
                        CARGO
                    </h1>
                    <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(1rem, 2vw, 1.4rem)', fontStyle: 'italic', color: 'rgba(255,255,255,0.7)', marginTop: '0.75rem', letterSpacing: '0.1em' }}>
                        Precision logistics for a world that never stops.
                    </p>
                </div>
            </div>

            <div className="container">
                {/* Services Navigation Hub */}
                <div className="flex flex-wrap items-center justify-center gap-3 mb-16 md:mb-24 -mt-10 relative z-20 px-4">
                    {[
                        { to: '/book', icon: Plane, label: 'Flights', color: 'text-sky-400' },
                        { to: '/hotels', icon: Building, label: 'Hotels', color: 'text-purple-400' },
                        { to: '/cargo', icon: Package, label: 'Cargo', color: 'text-amber-500', active: true },
                        { to: '/group-bookings', icon: Users, label: 'Groups', color: 'text-emerald-400' }
                    ].map((item) => (
                        <Link 
                            key={item.label}
                            to={item.to} 
                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl backdrop-blur-xl border transition-all duration-500 ${
                                item.active 
                                ? 'bg-amber-500 text-black border-amber-400 font-bold shadow-xl shadow-amber-500/20 scale-105' 
                                : 'bg-[var(--glass-bg)] text-main-color border-[var(--glass-border)] font-bold hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            <item.icon size={18} className={item.active ? 'text-black' : item.color} />
                            <span className="uppercase text-[10px] tracking-widest text-inherit">{item.label}</span>
                        </Link>
                    ))}
                </div>

                <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
                    {/* Left Side: Stats & Tracking */}
                    <div className="lg:col-span-5 space-y-8">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="glass-panel p-8 relative overflow-hidden group border-[var(--glass-border)]"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-amber-500/20 transition-all duration-700" />
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-amber-500/20 text-amber-500 rounded-xl">
                                    <Truck size={24} />
                                </div>
                                <h2 className="text-xl font-black text-main-color uppercase tracking-tight">Track Parcel</h2>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        className="w-full bg-white/5 border border-[var(--glass-border)] rounded-xl px-4 py-4 outline-none focus:border-amber-500/50 text-main-color font-mono uppercase tracking-[0.2em] transition-all" 
                                        placeholder="AWB-883920"
                                        value={trackingNumber}
                                        onChange={(e) => setTrackingNumber(e.target.value)}
                                    />
                                </div>
                                <button className="w-full bg-amber-500 hover:bg-amber-600 text-black font-black py-4 rounded-xl transition-all active:scale-95 shadow-lg shadow-amber-500/20 uppercase text-xs tracking-widest">
                                    Locate Shipment
                                </button>
                            </div>
                        </motion.div>

                        <div className="glass-panel p-8 border-[var(--glass-border)]">
                            <h3 className="text-xs font-black text-amber-500 uppercase tracking-[0.3em] mb-6">Cargo Advantages</h3>
                            <div className="space-y-6">
                                {[
                                    { icon: Clock, title: 'Express Priority', desc: 'Guaranteed next-flight-out boarding.' },
                                    { icon: Scale, title: 'Mass Capacity', desc: 'Heavy & oversized cargo expertise.' },
                                    { icon: Package, title: 'Safe Handling', desc: 'Perishable & high-value protection.' }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-4">
                                        <item.icon size={20} className="text-muted shrink-0" />
                                        <div>
                                            <h4 className="text-main-color font-bold text-sm mb-1">{item.title}</h4>
                                            <p className="text-muted text-xs leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Booking Flow */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="lg:col-span-7 glass-panel p-8 md:p-12 relative overflow-hidden border-[var(--glass-border)]"
                    >
                        <div className="flex justify-between items-end mb-12">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-black text-main-color uppercase tracking-tighter mb-2">Request Quote</h2>
                                <p className="text-muted text-sm">Real-time freight estimations for global routes.</p>
                            </div>
                            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full text-xs font-bold text-muted">
                                <CheckCircle2 size={14} className="text-amber-500" />
                                <span>Secured Portal</span>
                            </div>
                        </div>

                        {/* Progress Stepper */}
                        <div className="flex items-center justify-between mb-16 relative px-8 max-w-2xl mx-auto">
                            <div className="absolute top-5 left-8 right-8 h-[1px] bg-[var(--glass-border)]" />
                            <div 
                                className="absolute top-5 left-8 h-[1px] bg-amber-500 transition-all duration-700 shadow-[0_0_15px_rgba(245,158,11,0.5)]" 
                                style={{ width: `calc(${(step - 1) * 50}% - ${(step === 1 ? 0 : 32)}px)` }} 
                            />
                            
                            {[
                                { num: 1, label: 'Origin' },
                                { num: 2, label: 'Details' },
                                { num: 3, label: 'Pricing' }
                            ].map((s) => (
                                <div key={s.num} className="relative z-10 flex flex-col items-center gap-4">
                                    <div 
                                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-500 ${
                                            step >= s.num 
                                            ? 'bg-amber-500 text-black scale-110 shadow-[0_0_20px_rgba(245,158,11,0.3)]' 
                                            : 'bg-[var(--bg-accent)] text-muted border border-[var(--glass-border)]'
                                        }`}
                                    >
                                        {s.num}
                                    </div>
                                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] transition-colors duration-500 ${step >= s.num ? 'text-amber-500' : 'text-muted'}`}>
                                        {s.label}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {step === 1 && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#111424]/60 border border-[var(--glass-border)] rounded-[2rem] p-6 lg:p-8 shadow-2xl backdrop-blur-md">
                                <div className="flex items-center gap-3 mb-8">
                                    <button className="px-6 py-2.5 rounded-full border border-[var(--glass-border)] text-[10px] uppercase font-black tracking-widest text-amber-500 bg-amber-500/10 transition-colors">Route Mapping</button>
                                    <button className="px-6 py-2.5 rounded-full border border-transparent text-[10px] uppercase font-bold tracking-widest text-muted hover:bg-white/5 transition-colors">AWB Search</button>
                                </div>
                                
                                <div className="flex flex-col lg:flex-row gap-4 lg:items-end w-full">
                                    <div className="flex-[1.2] flex flex-col gap-2 group w-full">
                                        <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-1 group-focus-within:text-amber-500 transition-colors">Origin Port</label>
                                        <div className="relative">
                                            <input type="text" className="w-full bg-white/5 border border-[var(--glass-border)] rounded-2xl pl-5 pr-5 py-4 outline-none focus:border-amber-500/50 text-main-color transition-all uppercase font-bold tracking-widest text-sm placeholder:text-muted/30" placeholder="e.g. JNB" />
                                        </div>
                                    </div>
                                    <div className="flex-[1.2] flex flex-col gap-2 group w-full">
                                        <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-1 group-focus-within:text-amber-500 transition-colors">Target Port</label>
                                        <div className="relative">
                                            <input type="text" className="w-full bg-white/5 border border-[var(--glass-border)] rounded-2xl pl-5 pr-5 py-4 outline-none focus:border-amber-500/50 text-main-color transition-all uppercase font-bold tracking-widest text-sm placeholder:text-muted/30" placeholder="e.g. LHR" />
                                        </div>
                                    </div>
                                    <div className="flex-1 flex flex-col gap-2 group w-full">
                                        <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-1 group-focus-within:text-amber-500 transition-colors">Dispatch Date</label>
                                        <div className="relative">
                                            <input type="date" className="w-full bg-white/5 border border-[var(--glass-border)] rounded-2xl pl-5 pr-5 py-4 outline-none focus:border-amber-500/50 text-main-color transition-all font-bold text-sm text-muted" />
                                        </div>
                                    </div>
                                    <div className="lg:mb-0 mt-4 lg:mt-0">
                                        <button onClick={() => setStep(2)} className="w-full lg:w-auto px-8 py-4 bg-amber-500 hover:bg-amber-600 text-black font-black rounded-2xl transition-all shadow-lg shadow-amber-500/20 uppercase text-[11px] tracking-[0.2em] whitespace-nowrap h-[54px] flex items-center justify-center gap-2">
                                            Next Phase <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-16">
                                <div className="grid md:grid-cols-2 gap-x-12 gap-y-16">
                                    <div className="flex flex-col gap-4 group">
                                        <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-1 group-focus-within:text-amber-500 transition-colors">Gross Mass (KG)</label>
                                        <div className="relative">
                                            <Scale className="absolute left-6 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-amber-500 transition-colors" size={20}/>
                                            <input type="number" className="w-full bg-white/5 border border-[var(--glass-border)] rounded-3xl pl-16 pr-8 py-7 outline-none focus:border-amber-500/50 text-main-color transition-all font-black text-3xl placeholder:text-muted/10" placeholder="0.0" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-4 group">
                                        <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-1 group-focus-within:text-amber-500 transition-colors">Commodity Category</label>
                                        <div className="relative">
                                            <Package className="absolute left-6 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-amber-500 transition-colors" size={20}/>
                                            <select className="w-full bg-white/5 border border-[var(--glass-border)] rounded-3xl pl-16 pr-12 py-7 outline-none focus:border-amber-500/50 text-main-color font-black text-xl appearance-none cursor-pointer">
                                                <option className="bg-[var(--bg-accent)]">General Freight</option>
                                                <option className="bg-[var(--bg-accent)]">Perishables</option>
                                                <option className="bg-[var(--bg-accent)]">Valuables</option>
                                                <option className="bg-[var(--bg-accent)]">Hazmat</option>
                                            </select>
                                            <ChevronRight className="absolute right-8 top-1/2 -translate-y-1/2 text-muted rotate-90 pointer-events-none" size={20} />
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-8">
                                    {['Length', 'Width', 'Height'].map((dim) => (
                                        <div key={dim} className="flex flex-col gap-4 group">
                                            <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-1 group-focus-within:text-amber-500 transition-colors">{dim} (CM)</label>
                                            <input type="number" className="w-full bg-white/5 border border-[var(--glass-border)] rounded-3xl px-8 py-7 outline-none focus:border-amber-500/50 text-main-color font-black text-xl transition-all" placeholder="0" />
                                        </div>
                                    ))}
                                </div>
                                <div className="flex flex-col md:flex-row gap-6 pt-8">
                                    <button onClick={() => setStep(1)} className="px-16 py-7 border border-[var(--glass-border)] hover:bg-white/5 rounded-3xl text-muted font-black transition-all uppercase text-[12px] tracking-[0.4em]">Go Back</button>
                                    <button onClick={() => setStep(3)} className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-black py-7 rounded-3xl transition-all shadow-2xl shadow-amber-500/30 uppercase text-[12px] tracking-[0.4em]">Calculate Rates</button>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="border border-[var(--glass-border)] rounded-3xl p-8 md:p-12 bg-white/5 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[100px] rounded-full -mr-32 -mt-32" />
                                <div className="text-center relative z-10">
                                    <h3 className="text-xs font-black text-amber-500 uppercase tracking-[0.4em] mb-4">Estimated Premium Quote</h3>
                                    <div className="flex items-center justify-center gap-4 mb-10">
                                        <span className="text-2xl text-muted">$</span>
                                        <span className="text-7xl md:text-8xl font-black text-main-color tracking-tighter">450.00</span>
                                        <span className="text-sm font-black text-muted uppercase tracking-widest">USD</span>
                                    </div>
                                    
                                    <div className="max-w-md mx-auto grid grid-cols-1 gap-4 mb-12">
                                        {[
                                            { label: 'Network Path', val: 'JNB ✈ LHR' },
                                            { label: 'Total Weight', val: '150 KG' },
                                            { label: 'Transit Time', val: '2-3 Global Days' }
                                        ].map((stat, i) => (
                                            <div key={i} className="flex justify-between items-center px-6 py-4 bg-white/5 rounded-xl border border-[var(--glass-border)] hover:border-white/10 transition-colors">
                                                <span className="text-[10px] font-black text-muted uppercase tracking-widest">{stat.label}</span>
                                                <span className="text-sm font-bold text-main-color uppercase">{stat.val}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-4 max-w-lg mx-auto">
                                        <button onClick={() => setStep(2)} className="flex-1 px-8 py-5 border border-[var(--glass-border)] hover:bg-white/10 rounded-2xl text-main-color font-black transition-all uppercase text-xs tracking-widest">Adjust Props</button>
                                        <button className="flex-1 bg-white text-black hover:bg-amber-500 transition-all font-black py-5 rounded-2xl shadow-xl uppercase text-xs tracking-widest">Secure Booking</button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Cargo;
