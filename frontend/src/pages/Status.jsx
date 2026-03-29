import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plane, Clock, MapPin, Loader2, ArrowRight } from 'lucide-react';

const Status = () => {
    const navigate = useNavigate();
    const [searchType, setSearchType] = useState('route');
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [flightNo, setFlightNo] = useState('');

    const handleCheckStatus = () => {
        let query = '';
        if (searchType === 'route') {
            if (!origin || !destination) return;
            query = `${origin.toUpperCase()}-${destination.toUpperCase()}`;
        } else {
            if (!flightNo) return;
            query = flightNo.toUpperCase();
        }
        navigate(`/flight/${query}`);
    };

    return (
        <div className="container py-20 animate-slide-up">
            <h1 className="text-5xl font-bold mb-4">Flight Status</h1>
            <p className="text-xl text-muted mb-12">Track your flight with real-time updates up to two days in advance.</p>

            <div className="glass-panel p-12 max-w-4xl mx-auto mb-20">
                <div className="flex gap-4 mb-10">
                    {['route', 'flightNumber'].map(type => (
                        <button 
                            key={type}
                            className={`px-8 py-3 rounded-full font-bold transition ${searchType === type ? 'bg-indigo-950 text-white shadow-xl' : 'border border-sky-500/20 text-muted'}`}
                            onClick={() => setSearchType(type)}
                        >
                            {type === 'route' ? 'Track by Route' : 'Track by Flight Number'}
                        </button>
                    ))}
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                    {searchType === 'route' ? (
                        <>
                            <div className="flex-1">
                                <label className="block text-xs uppercase font-bold text-muted mb-2 ml-1">From</label>
                                <input type="text" placeholder="Origin (e.g. LHR)" value={origin} onChange={(e) => setOrigin(e.target.value)} className="input-field" />
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs uppercase font-bold text-muted mb-2 ml-1">To</label>
                                <input type="text" placeholder="Destination (e.g. JNB)" value={destination} onChange={(e) => setDestination(e.target.value)} className="input-field" />
                            </div>
                        </>
                    ) : (
                        <div className="flex-1">
                            <label className="block text-xs uppercase font-bold text-muted mb-2 ml-1">Flight Number</label>
                            <input type="text" placeholder="e.g. SL743" value={flightNo} onChange={(e) => setFlightNo(e.target.value)} className="input-field" />
                        </div>
                    )}
                    <div className="flex-shrink-0">
                         <label className="block text-xs uppercase font-bold text-muted mb-2 ml-1">Departure Date</label>
                        <input type="date" className="input-field min-w-[200px]" defaultValue={new Date().toISOString().split('T')[0]} />
                    </div>
                    <button 
                        className="btn-primary mt-6 md:mt-0 flex items-center justify-center gap-2 px-10 self-end h-[50px] disabled:opacity-50"
                        onClick={handleCheckStatus}
                        disabled={searchType === 'route' ? (!origin || !destination) : !flightNo}
                    >
                        <Search size={18}/> Check Status
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-8">
                {[
                    { id: 'SL101', from: 'London', fromCode: 'LHR', to: 'Johannesburg', toCode: 'JNB', time: '10:00', status: 'On Time', type: 'Boeing 787-9' },
                    { id: 'SL202', from: 'Cape Town', fromCode: 'CPT', to: 'Johannesburg', toCode: 'JNB', time: '12:30', status: 'Delayed', type: 'Airbus A350' },
                    { id: 'SL303', from: 'Dubai', fromCode: 'DXB', to: 'Johannesburg', toCode: 'JNB', time: '11:15', status: 'Arrived', type: 'Boeing 777' }
                ].map((f, i) => (
                    <div key={i} className="glass-panel group overflow-hidden hover:border-sky-500/30 transition-all duration-500">
                        <div className="flex flex-col md:flex-row h-full">
                            <div className="p-8 flex-1 border-r border-sky-500/10">
                                <div className="flex justify-between items-start mb-10">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-sky-500/10 p-2 rounded-lg text-sky-400">
                                            <Plane size={20}/>
                                        </div>
                                        <div>
                                            <p className="font-bold text-main-color tracking-wider">{f.id}</p>
                                            <p className="text-xs text-muted uppercase tracking-widest">{f.type}</p>
                                        </div>
                                    </div>
                                    <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${
                                        f.status === 'On Time' ? 'bg-green-500/10 text-green-500' : 
                                        f.status === 'Delayed' ? 'bg-amber-500/10 text-amber-500' : 
                                        'bg-sky-500/10 text-sky-500'
                                    }`}>
                                        {f.status}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between gap-12 relative px-4">
                                    <div className="text-left flex-1">
                                        <div className="flex items-baseline gap-2">
                                            <h3 className="text-5xl font-black text-main-color tracking-tighter">{f.fromCode}</h3>
                                        </div>
                                        <p className="text-muted text-sm mt-1">{f.from}</p>
                                        <p className="text-xl font-bold mt-4 text-main-color">{f.time}</p>
                                    </div>

                                    <div className="flex-1 flex flex-col items-center mt-[-20px]">
                                        <div className="w-full relative flex items-center justify-center">
                                            <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-sky-500/40 to-transparent"></div>
                                            <Plane size={20} className="text-sky-400 relative z-10 bg-[#080b1a] px-2 box-content transform group-hover:translate-x-12 transition-transform duration-1000" />
                                        </div>
                                        <p className="text-[10px] text-muted uppercase mt-4 tracking-[0.3em] font-bold">Non-Stop</p>
                                    </div>

                                    <div className="text-right flex-1">
                                        <div className="flex items-baseline justify-end gap-2">
                                            <h3 className="text-5xl font-black text-main-color tracking-tighter">{f.toCode}</h3>
                                        </div>
                                        <p className="text-muted text-sm mt-1">{f.to}</p>
                                        <p className="text-xl font-bold mt-4 text-main-color">{(parseInt(f.time.split(':')[0]) + 2) + ':' + f.time.split(':')[1]}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="w-full md:w-[320px] bg-sky-500/5 p-8 flex flex-col justify-between relative">
                                <div className="space-y-6">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted">Terminal</span>
                                        <span className="text-main-color font-bold">B3</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted">Gate</span>
                                        <span className="text-main-color font-bold">42</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted">Speed</span>
                                        <span className="text-main-color font-bold italic">850 km/h</span>
                                    </div>
                                </div>
                                <button 
                                    className="btn-primary w-full mt-8 flex items-center justify-center gap-2 group/btn py-4"
                                    onClick={() => navigate(`/flight/${f.id}`)}
                                >
                                    Flight Details
                                    <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Status;
