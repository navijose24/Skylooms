import { useState } from 'react';
import { Umbrella, Coffee, Utensils, Zap, Play, ChevronRight, Star, Heart } from 'lucide-react';

const Experiences = () => {
    const categories = [
        { name: "Adventure", icon: <Zap size={24} />, color: "orange" },
        { name: "Culinary", icon: <Utensils size={24} />, color: "rose" },
        { name: "Relaxation", icon: <Umbrella size={24} />, color: "sky" },
        { name: "Culture", icon: <Coffee size={24} />, color: "amber" }
    ];

    const experiences = [
        { id: 1, title: "Sushi Making Masterclass", category: "Culinary", location: "Tokyo, Japan", host: "Chef Kenji", rating: 4.9, reviews: 124, price: 85, img: "https://images.unsplash.com/photo-1558904541-efa843a96f09?auto=format&fit=crop&w=800&q=80" },
        { id: 2, title: "Surf the North Shore", category: "Adventure", location: "Oahu, Hawaii", host: "Kala", rating: 4.8, reviews: 89, price: 120, img: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=800&q=80" },
        { id: 3, title: "Tranquil Balinese Massage", category: "Relaxation", location: "Ubud, Bali", host: "Sari Spa", rating: 5.0, reviews: 210, price: 45, img: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80" },
        { id: 4, title: "Pottery in the Medina", category: "Culture", location: "Marrakech, Morocco", host: "Artisan Ali", rating: 4.7, reviews: 56, price: 35, img: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80" }
    ];

    const [activeCategory, setActiveCategory] = useState('All');

    return (
        <div className="pt-32 pb-20 min-h-screen">
            <div className="container max-w-7xl">
                <div className="text-center mb-16">
                    <div className="w-20 h-20 bg-orange-500/10 text-orange-500 rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-orange-500/20">
                        <Umbrella size={40} />
                    </div>
                    <h1 className="text-5xl font-bold mb-6 text-main-color">Unique Experiences</h1>
                    <p className="text-xl text-muted max-w-2xl mx-auto">Immerse yourself in local culture with hands-on activities, hosted by passionate experts around the world.</p>
                </div>

                {/* Categories */}
                <div className="flex justify-center gap-6 mb-16 overflow-x-auto pb-4 hide-scrollbar">
                    <button 
                        className={`flex flex-col items-center gap-3 p-6 rounded-3xl border transition-all duration-300 min-w-[120px] ${activeCategory === 'All' ? 'bg-white text-black border-white scale-110' : 'bg-black/20 border-white/10 text-gray-400 hover:bg-white/5'}`}
                        onClick={() => setActiveCategory('All')}
                    >
                        <div className={`p-4 rounded-full ${activeCategory === 'All' ? 'bg-black text-white' : 'bg-white/5'}`}><Play size={24}/></div>
                        <span className="font-bold">All</span>
                    </button>
                    {categories.map(c => (
                        <button 
                            key={c.name}
                            className={`flex flex-col items-center gap-3 p-6 rounded-3xl border transition-all duration-300 min-w-[120px] ${activeCategory === c.name ? `bg-${c.color}-500 border-${c.color}-500 text-white scale-110 shadow-lg shadow-${c.color}-500/20` : 'bg-black/20 border-white/10 text-gray-400 hover:bg-white/5'}`}
                            onClick={() => setActiveCategory(c.name)}
                        >
                            <div className={`p-4 rounded-full ${activeCategory === c.name ? 'bg-white/20' : `bg-${c.color}-500/10 text-${c.color}-500`}`}>
                                {c.icon}
                            </div>
                            <span className="font-bold">{c.name}</span>
                        </button>
                    ))}
                </div>

                {/* Featured Experience */}
                {activeCategory === 'All' && (
                    <div className="mb-20 glass-panel rounded-3xl overflow-hidden border-orange-500/30 flex flex-col md:flex-row group cursor-pointer relative">
                        <div className="w-full md:w-1/2 h-[400px] relative overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1600&q=80" alt="Cooking" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                            <div className="absolute top-6 left-6 bg-white text-black px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-xl flex items-center gap-1.5">
                                <Star size={14} className="fill-yellow-400 text-yellow-400"/> Editor's Pick
                            </div>
                        </div>
                        <div className="w-full md:w-1/2 p-12 flex flex-col justify-center bg-gradient-to-l from-orange-500/5 to-transparent">
                            <div className="flex items-center gap-2 text-sm font-bold text-orange-500 uppercase tracking-widest mb-4">
                                <Utensils size={16} /> Culinary Experience
                            </div>
                            <h2 className="text-4xl font-bold text-white mb-4 leading-tight group-hover:text-orange-400 transition-colors">Tuscan Pasta Making in a 16th-Century Farmhouse</h2>
                            <p className="text-gray-400 mb-8 flex-1">Join local nonna Maria in her authentic kitchen overlooking the rolling hills of Tuscany. Learn the secrets of perfect dough and classic sauces passed down through generations.</p>
                            
                            <div className="flex items-center justify-between border-t border-white/10 pt-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-orange-500">
                                        <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80" alt="Host" className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold uppercase">Hosted by</p>
                                        <p className="text-sm font-bold text-white">Nonna Maria</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-400">from</p>
                                    <p className="text-3xl font-bold text-orange-500">$150</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-white">
                        {activeCategory === 'All' ? 'Top Experiences' : `${activeCategory} Experiences`}
                    </h2>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {experiences.filter(e => activeCategory === 'All' || e.category === activeCategory).map(exp => (
                        <div key={exp.id} className="glass-panel group cursor-pointer overflow-hidden rounded-2xl border-white/10 hover:border-orange-500/50 transition-all duration-300 flex flex-col relative">
                            <button className="absolute top-4 right-4 z-10 p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:text-red-500 hover:bg-white transition-colors border border-white/20">
                                <Heart size={18} />
                            </button>
                            <div className="relative h-64 overflow-hidden">
                                <img src={exp.img} alt={exp.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                                
                                <div className="absolute bottom-4 left-4 right-4">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-white mb-2">
                                        <Star size={14} className="text-yellow-400 fill-yellow-400"/>
                                        <span>{exp.rating}</span>
                                        <span className="text-gray-400 font-normal">({exp.reviews})</span>
                                        <span className="text-gray-400 mx-1">•</span>
                                        <span>{exp.location}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white line-clamp-2 leading-snug group-hover:text-orange-400 transition-colors">{exp.title}</h3>
                                </div>
                            </div>
                            <div className="p-5 flex justify-between items-center bg-black/40">
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">From</span>
                                    <span className="text-xl font-bold text-white">${exp.price}</span>
                                </div>
                                <button className="w-10 h-10 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-black transition-colors">
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Experiences;
