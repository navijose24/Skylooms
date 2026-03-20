import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Download, Home, Plane, Hotel, Car } from 'lucide-react';

const Success = () => {
    const { id } = useParams();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const res = await fetch(`http://localhost:8000/api/bookings/${id}/`);
                if (res.ok) {
                    const data = await res.json();
                    setBooking(data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchBooking();
    }, [id]);

    const handleDownload = () => {
        window.open(`http://localhost:8000/api/bookings/${id}/ticket/`, '_blank');
    };

    if (loading) return <div className="container mt-8 text-center"><p>Finalizing your journey...</p></div>;

    return (
        <div className="container mt-8 animate-slide-up flex-col items-center">
            <div className="glass-panel p-12 text-center max-w-2xl mx-auto w-full">
                <CheckCircle size={80} color="#22c55e" className="mb-6 mx-auto" />
                <h1 className="text-4xl text-gradient mb-2">Booking Confirmed!</h1>
                <p className="text-muted mb-8">Your journey with SkyLoom Airlines starts here. Reference: <strong>SKY-{id.padStart(4, '0')}</strong></p>

                <div className="flex-col gap-4 text-left mb-8 border-t border-b border-[var(--glass-border)] py-6">
                    <div className="flex items-center gap-3">
                        <Plane size={20} color="var(--primary-blue)" />
                        <span>{booking?.flights_details.length} Flight(s) reserved</span>
                    </div>
                    {booking?.hotel_details && (
                        <div className="flex items-center gap-3">
                            <Hotel size={20} color="var(--primary-blue)" />
                            <span>Stay at {booking.hotel_details.name} confirmed</span>
                        </div>
                    )}
                    {booking?.cab_details && (
                        <div className="flex items-center gap-3">
                            <Car size={20} color="var(--primary-blue)" />
                            <span>Airport transfer booked ({booking.cab_details.vehicle_model})</span>
                        </div>
                    )}
                </div>

                <div className="flex flex-col md:flex-row gap-4 justify-center">
                    <button onClick={handleDownload} className="btn-primary flex items-center justify-center gap-2 py-4 px-8 text-xl">
                        <Download size={24} /> Download Ticket
                    </button>
                    <Link to="/" className="btn-primary flex items-center justify-center gap-2 py-4 px-8 text-xl" style={{ background: 'var(--glass-bg)', color: 'white', border: '1px solid var(--glass-border)' }}>
                        <Home size={24} /> Return Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Success;
