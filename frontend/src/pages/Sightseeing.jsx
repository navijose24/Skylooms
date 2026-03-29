import { useState } from 'react';
import { Footprints, Map, Compass, Camera, Navigation, Star } from 'lucide-react';

const Sightseeing = () => {
    const tours = [
        { id: 1, title: "Table Mountain Aerial Cableway", location: "Cape Town, SA", price: 25, duration: "2-3 hours", rating: 4.9, img: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=800&q=80" },
        { id: 2, title: "Eiffel Tower Summit Access", location: "Paris, France", price: 85, duration: "3 hours", rating: 4.8, img: "https://images.unsplash.com/photo-1511739001486-6bfe10ce7858?auto=format&fit=crop&w=800&q=80" },
        { id: 3, title: "Colosseum Underground Tour", location: "Rome, Italy", price: 65, duration: "4 hours", rating: 4.9, img: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80" },
        { id: 4, title: "Statue of Liberty Cruise", location: "New York, USA", price: 35, duration: "2 hours", rating: 4.7, img: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80" }
    ];

    return (
        <div className="pt-32 pb-20 min-h-screen">
            <div className="container max-w-7xl">
                <div className="text-center mb-16">
                    <div className="w-20 h-20 bg-teal-500/10 text-teal-500 rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-teal-500/20">
                        <Footprints size={40} />
                    </div>
                    <h1 className="text-5xl font-bold mb-6 text-main-color">Sightseeing Tours</h1>
                    <p className="text-xl text-muted max-w-2xl mx-auto">Discover the world's most iconic landmarks, guided by experts who bring history to life.</p>
                </div>

                {/* Hero Feature */}
                <div className="glass-panel overflow-hidden mb-16 group relative h-[400px] rounded-3xl border-teal-500/30">
                    <img src="https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1600&q=80" alt="Venice" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
                    <div className="absolute inset-y-0 left-0 p-12 flex flex-col justify-center max-w-xl">
                        <div className="bg-teal-500/20 text-teal-400 border border-teal-500/30 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest w-fit mb-4 flex items-center gap-2"><CrownIcon size={14}/> Top Rated</div>
                        <h2 className="text-4xl font-bold text-white mb-4 leading-tight">Venice Grand Canal Sunset Cruise</h2>
                        <p className="text-gray-300 mb-8 max-w-md">Experience the magic of Venice as the sun sets, coloring the historic palaces and waterways in shades of gold and amber.</p>
                        <div className="flex items-center gap-6">
                            <div>
                                <p className="text-3xl font-bold text-teal-400">$120</p>
                                <p className="text-sm text-gray-400">per person</p>
                            </div>
                            <button className="bg-teal-500 hover:bg-teal-600 text-black font-bold px-8 py-3 rounded-xl transition-colors shadow-lg shadow-teal-500/20">Book Experience</button>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between flex-wrap gap-4 items-center mb-10">
                    <h2 className="text-3xl font-bold text-white">Popular Destinations</h2>
                    <div className="flex gap-2">
                        {['All', 'Europe', 'Americas', 'Africa', 'Asia'].map((r, i) => (
                            <button key={r} className={`px-5 py-2 rounded-full font-bold text-sm transition-colors ${i===0 ? 'bg-teal-500 text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'}`}>{r}</button>
                        ))}
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {tours.map(tour => (
                        <div key={tour.id} className="glass-panel group cursor-pointer overflow-hidden rounded-2xl border-white/10 hover:border-teal-500/50 transition-all duration-300 flex flex-col">
                            <div className="relative h-56 overflow-hidden">
                                <img src={tour.img} alt={tour.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-white/10">
                                    <Star size={14} className="text-yellow-400 fill-yellow-400"/>
                                    <span className="text-sm font-bold text-white">{tour.rating}</span>
                                </div>
                                <button className="absolute bottom-4 right-4 w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-white/20 hover:bg-teal-500 hover:text-black">
                                    <Map size={18} />
                                </button>
                            </div>
                            <div className="p-6 flex flex-col flex-1">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-teal-400 uppercase tracking-wider mb-3">
                                    <Navigation size={14} /> {tour.location}
                                </div>
                                <h3 className="text-xl font-bold text-white mb-4 line-clamp-2 hover:text-teal-300 transition-colors">{tour.title}</h3>
                                
                                <div className="mt-auto pt-5 border-t border-white/10 flex justify-between items-end">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1 flex items-center gap-1.5"><Compass size={12}/> {tour.duration}</p>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-sm text-gray-400">from</span>
                                            <span className="text-2xl font-bold text-teal-400">${tour.price}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Simple Crown icon component matching lucide style
const CrownIcon = ({size=24, className=""}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
    </svg>
);

export default Sightseeing;
