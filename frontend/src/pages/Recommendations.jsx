import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hotel, Car, ArrowRight, Loader2, FastForward, CheckCircle } from 'lucide-react';
import { useBooking } from '../context/BookingContext';

const Recommendations = () => {
    const { searchParams, durationDays, selectedHotel, setSelectedHotel, selectedCab, setSelectedCab, selectedFlights } = useBooking();
    const [recommendations, setRecommendations] = useState({ hotels: [], cabs: [] });
    const [loading, setLoading] = useState(true);
    const [hotelFilter, setHotelFilter] = useState('all'); // all, luxury, budget
    const [cabFilter, setCabFilter] = useState('all'); // all, premium, standard
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const city = selectedFlights[0]?.destination?.city || searchParams.destination;
                const res = await fetch(`http://localhost:8000/api/recommendations/?journey_type=${searchParams.journeyType}&duration_days=${durationDays}&cabin_class=${searchParams.cabinClass}&city=${city}`);
                if (res.ok) {
                    const data = await res.json();
                    setRecommendations(data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchRecommendations();
    }, [searchParams, durationDays, selectedFlights]);

    if (loading) return <div className="container mt-8 flex justify-center"><Loader2 className="animate-spin" size={48} /></div>;

    const filteredHotels = recommendations.hotels.filter(h => hotelFilter === 'all' || h.hotel_type === hotelFilter);
    const filteredCabs = recommendations.cabs.filter(c => cabFilter === 'all' || c.cab_type === cabFilter);

    const handleSkip = () => {
        setSelectedHotel(null);
        setSelectedCab(null);
        navigate('/checkout');
    };

    return (
        <div className="container mt-8 animate-slide-up">
            <h1 className="text-4xl text-center text-gradient mb-8">Smart Recommendations for your Trip</h1>
            <p className="text-center text-muted mb-8">Personalize your stay and transport for your trip.</p>

        <div className="flex flex-col gap-12">
                {/* Hotels Section */}
                <section>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-3xl flex items-center gap-3 text-white"><Hotel color="var(--primary-blue)" /> Hotels</h2>
                        <select 
                            className="bg-[rgba(255,255,255,0.1)] backdrop-blur-md border border-[rgba(255,255,255,0.2)] text-white px-4 py-2 rounded-lg outline-none focus:border-[var(--primary-blue)] transition-colors"
                            value={hotelFilter}
                            onChange={(e) => setHotelFilter(e.target.value)}
                        >
                            <option value="all" className="bg-gray-900">All</option>
                            <option value="luxury" className="bg-gray-900">Luxury</option>
                            <option value="budget" className="bg-gray-900">Budget</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-8">
                        {filteredHotels.length === 0 ? <p className="text-muted">No hotels found for selected filter.</p> : filteredHotels.map((h, i) => {
                            const isSelected = selectedHotel?.id === h.id;
                            
                            const luxuryImgs = ['1566073771259-6a8506099945', '1582719508461-905c673771fd', '1542314831-c533e54f8d67', '1571003123894-1f0594d2b5d9', '1551882547-ff40c0d1398a'];
                            const budgetImgs = ['1520250497591-112f2f40a3f4', '1445019980597-93fa8acb246c', '1592859675234-9020084db8e1', '1555854877-bab0e564b8d5', '1551882547-ff40c0d1398a'];
                            const arr = h.hotel_type === 'luxury' ? luxuryImgs : budgetImgs;
                            const imgId = arr[h.id % arr.length];

                            const hotelColors = ['#1d3c45', '#414f31', '#2f1b26', '#1c2436', '#3b2521'];
                            const bgBaseColor = hotelColors[i % hotelColors.length];

                            return (
                                <div 
                                    key={h.id} 
                                    className={`flex flex-col w-full h-[520px] rounded-[2.5rem] overflow-hidden transition-all duration-300 relative cursor-pointer ${isSelected ? 'outline outline-4 outline-[var(--primary-blue)] shadow-[0_0_30px_rgba(0,186,255,0.4)] transform scale-[1.02]' : 'shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] hover:scale-[1.02]'}`}
                                    onClick={() => setSelectedHotel(isSelected ? null : h)}
                                    style={{ backgroundColor: bgBaseColor }}
                                >
                                    {/* Image Top Half with seamless gradient fade */}
                                    <div className="absolute top-0 left-0 w-full h-[65%]">
                                        <img src={`https://images.unsplash.com/photo-${imgId}?w=600&h=800&fit=crop`} className="w-full h-full object-cover" alt={h.name} />
                                        <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent 30%, ${bgBaseColor}d9 75%, ${bgBaseColor} 100%)` }}></div>
                                    </div>
                                    
                                    {isSelected && <div className="absolute top-6 right-6 bg-black/40 backdrop-blur-md rounded-full p-1 z-20"><CheckCircle className="text-[var(--primary-blue)]" fill="white" size={28} /></div>}
                                    
                                    {/* Content Area positioned at bottom */}
                                    <div className="relative z-10 flex flex-col h-full justify-end px-7 pb-7 pt-0">
                                        {/* Carousel Dots */}
                                        <div className="flex justify-center items-center gap-1.5 mb-5 opacity-70">
                                            <div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>
                                            <div className="w-2 h-2 rounded-full bg-white shadow-sm"></div>
                                            <div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>
                                        </div>

                                        {/* Title & Price */}
                                        <div className="flex justify-between items-center mb-3">
                                            <h3 className="text-[24px] font-bold text-white tracking-tight leading-tight pr-2">{h.name}</h3>
                                            <span className="bg-black/30 backdrop-blur-md px-3.5 py-1 rounded-full text-[14px] font-bold text-white flex-shrink-0">${h.price_per_night}</span>
                                        </div>
                                        
                                        {/* Description */}
                                        <p className="text-white/70 text-[14px] mb-5 leading-[1.5] line-clamp-3">
                                            Experience a wonderful stay offering stunning amenities, located just {h.distance_from_airport}km from the airport. Perfect for your {durationDays || 3} day trip.
                                        </p>
                                        
                                        {/* Tags */}
                                        <div className="flex flex-wrap gap-2.5 mb-6">
                                            <span className="bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[12px] text-white/90 font-medium">{h.hotel_type === 'luxury' ? 'Luxury Stay' : 'Budget Stay'}</span>
                                            <span className="bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[12px] text-white/90 font-medium">{durationDays || 3} Day stay</span>
                                        </div>
                                        
                                        {/* Button */}
                                        <button 
                                            className={`w-full py-3.5 rounded-full font-bold text-[15px] transition-colors active:scale-95 ${isSelected ? 'bg-[var(--primary-blue)] text-white shadow-[0_4px_15px_rgba(0,186,255,0.3)]' : 'bg-white text-black hover:bg-gray-100 shadow-md'}`}
                                            onClick={(e) => { e.stopPropagation(); setSelectedHotel(isSelected ? null : h); }}
                                        >
                                            {isSelected ? 'Selected' : 'Reserve'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Cabs Section */}
                <section>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-3xl flex items-center gap-3 text-white"><Car color="var(--primary-blue)" /> Transfers</h2>
                        <select 
                            className="bg-[rgba(255,255,255,0.1)] backdrop-blur-md border border-[rgba(255,255,255,0.2)] text-white px-4 py-2 rounded-lg outline-none focus:border-[var(--primary-blue)] transition-colors"
                            value={cabFilter}
                            onChange={(e) => setCabFilter(e.target.value)}
                        >
                            <option value="all" className="bg-gray-900">All</option>
                            <option value="premium" className="bg-gray-900">Premium</option>
                            <option value="standard" className="bg-gray-900">Standard</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-8">
                        {filteredCabs.length === 0 ? <p className="text-muted">No cabs found for selected filter.</p> : filteredCabs.map((c, i) => {
                            const isSelected = selectedCab?.id === c.id;
                            
                            const premiumImgs = ['1541899481282-d81428236209', '1494976388531-d1058494cdd8', '1609520778166-06cf4d13b5e4', '1503376760302-d402d628eb56', '1553440569-b510ed9de4c2'];
                            const standardImgs = ['1449965408869-eaa3f722e40d', '1550355291-bbee04a92027', '1533473359331-013f96602324', '1449965408869-eaa3f722e40d', '1550355291-bbee04a92027'];
                            const arr = c.cab_type === 'premium' ? premiumImgs : standardImgs;
                            const imgId = arr[c.id % arr.length];

                            const cabColors = ['#1a1f24', '#262922', '#261b20', '#181b24', '#261e1a'];
                            const bgBaseColor = cabColors[i % cabColors.length];

                            return (
                                <div 
                                    key={c.id} 
                                    className={`flex flex-col w-full h-[520px] rounded-[2.5rem] overflow-hidden transition-all duration-300 relative cursor-pointer ${isSelected ? 'outline outline-4 outline-[var(--primary-blue)] shadow-[0_0_30px_rgba(0,186,255,0.4)] transform scale-[1.02]' : 'shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] hover:scale-[1.02]'}`}
                                    onClick={() => setSelectedCab(isSelected ? null : c)}
                                    style={{ backgroundColor: bgBaseColor }}
                                >
                                    {/* Image Top Half with seamless gradient fade */}
                                    <div className="absolute top-0 left-0 w-full h-[65%]">
                                        <img src={`https://images.unsplash.com/photo-${imgId}?w=600&h=800&fit=crop`} className="w-full h-full object-cover" alt={c.vehicle_model} />
                                        <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent 30%, ${bgBaseColor}d9 75%, ${bgBaseColor} 100%)` }}></div>
                                    </div>
                                    
                                    {isSelected && <div className="absolute top-6 right-6 bg-black/40 backdrop-blur-md rounded-full p-1 z-20"><CheckCircle className="text-[var(--primary-blue)]" fill="white" size={28} /></div>}
                                    
                                    {/* Content Area positioned at bottom */}
                                    <div className="relative z-10 flex flex-col h-full justify-end px-7 pb-7 pt-0">
                                        {/* Carousel Dots */}
                                        <div className="flex justify-center items-center gap-1.5 mb-5 opacity-70">
                                            <div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>
                                            <div className="w-2 h-2 rounded-full bg-white shadow-sm"></div>
                                            <div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>
                                        </div>

                                        {/* Title & Price */}
                                        <div className="flex justify-between items-center mb-3">
                                            <h3 className="text-[24px] font-bold text-white tracking-tight leading-tight pr-2">{c.vehicle_model}</h3>
                                            <span className="bg-black/30 backdrop-blur-md px-3.5 py-1 rounded-full text-[14px] font-bold text-white flex-shrink-0">${c.price_per_km}/km</span>
                                        </div>
                                        
                                        {/* Description */}
                                        <p className="text-white/70 text-[14px] mb-5 leading-[1.5] line-clamp-3">
                                            Private transfer with professional driver {c.driver_name}. Ride in comfort and style straight to your desired location.
                                        </p>
                                        
                                        {/* Tags */}
                                        <div className="flex flex-wrap gap-2.5 mb-6">
                                            <span className="bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[12px] text-white/90 font-medium">{c.cab_type === 'premium' ? 'Premium Ride' : 'Standard Ride'}</span>
                                            <span className="bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[12px] text-white/90 font-medium">{c.seating_capacity} Seats</span>
                                        </div>
                                        
                                        {/* Button */}
                                        <button 
                                            className={`w-full py-3.5 rounded-full font-bold text-[15px] transition-colors active:scale-95 ${isSelected ? 'bg-[var(--primary-blue)] text-white shadow-[0_4px_15px_rgba(0,186,255,0.3)]' : 'bg-white text-black hover:bg-gray-100 shadow-md'}`}
                                            onClick={(e) => { e.stopPropagation(); setSelectedCab(isSelected ? null : c); }}
                                        >
                                            {isSelected ? 'Selected' : 'Select Ride'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            </div>

            <div className="flex justify-center mt-12 gap-4">
                <button className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--primary-blue)' }} onClick={() => navigate('/')}>Back</button>
                <button className="btn-primary flex items-center gap-2 bg-gray-600 hover:bg-gray-500" onClick={handleSkip}>
                    Skip <FastForward size={20} />
                </button>
                <button className="btn-primary flex items-center gap-2" onClick={() => navigate('/checkout')}>
                    Continue to Checkout <ArrowRight size={20} />
                </button>
            </div>
        </div>
    );
};

export default Recommendations;
