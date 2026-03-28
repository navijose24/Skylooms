import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { Plane, Users } from 'lucide-react';

const SeatSelection = () => {
    const { searchParams, selectedFlights, searchParams: { passengers, cabinClass } } = useBooking();
    const [allocatedSeats, setAllocatedSeats] = useState({}); // { flightId: ['1A', '1B'] }
    const [bookedSeats, setBookedSeats] = useState({}); // { flightId: ['2A', '5C'] }
    const [currentFlightIndex, setCurrentFlightIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const flightsToAssign = selectedFlights.filter(f => f); // in case of nulls

    useEffect(() => {
        if (flightsToAssign.length === 0) {
            navigate('/');
            return;
        }

        // Fetch booked seats for the selected flights
        const fetchSeats = async () => {
            try {
                const ids = flightsToAssign.map(f => f.id).join(',');
                const res = await fetch(`http://localhost:8000/api/flights/seats/?ids=${ids}`);
                if (res.ok) {
                    const data = await res.json();
                    const bSeats = {};
                    flightsToAssign.forEach(f => {
                        bSeats[f.id] = data[f.id]?.booked_seats || [];
                    });
                    setBookedSeats(bSeats);
                }
            } catch (err) {
                console.error("Failed to fetch seats", err);
            } finally {
                setLoading(false);
            }
        };

        fetchSeats();
    }, [flightsToAssign, navigate]);

    const currentFlight = flightsToAssign[currentFlightIndex];
    if (!currentFlight) return null;

    const currentFlightAllocated = allocatedSeats[currentFlight.id] || [];
    const currentFlightBooked = bookedSeats[currentFlight.id] || [];

    const handleSeatClick = (seatId) => {
        if (currentFlightBooked.includes(seatId)) return; // already booked

        const isSelected = currentFlightAllocated.includes(seatId);

        if (isSelected) {
            setAllocatedSeats(prev => ({
                ...prev,
                [currentFlight.id]: prev[currentFlight.id].filter(id => id !== seatId)
            }));
        } else {
            if (currentFlightAllocated.length >= passengers) {
                alert(`You can only select ${passengers} seats.`);
                return;
            }
            setAllocatedSeats(prev => ({
                ...prev,
                [currentFlight.id]: [...(prev[currentFlight.id] || []), seatId]
            }));
        }
    };

    const handleContinue = () => {
        if (currentFlightAllocated.length < passengers) {
            alert(`Please select ${passengers} seats for this flight.`);
            return;
        }

        if (currentFlightIndex < flightsToAssign.length - 1) {
            setCurrentFlightIndex(prev => prev + 1);
        } else {
            // Save allocated seats to context/storage so the checkout can use them
            // Pass via router state for simplicity
            navigate('/checkout', { state: { allocatedSeats } });
        }
    };

    const renderSeatMap = () => {
        const startRow = cabinClass === 'business' ? 1 : 6;
        const endRow = cabinClass === 'business' ? 5 : 23;
        const cols = cabinClass === 'business' ? ['A', 'C', 'D', 'F'] : ['A', 'B', 'C', 'D', 'E', 'F']; 
        
        let map = [];
        for (let i = startRow; i <= endRow; i++) {
            const rowSeats = [];
            cols.forEach((col, idx) => {
                const seatId = `${i}${col}`;
                const isBooked = currentFlightBooked.includes(seatId);
                const isSelected = currentFlightAllocated.includes(seatId);
                
                let seatClass = "w-10 h-10 rounded-t-lg rounded-b border shadow-sm flex items-center justify-center text-xs font-bold cursor-pointer transition-all";
                if (isBooked) {
                    seatClass += " bg-white/5 border-white/5 text-white/20 cursor-not-allowed";
                } else if (isSelected) {
                    seatClass += " bg-[var(--primary-blue)] border-sky-300 text-white shadow-[0_0_15px_rgba(0,186,255,0.6)] transform scale-105";
                } else {
                    seatClass += " bg-white/10 text-white/70 hover:bg-white/20";
                    // Color coding according to categories
                    if (cabinClass === 'business' || i <= 10) {
                        seatClass += " border-amber-500/60 hover:border-amber-400 text-amber-200"; // excellence/front rows
                    } else if (i > endRow - 5) {
                        seatClass += " border-emerald-500/60 hover:border-emerald-400 text-emerald-200"; // back row colors
                    } else {
                        seatClass += " border-white/20"; // standard priority
                    }
                }

                rowSeats.push(
                    <div 
                        key={seatId} 
                        className={seatClass}
                        onClick={() => handleSeatClick(seatId)}
                    >
                        {seatId}
                    </div>
                );

                // Add an aisle
                if (cabinClass === 'business' && idx === 1) {
                    rowSeats.push(<div key={`aisle-${i}`} className="w-8"></div>);
                } else if (cabinClass === 'economy' && idx === 2) {
                    rowSeats.push(<div key={`aisle-${i}`} className="w-8"></div>);
                }
            });

            map.push(
                <div key={`row-${i}`} className="flex justify-center items-center gap-2 mb-3">
                    <span className="w-6 text-center text-gray-400 font-medium">{i}</span>
                    {rowSeats}
                </div>
            );
        }
        return map;
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><Plane className="animate-spin" /></div>;

    return (
        <div className="min-h-screen pt-24 pb-20 animate-slide-up">
            <div className="container mx-auto px-4">
                <h1 className="text-4xl text-gradient mb-8 text-center">Select your seats</h1>
                
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left panel: Info */}
                    <div className="lg:w-1/3">
                        <div className="glass-panel p-6 mb-6">
                            <h2 className="text-2xl font-bold mb-2">Flight {currentFlightIndex + 1} of {flightsToAssign.length}</h2>
                            <p className="text-muted mb-6">{currentFlight.source.code} to {currentFlight.destination.code}</p>
                            <div className="flex items-center gap-2 text-white bg-white/10 p-4 rounded-lg mb-6 shadow-inner border border-white/5">
                                <Users size={20} className="text-[var(--primary-blue)]" />
                                <span>Need to select <strong className="text-[var(--primary-blue)]">{passengers - currentFlightAllocated.length}</strong> more seats</span>
                            </div>
                            
                            <hr className="my-6 border-[var(--glass-border)]" />
                            
                            <h3 className="font-bold text-lg mb-4 text-white/90 border-t border-[var(--glass-border)] pt-6">Seat Types</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3"><div className="w-6 h-6 flex-shrink-0 bg-white/5 border border-white/5 rounded-sm"></div> <span className="text-sm text-white/70">Not Available</span></div>
                                <div className="flex items-center gap-3"><div className="w-6 h-6 flex-shrink-0 border bg-white/10 border-amber-500/60 rounded-sm"></div> <span className="text-sm text-amber-200 text-opacity-90">Excellence</span></div>
                                <div className="flex items-center gap-3"><div className="w-6 h-6 flex-shrink-0 border bg-white/10 border-white/20 rounded-sm"></div> <span className="text-sm text-white/80">Standard</span></div>
                                <div className="flex items-center gap-3"><div className="w-6 h-6 flex-shrink-0 bg-[var(--primary-blue)] border border-sky-300 rounded-sm shadow-[0_0_10px_rgba(0,186,255,0.5)]"></div> <span className="text-sm text-white font-bold">Your Selection</span></div>
                            </div>
                        </div>
                    </div>

                    {/* Right panel: Airplane map */}
                    <div className="lg:w-2/3 flex flex-col items-center">
                        <div className="glass-panel p-8 rounded-[3rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] border-8 border-white/5 min-w-[350px]">
                            {/* Plane nose decoration */}
                            <div className="w-full h-16 border-b-2 border-white/10 mb-8 rounded-t-full relative bg-white/5">
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/30">
                                    <Plane size={32} />
                                </div>
                            </div>
                            
                            {/* Columns Header */}
                            <div className="flex justify-center items-center gap-2 mb-6 ml-8">
                                {(cabinClass === 'business' ? ['A', 'C', ' ', 'D', 'F'] : ['A', 'B', 'C', ' ', 'D', 'E', 'F']).map((c, i) => (
                                    <div key={i} className={`text-center font-bold text-white/50 ${c === ' ' ? 'w-8' : 'w-10'}`}>{c}</div>
                                ))}
                            </div>

                            {/* Seats */}
                            {renderSeatMap()}
                        </div>

                        <div className="mt-8 flex gap-4 w-full max-w-lg justify-center">
                            {currentFlightIndex > 0 && (
                                <button className="btn-ghost px-8 py-3 w-full max-w-[200px]"
                                        onClick={() => setCurrentFlightIndex(prev => prev - 1)}>
                                    Previous Flight
                                </button>
                            )}
                            <button className="btn-primary px-8 py-3 w-full max-w-[200px]"
                                    onClick={handleContinue}>
                                {currentFlightIndex < flightsToAssign.length - 1 ? 'Next Flight' : 'Continue to Checkout'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SeatSelection;
