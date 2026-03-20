import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hotel, Car, ArrowRight, Loader2 } from 'lucide-react';
import { useBooking } from '../context/BookingContext';

const Recommendations = () => {
    const { searchParams, durationDays, selectedHotel, setSelectedHotel, selectedCab, setSelectedCab, selectedFlights } = useBooking();
    const [recommendations, setRecommendations] = useState({ hotels: [], cabs: [] });
    const [loading, setLoading] = useState(true);
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

    return (
        <div className="container mt-8 animate-slide-up">
            <h1 className="text-4xl text-center text-gradient mb-8">Smart Recommendations for your Trip</h1>
            <p className="text-center text-muted mb-8">Based on your {searchParams.cabinClass} class booking and {Math.ceil(durationDays)} day stay.</p>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Hotels Section */}
                <section>
                    <h2 className="text-3xl flex items-center gap-2 mb-4"><Hotel color="var(--primary-blue)" /> Recommended Hotels</h2>
                    <div className="flex-col gap-4">
                        {recommendations.hotels.map(h => (
                            <div 
                                key={h.id} 
                                className={`glass-panel p-4 mb-4 cursor-pointer border-2 transition-all ${selectedHotel?.id === h.id ? 'border-[var(--primary-blue)] glass-glow' : 'border-transparent'}`}
                                onClick={() => setSelectedHotel(h)}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-2xl">{h.name}</h3>
                                        <p className="text-muted">{h.rating} ⭐ • {h.distance_from_airport}km from airport</p>
                                        <div className="flex gap-2 mt-2">
                                            {h.amenities.map(a => <span key={a} className="bg-[var(--glass-bg)] px-2 py-1 rounded text-sm">{a}</span>)}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl text-gold">${h.price_per_night}/night</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Cabs Section */}
                <section>
                    <h2 className="text-3xl flex items-center gap-2 mb-4"><Car color="var(--primary-blue)" /> Private Transfers</h2>
                    <div className="flex-col gap-4">
                        {recommendations.cabs.map(c => (
                            <div 
                                key={c.id} 
                                className={`glass-panel p-4 mb-4 cursor-pointer border-2 transition-all ${selectedCab?.id === c.id ? 'border-[var(--primary-blue)] glass-glow' : 'border-transparent'}`}
                                onClick={() => setSelectedCab(c)}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-2xl">{c.vehicle_model}</h3>
                                        <p className="text-muted">{c.driver_name} • {c.rating} ⭐</p>
                                        <p className="text-sm">{c.seating_capacity} Seats • {c.cab_type === 'premium' ? '✨ Premium Luxury' : 'Standard'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl text-gold">${c.price_per_km}/km</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <div className="flex justify-center mt-12 gap-4">
                <button className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--primary-blue)' }} onClick={() => navigate('/')}>Back</button>
                <button className="btn-primary flex items-center gap-2" onClick={() => navigate('/checkout')}>
                    Continue to Checkout <ArrowRight size={20} />
                </button>
            </div>
        </div>
    );
};

export default Recommendations;
