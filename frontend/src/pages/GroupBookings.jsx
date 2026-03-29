import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Building, Mail, Phone, Calendar, MapPin, Plane, Package, Check, ArrowRight, ChevronRight, Sparkles } from 'lucide-react';

const GroupBookings = () => {
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '',
        groupSize: '', source: '', destination: '',
        date: '', details: ''
    });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="pb-20 min-h-screen selection:bg-emerald-500/30">
            {/* Hero Banner */}
            <div style={{ position: 'relative', width: '100%', height: '420px', overflow: 'hidden' }}>
                <img
                    src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1920&q=80"
                    alt="Skylooms Group Travel"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
                />
                {/* Dark overlay for text legibility */}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.6) 70%, var(--bg-main) 100%)' }} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '80px' }}>
                    <h1 style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: 'clamp(3rem, 8vw, 7rem)', color: 'white', letterSpacing: '0.04em', textShadow: '0 4px 30px rgba(0,0,0,0.5)', lineHeight: 1 }}>
                        GROUP TRAVEL
                    </h1>
                    <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(1rem, 2vw, 1.4rem)', fontStyle: 'italic', color: 'rgba(255,255,255,0.7)', marginTop: '0.75rem', letterSpacing: '0.1em' }}>
                        Exclusive rates and dedicated support for your core team.
                    </p>
                </div>
            </div>

            <div className="container">
                {/* Services Navigation Hub */}
                <div className="flex flex-wrap items-center justify-center gap-3 mb-16 md:mb-24 -mt-10 relative z-20 px-4">
                    {[
                        { to: '/book', icon: Plane, label: 'Flights', color: 'text-sky-400' },
                        { to: '/hotels', icon: Building, label: 'Hotels', color: 'text-purple-400' },
                        { to: '/cargo', icon: Package, label: 'Cargo', color: 'text-amber-500' },
                        { to: '/group-bookings', icon: Users, label: 'Groups', color: 'text-emerald-400', active: true }
                    ].map((item) => (
                        <Link 
                            key={item.label}
                            to={item.to} 
                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl backdrop-blur-xl border transition-all duration-500 ${
                                item.active 
                                ? 'bg-emerald-500 text-black border-emerald-400 font-bold shadow-xl shadow-emerald-500/20 scale-105' 
                                : 'bg-[var(--glass-bg)] text-main-color border-[var(--glass-border)] font-bold hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            <item.icon size={18} className={item.active ? 'text-black' : item.color} />
                            <span className="uppercase text-[10px] tracking-widest text-inherit">{item.label}</span>
                        </Link>
                    ))}
                </div>

                <div className="max-w-4xl mx-auto">
                    {submitted ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass-panel p-16 text-center border-emerald-500/30 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full -mr-32 -mt-32" />
                            <div className="w-24 h-24 bg-emerald-500/20 text-emerald-400 rounded-full mx-auto flex items-center justify-center mb-10 shadow-xl shadow-emerald-500/20">
                                <Sparkles size={48} />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black mb-6 text-main-color uppercase tracking-tighter">Request Transmitted</h2>
                            <p className="text-lg text-muted max-w-2xl mx-auto mb-10 leading-relaxed font-serif italic">
                                Our specialized coordination team is already reviewing your details. Expect a custom-crafted itinerary and quote within the next 24 business hours.
                            </p>
                            <button 
                                className="bg-emerald-500 hover:bg-emerald-600 text-black font-black px-10 py-4 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 uppercase text-xs tracking-widest" 
                                onClick={() => setSubmitted(false)}
                            >
                                Submit New Request
                            </button>
                        </motion.div>
                    ) : (
                        <motion.form 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="glass-panel p-8 md:p-16 relative overflow-hidden border-[var(--glass-border)]" 
                            onSubmit={handleSubmit}
                        >
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 border-b border-[var(--glass-border)] pb-10">
                                <div>
                                    <h2 className="text-3xl md:text-5xl font-black text-main-color uppercase tracking-tighter mb-4">Request Quote</h2>
                                    <p className="text-muted text-sm max-w-md">Planning for 10 or more? Unlock the full Skylooms group advantage.</p>
                                </div>
                                <div className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
                                    Specialized Support Inc.
                                </div>
                            </div>

                            <div className="flex flex-col gap-16 py-4">
                                {/* Section: Contact Info */}
                                <div className="group/section">
                                    <h3 className="text-[10px] font-black text-muted uppercase tracking-[0.4em] mb-12 pb-6 border-b border-[var(--glass-border)] group-focus-within/section:text-emerald-500 transition-colors">Personal Information</h3>
                                    <div className="grid md:grid-cols-2 gap-x-12 gap-y-16">
                                        <div className="flex flex-col gap-4 group">
                                            <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-1 group-focus-within:text-emerald-500 transition-colors">Full Name</label>
                                            <div className="relative">
                                                <Users className="absolute left-6 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-emerald-500 transition-colors" size={20}/>
                                                <input type="text" className="w-full bg-white/5 border border-[var(--glass-border)] rounded-3xl pl-16 pr-8 py-7 outline-none focus:border-emerald-500/50 text-main-color font-black text-xl transition-all placeholder:text-muted/10" required 
                                                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Primary Contact Name" />
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-4 group">
                                            <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-1 group-focus-within:text-emerald-500 transition-colors">Company / Group</label>
                                            <div className="relative">
                                                <Building className="absolute left-6 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-emerald-500 transition-colors" size={20}/>
                                                <input type="text" className="w-full bg-white/5 border border-[var(--glass-border)] rounded-3xl pl-16 pr-8 py-7 outline-none focus:border-emerald-500/50 text-main-color font-black text-xl transition-all placeholder:text-muted/10"
                                                    placeholder="Organization Name" />
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-4 group">
                                            <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-1 group-focus-within:text-emerald-500 transition-colors">Email Address</label>
                                            <div className="relative">
                                                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-emerald-500 transition-colors" size={20}/>
                                                <input type="email" className="w-full bg-white/5 border border-[var(--glass-border)] rounded-3xl pl-16 pr-8 py-7 outline-none focus:border-emerald-500/50 text-main-color font-black text-xl transition-all placeholder:text-muted/10" required 
                                                    value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="email@domain.com" />
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-4 group">
                                            <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-1 group-focus-within:text-emerald-500 transition-colors">Phone Line</label>
                                            <div className="relative">
                                                <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-emerald-500 transition-colors" size={20}/>
                                                <input type="tel" className="w-full bg-white/5 border border-[var(--glass-border)] rounded-3xl pl-16 pr-8 py-7 outline-none focus:border-emerald-500/50 text-main-color font-black text-xl transition-all placeholder:text-muted/10" required 
                                                    value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+1 (000) 000-0000" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section: Trip Details */}
                                <div className="group/section">
                                    <h3 className="text-[10px] font-black text-muted uppercase tracking-[0.4em] mb-12 pb-6 border-b border-[var(--glass-border)] group-focus-within/section:text-emerald-500 transition-colors">Itinerary Details</h3>
                                    <div className="grid md:grid-cols-2 gap-x-12 gap-y-16">
                                        <div className="flex flex-col gap-4 group">
                                            <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-1 group-focus-within:text-emerald-500 transition-colors">Departure City</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-emerald-500 transition-colors" size={20}/>
                                                <input type="text" className="w-full bg-white/5 border border-[var(--glass-border)] rounded-3xl pl-16 pr-8 py-7 outline-none focus:border-emerald-500/50 text-main-color font-black text-xl transition-all placeholder:text-muted/10" required 
                                                    value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})} placeholder="e.g. JNB" />
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-4 group">
                                            <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-1 group-focus-within:text-emerald-500 transition-colors">Arrival City</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-emerald-500 transition-colors" size={20}/>
                                                <input type="text" className="w-full bg-white/5 border border-[var(--glass-border)] rounded-3xl pl-16 pr-8 py-7 outline-none focus:border-emerald-500/50 text-main-color font-black text-xl transition-all placeholder:text-muted/10" required 
                                                    value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} placeholder="e.g. LHR" />
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-4 group">
                                            <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-1 group-focus-within:text-emerald-500 transition-colors">Preferred Date</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-emerald-500 transition-colors" size={20}/>
                                                <input type="date" className="w-full bg-white/5 border border-[var(--glass-border)] rounded-3xl pl-16 pr-8 py-7 outline-none focus:border-emerald-500/50 text-main-color font-black text-xl transition-all" required 
                                                    value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-4 group">
                                            <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-1 group-focus-within:text-emerald-500 transition-colors">Group Size</label>
                                            <div className="relative">
                                                <Users className="absolute left-6 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-emerald-500 transition-colors" size={20}/>
                                                <input type="number" min="10" className="w-full bg-white/5 border border-[var(--glass-border)] rounded-3xl pl-16 pr-8 py-7 outline-none focus:border-emerald-500/50 text-main-color text-3xl font-black transition-all" required 
                                                    value={formData.groupSize} onChange={e => setFormData({...formData, groupSize: e.target.value})} placeholder="10" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Custom Requests</label>
                                    <textarea className="w-full bg-white/5 border border-[var(--glass-border)] rounded-3xl px-6 py-5 outline-none focus:border-emerald-500/50 text-main-color transition-all h-40 resize-none font-serif italic text-lg opacity-80"
                                        value={formData.details} onChange={e => setFormData({...formData, details: e.target.value})} placeholder="Describe any specific needs, meal constraints, or equipment requirements..."></textarea>
                                </div>

                                <button 
                                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-black py-7 rounded-3xl transition-all text-[12px] shadow-xl shadow-emerald-500/20 uppercase tracking-[0.4em] flex items-center justify-center gap-4 group active:scale-95 mt-4"
                                >
                                    Generate Group Offer <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </motion.form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GroupBookings;
