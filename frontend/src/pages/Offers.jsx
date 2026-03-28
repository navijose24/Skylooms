import React from 'react';
import { Tag, CreditCard, Gift, Percent, Calendar, CheckCircle, Info, ArrowRight, UserCheck, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

const Offers = () => {
    const mainOffers = [
        {
            title: "Student Special Fare",
            desc: "Up to 6% off on base fares and extra 10kg baggage allowance.",
            icon: <UserCheck size={24} />,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
            tag: "MOST POPULAR"
        },
        {
            title: "Senior Citizen Discount",
            desc: "Exclusive 6% discount on base fares for our experienced travelers.",
            icon: <Gift size={24} />,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10"
        },
        {
            title: "Armed Forces Special",
            desc: "Special flat discounts and priority services for our heroes.",
            icon: <Briefcase size={24} />,
            color: "text-purple-400",
            bg: "bg-purple-500/10"
        }
    ];

    const bankOffers = [
        {
            bank: "SkyCard HDFC",
            offer: "Flat 10% Cashback",
            code: "SKYHDFC",
            valid: "Valid till 31 Dec 2024",
            img: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=400&q=80"
        },
        {
            bank: "ICICI Bank",
            offer: "Up to $50 Instant Discount",
            code: "SKYICICI",
            valid: "Valid till 15 Nov 2024",
            img: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=400&q=80"
        },
        {
            bank: "SBI Credit Cards",
            offer: "Flat 12% off on First Booking",
            code: "SBINEW",
            valid: "Valid for new users only",
            img: "https://images.unsplash.com/photo-1589758438368-0ad531db3366?auto=format&fit=crop&w=400&q=80"
        }
    ];

    const additionalDeals = [
        {
            title: "6E Extras - Priority Check-in",
            desc: "Skip the queues with our Fast Forward service starting at just $9.",
            link: "/status"
        },
        {
            title: "Hotel Partnerships",
            desc: "Get up to 25% off on Marriott Bonvoy stays with your flight booking.",
            link: "/explore"
        },
        {
            title: "Group Bookings",
            desc: "Traveling with 10+ people? Get special corporate rates and flexibility.",
            link: "/manage"
        }
    ];

    return (
        <div className="flex-col">
            {/* Hero Banner */}
            <div className="relative h-[450px] w-full overflow-hidden">
                <img 
                    src="image.png" 
                    alt="Deals Banner" 
                    className="absolute inset-0 w-full h-full object-cover brightness-50" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bg-main to-transparent opacity-90"></div>
                <div className="container relative h-full flex flex-col justify-center items-start text-left z-10 pt-20">
                    <span className="bg-sky-500 text-white px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase mb-6 animate-slide-up">
                        Skylooms Grand Sale
                    </span>
                    <h1 className="text-6xl md:text-7xl font-black mb-6 leading-tight animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        FLY HIGHER.<br /><span className="text-sky-400">PAY LESS.</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-white/70 max-w-2xl mb-10 leading-relaxed animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        Unbeatable fares starting from $49. Book your dream getaway today with our limited-time seasonal offers.
                    </p>
                    <Link to="/" className="btn-primary px-10 py-4 text-lg rounded-2xl flex items-center gap-3 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                        Book Now <ArrowRight size={20} />
                    </Link>
                </div>
            </div>

            <div className="container py-20">
                {/* Main Special Fares */}
                <div className="mb-32">
                    <div className="flex items-end justify-between mb-12">
                        <div className="text-left">
                            <h2 className="text-4xl font-bold mb-4">Special Fares for <span className="text-sky-400">Everyone</span></h2>
                            <p className="text-muted text-lg">Specially curated discounts for students, seniors, and more.</p>
                        </div>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-8">
                        {mainOffers.map((offer, i) => (
                            <div key={i} className="glass-panel p-10 flex flex-col relative group hover:border-sky-500/50 transition-all cursor-pointer">
                                {offer.tag && (
                                    <span className="absolute top-0 right-10 -translate-y-1/2 bg-amber-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg">
                                        {offer.tag}
                                    </span>
                                )}
                                <div className={`${offer.bg} ${offer.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                                    {offer.icon}
                                </div>
                                <h3 className="text-2xl font-bold mb-4">{offer.title}</h3>
                                <p className="text-muted leading-relaxed mb-8 flex-1">{offer.desc}</p>
                                <div className="pt-6 border-t border-white/5 flex items-center justify-between group/btn">
                                    <span className="text-sm font-bold text-sky-400">Learn More</span>
                                    <ArrowRight size={18} className="text-sky-400 transform translate-x-[-10px] opacity-0 group-hover/btn:translate-x-0 group-hover/btn:opacity-100 transition-all" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bank Offers Section */}
                <div className="mb-32">
                    <div className="bg-sky-500/5 rounded-[2.5rem] p-12 md:p-20 relative overflow-hidden text-left border border-sky-500/10">
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-sky-500/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
                        <h2 className="text-4xl font-black mb-12 relative z-10">Partner <span className="text-sky-400">Bank Offers</span></h2>
                        
                        <div className="grid md:grid-cols-3 gap-8 relative z-10">
                            {bankOffers.map((offer, i) => (
                                <div key={i} className="bg-bg-main/40 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden hover:scale-[1.02] transition-transform duration-300 shadow-2xl">
                                    <div className="h-40 relative">
                                        <img src={offer.img} alt={offer.bank} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-bg-main to-transparent"></div>
                                        <div className="absolute bottom-4 left-6">
                                            <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-md text-[10px] font-bold text-white uppercase tracking-wider">Banking</span>
                                        </div>
                                    </div>
                                    <div className="p-8">
                                        <h4 className="text-xs font-bold text-sky-400 uppercase tracking-widest mb-2">{offer.bank}</h4>
                                        <h3 className="text-2xl font-bold mb-4">{offer.offer}</h3>
                                        <div className="flex bg-white/5 rounded-xl p-4 items-center justify-between mb-6">
                                            <div>
                                                <p className="text-[10px] text-muted uppercase font-bold mb-1">Use Code</p>
                                                <p className="text-xl font-black tracking-tighter">{offer.code}</p>
                                            </div>
                                            <button className="bg-sky-500 text-white p-2 rounded-lg hover:bg-sky-400 transition-colors">
                                                <Info size={18} />
                                            </button>
                                        </div>
                                        <p className="text-xs text-muted flex items-center gap-2">
                                            <Calendar size={12} /> {offer.valid}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Additional Deals Grid */}
                <div className="mb-20">
                    <h2 className="text-3xl font-bold mb-12 text-left">More Ways to <span className="text-sky-400">Save & Upgrade</span></h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {additionalDeals.map((deal, i) => (
                            <Link to={deal.link} key={i} className="glass-panel p-8 text-left hover:bg-white/5 transition-colors group">
                                <h4 className="text-xl font-bold mb-3 group-hover:text-sky-400 transition-colors">{deal.title}</h4>
                                <p className="text-muted text-sm leading-relaxed mb-6">{deal.desc}</p>
                                <span className="text-xs font-bold flex items-center gap-2">
                                    Vew details <ArrowRight size={14} />
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Newsletter Subscription */}
                <div className="glass-panel p-12 md:p-20 rounded-[3rem] text-center bg-gradient-to-br from-bg-accent to-bg-main border-white/5 relative overflow-hidden">
                    <div className="absolute -left-10 -top-10 w-40 h-40 bg-sky-500/10 blur-3xl rounded-full"></div>
                    <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-purple-500/10 blur-3xl rounded-full"></div>
                    
                    <Tag className="mx-auto mb-8 text-sky-400" size={48} />
                    <h2 className="text-4xl md:text-5xl font-black mb-6">Never Miss a <span className="text-sky-400">Deal</span></h2>
                    <p className="text-xl text-muted max-w-2xl mx-auto mb-12">
                        Subscribe to our newsletter and be the first to know about flash sales, new destinations, and exclusive membership offers.
                    </p>
                    <div className="flex flex-col md:flex-row gap-4 max-w-xl mx-auto">
                        <input 
                            type="email" 
                            placeholder="Your email address" 
                            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-sky-500 transition-colors text-lg"
                        />
                        <button className="btn-primary px-10 py-4 font-bold rounded-2xl whitespace-nowrap">
                            Subscribe Now
                        </button>
                    </div>
                    <p className="mt-8 text-xs text-muted flex items-center justify-center gap-2">
                        <CheckCircle size={14} /> Only the best offers, no spam. Ever.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Offers;
