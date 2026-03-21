import React from 'react';
import { Plane, Map, Globe, Wind, Star, Camera } from 'lucide-react';

const Explore = () => {
    return (
        <div className="container py-20 animate-slide-up">
            <h1 className="text-5xl font-bold mb-4">Explore Destinations</h1>
            <p className="text-xl text-muted mb-12 text-left">Discover our comprehensive regional network spanning across Southern Africa and beyond.</p>
            
            <div className="grid md:grid-cols-4 gap-8 mb-32">
                {[
                    { icon: <Globe size={24}/>, name: 'Regional Hubs', sub: 'The beating heart of Southern Africa connections.' },
                    { icon: <Map size={24}/>, name: 'South Africa', sub: 'From the peaks of Drakensberg to the coast of CPT.' },
                    { icon: <Star size={24}/>, name: 'Premium Leisure', sub: 'Exclusive resorts and untouched natural wonders.' },
                    { icon: <Wind size={24}/>, name: 'Modern Fleet', sub: 'Eco-efficient aircraft for a sustainable future.' }
                ].map((item, i) => (
                    <div key={i} className="glass-panel p-10 hover:border-sky-500/50 transition-all group cursor-pointer">
                        <div className="text-sky-400 mb-6 group-hover:scale-110 transition-transform origin-left">
                            {item.icon}
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-main-color">{item.name}</h3>
                        <p className="text-muted text-sm leading-relaxed line-clamp-2">{item.sub}</p>
                    </div>
                ))}
            </div>

            <div className="flex flex-col gap-32">
                <section className="flex flex-col md:flex-row gap-20 items-start">
                    <div className="flex-1 pt-8">
                        <span className="text-sky-400 font-bold tracking-[0.3em] text-xs uppercase mb-6 block">Featured Destination</span>
                        <h2 className="text-5xl font-bold mb-8 leading-tight">Adventure Awaits in <span className="text-sky-400">Cape Town</span></h2>
                        <p className="text-lg text-muted mb-10 leading-relaxed">Experience the iconic Table Mountain, pristine beaches, and world-class vineyards. Our multiple daily flights from Johannesburg make it easier than ever to explore the Mother City.</p>
                        <div className="space-y-6 mb-12">
                             {[
                                { icon: <Star size={18}/>, text: 'Top Choice for International Travelers', sub: 'Voted #1 City in Africa 2024' },
                                { icon: <Camera size={18}/>, text: 'Scenic Coastal Drives', sub: 'Explore the world-famous Chapmans Peak' },
                                { icon: <Globe size={18}/>, text: 'World-Class Gastronomy', sub: 'Home to multiple award-winning restaurants' }
                             ].map((l, j) => (
                                 <div key={j} className="flex gap-4 items-start group/li">
                                     <div className="mt-1 bg-sky-500/10 p-2 rounded-lg text-sky-400 group-hover/li:bg-sky-500/20 transition-colors">{l.icon}</div>
                                     <div>
                                         <p className="font-bold text-main-color text-lg">{l.text}</p>
                                         <p className="text-sm text-muted">{l.sub}</p>
                                     </div>
                                 </div>
                             ))}
                        </div>
                        <button className="btn-primary px-12 py-4 rounded-xl">Discover Destinations</button>
                    </div>
                    <div className="flex-1 w-full relative">
                        <div className="absolute inset-0 bg-sky-500/20 blur-[100px] rounded-full opacity-20"></div>
                        <div className="relative h-[600px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                            <img 
                                src="https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=1200&q=80" 
                                alt="Cape Town" 
                                className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-1000" 
                            />
                        </div>
                    </div>
                </section>
                
                <hr className="border-white/5" />

                <section className="flex flex-col md:flex-row-reverse gap-20 items-start">
                    <div className="flex-1 pt-8">
                        <h2 className="text-4xl font-bold mb-6">The Majesty of Victoria Falls</h2>
                        <p className="text-lg text-muted mb-8 leading-relaxed">Listen to the thunder of the largest waterfall in the world. Our regional connections hub through Johannesburg provide seamless access to this UNESCO World Heritage site.</p>
                         <ul className="space-y-6 mb-12">
                             {[
                                { icon: <Wind size={16}/>, text: 'Witness the World-Renowned Smoke that Thunders' },
                                { icon: <Map size={16}/>, text: 'Gateway to Chobe National Park' },
                                { icon: <Plane size={16}/>, text: 'Daily Direct Flights from Regional Hubs' }
                             ].map((l, j) => (
                                 <li key={j} className="flex items-center gap-4 text-main-color">
                                     <div className="bg-sky-500/10 p-2 rounded-lg text-sky-400">{l.icon}</div>
                                     <span className="text-lg">{l.text}</span>
                                 </li>
                             ))}
                        </ul>
                         <button className="btn-primary px-12 py-4 rounded-xl">Book an Adventure</button>
                    </div>
                    <div className="flex-1 w-full h-[600px] rounded-3xl overflow-hidden glass-panel relative">
                        <div className="absolute inset-0 bg-sky-500/10 blur-[100px] rounded-full opacity-20"></div>
                        <img 
                            src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80" 
                            alt="Dubai Style Explore" 
                            className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-1000" 
                        />
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Explore;
