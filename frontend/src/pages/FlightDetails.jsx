import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Plane, MapPin, Wind, Activity, Zap, CheckCircle2, PlaneTakeoff, PlaneLanding, Navigation } from 'lucide-react';

const FlightDetails = () => {
    const { flightId } = useParams();
    const navigate = useNavigate();
    const [flight, setFlight] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch the simulated status data using the flight number
        const fetchFlight = async () => {
            try {
                const res = await fetch(`http://localhost:8000/api/flights/status/?query=${flightId}`);
                if (res.ok) {
                    const data = await res.json();
                    setFlight(data);
                }
            } catch (err) {
                console.error("Failed to fetch flight", err);
            } finally {
                setLoading(false);
            }
        };
        fetchFlight();
    }, [flightId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center text-white">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="text-sky-500">
                    <Zap size={48} />
                </motion.div>
            </div>
        );
    }

    if (!flight) {
        return (
            <div className="min-h-screen bg-[var(--bg-main)] flex flex-col items-center justify-center text-white">
                <h1 className="text-3xl font-bold mb-4">Flight Not Found</h1>
                <button onClick={() => navigate(-1)} className="text-sky-400 hover:text-sky-300">Go Back</button>
            </div>
        );
    }

    const isLive = flight.status === 'IN AIR' || flight.status === 'DELAYED' || flight.status === 'LANDED';
    const progress = flight.progress || 0;

    return (
        <div className="min-h-[100vh] bg-[var(--bg-main)] text-white pt-24 pb-20 selection:bg-sky-500/30">
            {/* Top Navigation */}
            <div className="container px-4 mb-8">
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-white/50 hover:text-white transition-colors uppercase text-xs font-bold tracking-widest"
                >
                    <ChevronLeft size={16} /> Back to Search
                </button>
            </div>

            <div className="container px-4">
                <div className="grid lg:grid-cols-3 gap-8 items-start">
                    
                    {/* Main Tracker Column */}
                    <div className="lg:col-span-2 flex flex-col gap-8 w-full">
                        
                        {/* Status Header & Tracking UI */}
                        <div className="glass-panel p-8 md:p-12 relative overflow-hidden backdrop-blur-xl border border-[var(--glass-border)] rounded-[2.5rem]">
                            {/* Decorative background lines */}
                            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #1da1f2 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                            
                            {/* Header row */}
                            <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-start gap-6 mb-16">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="bg-[#1da1f2]/10 border border-[#1da1f2]/20 text-[#1da1f2] p-2.5 rounded-xl">
                                            <Plane size={24} />
                                        </div>
                                        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white mb-0">{flight.flight_number}</h1>
                                    </div>
                                    <div className="flex items-center gap-3 text-white/60 text-sm ml-1">
                                        <span className="uppercase tracking-widest font-bold text-white/80">{flight.aircraft}</span>
                                        <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                                        <span>Operated by Skylooms</span>
                                    </div>
                                </div>
                                
                                <div className={`px-6 py-2.5 rounded-full border flex items-center gap-3 backdrop-blur-md self-start ${flight.status === 'ON TIME' || flight.status === 'LANDED' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : flight.status === 'DELAYED' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-[#1da1f2]/10 border-[#1da1f2]/20 text-[#1da1f2]'}`}>
                                    {isLive && flight.status !== 'LANDED' && <div className="w-2.5 h-2.5 bg-current rounded-full animate-pulse shadow-[0_0_10px_currentColor] shrink-0" />}
                                    <span className="font-bold tracking-widest text-xs uppercase">{flight.status}</span>
                                </div>
                            </div>

                            {/* Tracking Progress Bar */}
                            <div className="relative z-10 hidden md:block mb-16 px-4">
                                <div className="h-1.5 w-full bg-white/5 rounded-full relative overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className={`absolute top-0 left-0 bottom-0 ${flight.status === 'ON TIME' || flight.status === 'LANDED' ? 'bg-emerald-500' : flight.status === 'DELAYED' ? 'bg-amber-500' : 'bg-[#1da1f2]'}`}
                                    />
                                </div>
                                {/* Plane indicator on track */}
                                <motion.div 
                                    className="absolute top-1/2 -mt-4 bg-[#0b101e] border-2 border-[#1da1f2] shadow-[0_0_20px_rgba(29,161,242,0.4)] rounded-full p-1 z-20"
                                    initial={{ left: 0 }}
                                    animate={{ left: `calc(${progress}% - 16px)` }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                >
                                    <Plane size={16} className="text-[#1da1f2]" />
                                </motion.div>
                                
                                {/* Waypoints markers */}
                                <div className="absolute top-1/2 -mt-1.5 left-4 w-3 h-3 rounded-full bg-white/20 z-10 hover:bg-white transition" />
                                <div className="absolute top-1/2 -mt-1.5 right-4 w-3 h-3 rounded-full border-2 border-white/20 bg-transparent z-10" />
                            </div>

                            {/* Route Time & Terminal Details */}
                            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12 md:gap-4 px-2">
                                {/* Origin Details */}
                                <div className="flex flex-col text-center md:text-left flex-1 items-center md:items-start group">
                                    <span className="text-[#1da1f2] text-[10px] font-black uppercase tracking-[0.2em] mb-3 flex items-center justify-center md:justify-start gap-2 bg-[#1da1f2]/10 px-3 py-1 rounded-full"><PlaneTakeoff size={14} /> Origin</span>
                                    <h2 className="text-6xl lg:text-7xl font-black text-white mb-2 leading-none tracking-tighter">{flight.source?.code}</h2>
                                    <p className="text-white/60 font-bold uppercase tracking-widest text-xs mb-6">{flight.source?.city}</p>
                                    
                                    <span className="text-3xl font-black text-white bg-white/5 px-6 py-3 rounded-2xl inline-block mb-3 border border-white/5 group-hover:bg-white/10 transition">{flight.departure_time}</span>
                                    
                                    <div className="flex gap-6 text-sm justify-center md:justify-start">
                                        <div className="flex flex-col gap-1 items-center md:items-start"><span className="text-white/40 uppercase text-[10px] tracking-widest font-bold">Terminal</span><span className="font-bold text-white text-lg">1</span></div>
                                        <div className="flex flex-col gap-1 items-center md:items-start"><span className="text-white/40 uppercase text-[10px] tracking-widest font-bold">Gate</span><span className="font-bold text-white text-lg">{flight.gate}</span></div>
                                    </div>
                                </div>

                                {/* Center divider mobile */}
                                <div className="md:hidden w-full h-[1px] bg-white/10" />

                                {/* Destination Details */}
                                <div className="flex flex-col text-center md:text-right flex-1 items-center md:items-end group">
                                    <span className="text-[#1da1f2] text-[10px] font-black uppercase tracking-[0.2em] mb-3 flex items-center justify-center md:justify-end gap-2 bg-[#1da1f2]/10 px-3 py-1 rounded-full"><PlaneLanding size={14} /> Destination</span>
                                    <h2 className="text-6xl lg:text-7xl font-black text-white mb-2 leading-none tracking-tighter">{flight.destination?.code}</h2>
                                    <p className="text-white/60 font-bold uppercase tracking-widest text-xs mb-6">{flight.destination?.city}</p>
                                    
                                    <span className="text-3xl font-black text-white bg-white/5 px-6 py-3 rounded-2xl inline-block mb-3 border border-white/5 group-hover:bg-white/10 transition">{flight.arrival_time}</span>
                                    
                                    <div className="flex gap-6 text-sm justify-center md:justify-end">
                                        <div className="flex flex-col gap-1 items-center md:items-end"><span className="text-white/40 uppercase text-[10px] tracking-widest font-bold">Terminal</span><span className="font-bold text-white text-lg">{flight.terminal}</span></div>
                                        <div className="flex flex-col gap-1 items-center md:items-end"><span className="text-white/40 uppercase text-[10px] tracking-widest font-bold">Gate</span><span className="font-bold text-white text-lg">-</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side Info Column */}
                    <div className="flex flex-col gap-6 w-full lg:col-span-1">
                        
                        {/* Telemetry Module */}
                        <div className="glass-panel border border-[var(--glass-border)] rounded-[2rem] p-8 backdrop-blur-xl">
                            <h3 className="text-sm font-black text-white/80 uppercase tracking-widest mb-8 flex items-center gap-3">
                                <div className="p-2 bg-[#1da1f2]/10 rounded-lg text-[#1da1f2]"><Activity size={16} /></div> Telemetry Data
                            </h3>
                            
                            <div className="space-y-6">
                                <div className="flex flex-col gap-2 pb-5 border-b border-white/5">
                                    <div className="flex items-center gap-2 text-white/40 text-[10px] uppercase font-bold tracking-widest">
                                        <Navigation size={14} /> Altitude
                                    </div>
                                    <span className="font-mono text-2xl font-black text-white">{flight.altitude}</span>
                                    <div className="w-full bg-white/5 h-1 rounded flex">
                                        <div className="h-full bg-sky-500 rounded" style={{ width: flight.altitude === '-' ? '0%' : '75%' }} />
                                    </div>
                                </div>
                                
                                <div className="flex flex-col gap-2 pb-5 border-b border-white/5">
                                    <div className="flex items-center gap-2 text-white/40 text-[10px] uppercase font-bold tracking-widest">
                                        <Wind size={14} /> Ground Speed
                                    </div>
                                    <span className="font-mono text-2xl font-black text-white">{flight.speed}</span>
                                    <div className="w-full bg-white/5 h-1 rounded flex">
                                        <div className="h-full bg-amber-500 rounded" style={{ width: flight.speed === '0 km/h' ? '0%' : '80%' }} />
                                    </div>
                                </div>
                                
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2 text-white/40 text-[10px] uppercase font-bold tracking-widest">
                                        <MapPin size={14} /> Distance Map
                                    </div>
                                    <span className="font-mono text-xl font-bold text-white/80">
                                        {flight.progress > 0 && flight.progress < 100 ? `${100 - flight.progress}% Remaining` : (flight.status === 'LANDED' ? 'Arrived' : 'Not Departed')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Notifications Card */}
                        <div className="glass-panel border border-emerald-500/20 bg-emerald-500/5 rounded-[2rem] p-8 relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
                            <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                            <h3 className="text-sm font-black text-emerald-500 uppercase tracking-widest mb-4 flex items-center gap-2 relative z-10">
                                <CheckCircle2 size={16} /> Subscribed to Alerts
                            </h3>
                            <p className="text-white/60 text-sm relative z-10 leading-relaxed font-light mb-8">
                                SMS & Email alerts enabled for gate changes, delays &gt; 15m, and arrival notifications.
                            </p>
                            <button className="w-full bg-black/40 hover:bg-black/60 border border-white/10 text-white font-bold py-4 rounded-xl transition text-[10px] uppercase tracking-[0.2em] relative z-10 flex items-center justify-center gap-2">
                                Configure <span className="opacity-50 mx-1">|</span> Stop Alerts
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default FlightDetails;
