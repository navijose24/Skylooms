import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Loader2, User, HelpCircle, Baby, PawPrint } from 'lucide-react';
import { useBooking } from '../context/BookingContext';

const Checkout = () => {
    const { searchParams, selectedFlights, selectedHotel, selectedCab, durationDays } = useBooking();
    const [loading, setLoading] = useState(false);
    const [passengers, setPassengers] = useState(
        Array.from({ length: searchParams.passengers }, () => ({
            first_name: '', last_name: '', gender: 'M', age: '', 
            requires_disability_assistance: false, has_children: false, has_pets: false
        }))
    );

    const navigate = useNavigate();

    const totalPrice = useMemo(() => {
        let total = 0;
        selectedFlights.forEach(f => {
            total += parseFloat(searchParams.cabinClass === 'economy' ? f.price_economy : f.price_business);
        });
        total *= searchParams.passengers;

        if (selectedHotel) {
            total += parseFloat(selectedHotel.price_per_night) * Math.ceil(durationDays);
        }
        if (selectedCab) {
            total += parseFloat(selectedCab.price_per_km) * 10; // Assume 10km for now
        }

        // Add small fee for pets/disability assistance
        passengers.forEach(p => {
            if (p.has_pets) total += 50;
        });

        return total.toFixed(2);
    }, [selectedFlights, selectedHotel, selectedCab, durationDays, searchParams.passengers, searchParams.cabinClass, passengers]);

    const handlePassengerChange = (idx, field, value) => {
        const newPassengers = [...passengers];
        newPassengers[idx][field] = value;
        setPassengers(newPassengers);
    };

    const handleBooking = async (e) => {
        e.preventDefault();
        setLoading(true);

        const bookingData = {
            user_email: 'guest@example.com',
            journey_type: searchParams.journeyType,
            cabin_class: searchParams.cabinClass,
            flights: selectedFlights.map(f => f.id),
            passengers: passengers,
            hotel: selectedHotel?.id,
            cab: selectedCab?.id,
            total_price: totalPrice,
            status: 'confirmed',
            payment_id: 'PAY-' + Math.random().toString(36).substr(2, 9).toUpperCase()
        };

        try {
            const res = await fetch('http://localhost:8000/api/bookings/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingData)
            });
            if (res.ok) {
                const data = await res.json();
                navigate(`/success/${data.id}`);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-8 animate-slide-up grid md:grid-cols-3 gap-8 mb-12">
            <div className="md:col-span-2">
                <h1 className="text-3xl text-gradient mb-6">Passenger Details</h1>
                <form onSubmit={handleBooking} className="flex-col gap-6">
                    {passengers.map((p, idx) => (
                        <div key={idx} className="glass-panel p-6 mb-6">
                            <h3 className="text-xl mb-4 flex items-center gap-2"><User size={20} /> Passenger {idx + 1}</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <input 
                                    type="text" placeholder="First Name" className="input-field" required
                                    value={p.first_name} onChange={e => handlePassengerChange(idx, 'first_name', e.target.value)}
                                />
                                <input 
                                    type="text" placeholder="Last Name" className="input-field" required
                                    value={p.last_name} onChange={e => handlePassengerChange(idx, 'last_name', e.target.value)}
                                />
                                <input 
                                    type="number" placeholder="Age" className="input-field" required
                                    value={p.age} onChange={e => handlePassengerChange(idx, 'age', e.target.value)}
                                />
                                <select className="input-field" value={p.gender} onChange={e => handlePassengerChange(idx, 'gender', e.target.value)}>
                                    <option value="M">Male</option>
                                    <option value="F">Female</option>
                                    <option value="O">Other</option>
                                </select>
                            </div>

                            <div className="flex gap-4 mt-4 flex-wrap">
                                <label className="flex items-center gap-2 cursor-pointer bg-[var(--glass-bg)] p-2 rounded hover:bg-[var(--glass-border)] transition-all">
                                    <input 
                                        type="checkbox" 
                                        checked={p.requires_disability_assistance}
                                        onChange={e => handlePassengerChange(idx, 'requires_disability_assistance', e.target.checked)}
                                    />
                                    <HelpCircle size={16} /> Disability Assistance
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer bg-[var(--glass-bg)] p-2 rounded hover:bg-[var(--glass-border)] transition-all">
                                    <input 
                                        type="checkbox" 
                                        checked={p.has_children}
                                        onChange={e => handlePassengerChange(idx, 'has_children', e.target.checked)}
                                    />
                                    <Baby size={16} /> Traveling with Children
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer bg-[var(--glass-bg)] p-2 rounded hover:bg-[var(--glass-border)] transition-all">
                                    <input 
                                        type="checkbox" 
                                        checked={p.has_pets}
                                        onChange={e => handlePassengerChange(idx, 'has_pets', e.target.checked)}
                                    />
                                    <PawPrint size={16} /> Traveling with Pets (+$50)
                                </label>
                            </div>
                        </div>
                    ))}

                    <div className="glass-panel p-6 mt-6">
                        <h3 className="text-xl mb-4 flex items-center gap-2"><CreditCard size={20} /> Payment Details</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <input type="text" placeholder="Card Number" className="input-field" defaultValue="**** **** **** 1234" disabled />
                            <div className="flex gap-4">
                                <input type="text" placeholder="MM/YY" className="input-field" defaultValue="12/26" disabled />
                                <input type="text" placeholder="CVV" className="input-field" defaultValue="***" disabled />
                            </div>
                        </div>
                        <p className="text-xs text-muted mt-2">Mock payment processing is enabled for development.</p>
                    </div>

                    <button type="submit" className="btn-primary w-full mt-8 text-2xl py-4 flex items-center justify-center gap-3" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" /> : <CreditCard />} Pay & Confirm Booking
                    </button>
                </form>
            </div>

            <div className="md:col-span-1">
                <div className="glass-panel p-6 sticky top-24">
                    <h2 className="text-2xl mb-6">Order Summary</h2>
                    <div className="flex-col gap-4 mb-6">
                        {selectedFlights.map(f => (
                            <div key={f.id} className="flex justify-between items-center text-sm mb-2">
                                <span>Flight {f.flight_number} (×{searchParams.passengers})</span>
                                <span>${(parseFloat(searchParams.cabinClass === 'economy' ? f.price_economy : f.price_business) * searchParams.passengers).toFixed(2)}</span>
                            </div>
                        ))}
                        {selectedHotel && (
                            <div className="flex justify-between items-center text-sm mb-2">
                                <span>Hotel: {selectedHotel.name} ({Math.ceil(durationDays)} nights)</span>
                                <span>${(parseFloat(selectedHotel.price_per_night) * Math.ceil(durationDays)).toFixed(2)}</span>
                            </div>
                        )}
                        {selectedCab && (
                            <div className="flex justify-between items-center text-sm mb-2">
                                <span>Cab: {selectedCab.vehicle_model} (Est. 10km)</span>
                                <span>${(parseFloat(selectedCab.price_per_km) * 10).toFixed(2)}</span>
                            </div>
                        )}
                        {passengers.filter(p => p.has_pets).length > 0 && (
                            <div className="flex justify-between items-center text-sm text-muted">
                                <span>Pet Fee (×{passengers.filter(p => p.has_pets).length})</span>
                                <span>${passengers.filter(p => p.has_pets).length * 50}</span>
                            </div>
                        )}
                    </div>
                    <div className="border-t border-[var(--glass-border)] pt-4 flex justify-between items-center font-bold text-2xl">
                        <span>Total</span>
                        <span className="text-gold">${totalPrice}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
