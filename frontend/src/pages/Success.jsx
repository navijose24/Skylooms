import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Download, Home, Plane, Hotel, Car, Clock, Ticket } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const Success = () => {
    const { id } = useParams();
    const navigate = useNavigate();
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

    const ticketRefs = useRef([]);
    const hotelRef = useRef(null);
    const cabRef = useRef(null);

    const handleDownload = async () => {
        const printableElements = [
            ...ticketRefs.current.filter(el => el !== null),
            hotelRef.current,
            cabRef.current
        ].filter(el => el !== null);

        if (!printableElements.length) return;

        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        const margin = 10;
        const targetWidth = pdfWidth - (margin * 2);

        for (let i = 0; i < printableElements.length; i++) {
            const element = printableElements[i];

            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                backgroundColor: null,
                logging: false,
                ignoreElements: (el) => el.hasAttribute('data-html2canvas-ignore')
            });

            const imgData = canvas.toDataURL('image/png');
            const imgHeight = (canvas.height * targetWidth) / canvas.width;

            if (i > 0) {
                pdf.addPage();
            }

            let yOffset = margin;
            if (imgHeight < pdfHeight - (margin * 2)) {
                yOffset = (pdfHeight - imgHeight) / 2;
            }

            pdf.addImage(imgData, 'PNG', margin, yOffset, targetWidth, imgHeight);
        }

        const filename = `booking_${booking?.reference_number || 'details'}.pdf`;
        pdf.save(filename);
    };

    const handleCancelClick = () => {
        navigate(`/cancel/${id}`);
    };

    if (loading) return <div className="container mt-8 text-center"><p>Finalizing your journey...</p></div>;

    const firstPassenger = booking?.passengers?.[0];
    const passengerName = firstPassenger ? `${firstPassenger.first_name} ${firstPassenger.last_name}` : 'Passenger';
    const firstFlight = booking?.flights_details?.[0];

    const formatTime = (dateStr) => {
        if (!dateStr) return '--:--';
        return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '---';
        return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    return (
        <div className="container mt-8 animate-slide-up flex flex-col items-center pb-20">
            <div className="text-center mb-10">
                {booking?.status === 'cancelled' ? (
                    <>
                        <div className="bg-red-500/20 text-red-500 p-4 rounded-full inline-block mb-6 mx-auto"><AlertCircle size={60}/></div>
                        <h1 className="text-4xl text-gradient mb-2 text-red-500">Booking Cancelled</h1>
                        <p className="text-muted">Your booking has been cancelled. Refund amount: ${booking?.refund_amount}</p>
                    </>
                ) : (
                    <>
                        <CheckCircle size={80} color="#22c55e" className="mb-6 mx-auto" />
                        <h1 className="text-4xl text-gradient mb-2">Booking Confirmed!</h1>
                        <p className="text-muted">Your journey with SkyLoom Airlines starts here. Reference: <strong>{booking?.reference_number}</strong></p>
                    </>
                )}
            </div>

            {booking?.passengers?.map((passenger, pIndex) => (
                booking?.flights_details?.map((flight, fIndex) => {
                    const ticketIndex = (pIndex * (booking.flights_details.length)) + fIndex;
                    return (
                        <div key={`${pIndex}-${fIndex}`} className="ticket-wrapper">
                            <div 
                                ref={el => ticketRefs.current[ticketIndex] = el}
                                className="ticket-container"
                            >
                                <div className="ticket-left">
                                    <div className="ticket-header">
                                        <div className="ticket-logo-box">
                                            <div className="ticket-logo-icon">
                                                <Plane size={20} fill="white" />
                                            </div>
                                            <span>Skylooms</span>
                                        </div>
                                        <div className="ticket-class-badge">
                                            {booking.cabin_class} Class
                                        </div>
                                    </div>

                                    <div className="ticket-flight-info">
                                        <div className="ticket-point">
                                            <div className="ticket-time">{formatTime(flight.departure_time)}</div>
                                            <div className="ticket-date">{formatDate(flight.departure_time)}</div>
                                            <div className="ticket-city">{flight.source.city} ({flight.source.code})</div>
                                        </div>

                                        <div className="ticket-path">
                                            <div className="ticket-path-line">
                                                <div className="ticket-path-dot start"></div>
                                                <div className="ticket-duration-label">{flight.duration?.split(':').slice(0,2).join('h ') + 'm'}</div>
                                                <div className="ticket-path-dot end"></div>
                                            </div>
                                            <div className="ticket-stops">Non-stop</div>
                                        </div>

                                        <div className="ticket-point text-right">
                                            <div className="ticket-time">{formatTime(flight.arrival_time)}</div>
                                            <div className="ticket-date">{formatDate(flight.arrival_time)}</div>
                                            <div className="ticket-city">{flight.destination.city} ({flight.destination.code})</div>
                                        </div>
                                    </div>

                                    <div className="ticket-notice-row">
                                        <div className="ticket-notice-item">
                                            <div className="ticket-notice-icon">
                                                <Ticket size={18} />
                                            </div>
                                            <p>Show e-tickets and passenger identities during check-in.</p>
                                        </div>
                                        <div className="ticket-notice-item">
                                            <div className="ticket-notice-icon">
                                                <Clock size={18} />
                                            </div>
                                            <p>Please be at the boarding gate at least 30 minutes before boarding time.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="ticket-right">
                                    <div className="ticket-detail-group">
                                        <div className="ticket-detail-label">Name</div>
                                        <div className="ticket-detail-value">{passenger.first_name} {passenger.last_name}</div>
                                    </div>
                                    <div className="ticket-detail-group">
                                        <div className="ticket-detail-label">Email</div>
                                        <div className="ticket-detail-value" style={{ fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>{booking.user_email}</div>
                                    </div>
                                    <div className="ticket-detail-group">
                                        <div className="ticket-detail-label">Passport Number</div>
                                        <div className="ticket-detail-value">{passenger.passport_number || 'A-1234567'}</div>
                                    </div>
                                    <div className="ticket-detail-group">
                                        <div className="ticket-detail-label">Booking Code</div>
                                        <div className="ticket-detail-value">{booking.reference_number}</div>
                                    </div>

                                    <div className="ticket-seat-grid">
                                        <div className="ticket-seat-box">
                                            <div className="ticket-detail-label">Gate</div>
                                            <div className="ticket-detail-value">{['A', 'B', 'C', 'D'][fIndex % 4]}{fIndex + 2}</div>
                                        </div>
                                        <div className="ticket-seat-box">
                                            <div className="ticket-detail-label">Seat</div>
                                            <div className="ticket-detail-value">{fIndex + 12}{['A', 'B', 'C', 'D', 'E', 'F'][pIndex % 6]}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })
            ))}

            {(booking?.hotel_details || booking?.cab_details) && (
                <div className="reg-cards-container">
                    {booking?.hotel_details && (
                        <div ref={hotelRef} className="reg-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
                            <div className="reg-card-header">
                                <span className="reg-card-id">ID {Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                                <span className="reg-card-badge">Active</span>
                            </div>
                            <div className="reg-card-body">
                                <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=200&q=80" alt={booking.hotel_details.name} className="reg-card-img" />
                                <div className="reg-card-info">
                                    <h3 className="reg-card-title">{booking.hotel_details.name}</h3>
                                    <div className="reg-card-subtitle">
                                        <Hotel size={14} /> {booking.hotel_details.city}, {booking.flights_details[0]?.destination?.country || ''}
                                    </div>
                                    <div className="reg-card-dates">
                                        <div>
                                            <div className="reg-card-date-label">Check In</div>
                                            <div className="reg-card-date-value">{formatDate(booking.flights_details[0]?.arrival_time)}</div>
                                        </div>
                                        <div>
                                            <div className="reg-card-date-label">Check Out</div>
                                            <div className="reg-card-date-value">{formatDate(booking.flights_details[1]?.departure_time || new Date(new Date(booking.flights_details[0]?.arrival_time).getTime() + 86400000 * 3))}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button data-html2canvas-ignore className="reg-card-button">Contact Reception</button>
                        </div>
                    )}

                    {booking?.cab_details && (
                        <div ref={cabRef} className="reg-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
                            <div className="reg-card-header">
                                <span className="reg-card-id">CAB-{booking.cab_details.id || 'XR921'}</span>
                                <span className="reg-card-badge">Confirmed</span>
                            </div>
                            <div className="reg-card-body">
                                <img src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=200&q=80" alt={booking.cab_details.vehicle_model} className="reg-card-img" />
                                <div className="reg-card-info">
                                    <h3 className="reg-card-title">{booking.cab_details.vehicle_model}</h3>
                                    <div className="reg-card-subtitle">
                                        <Car size={14} /> {booking.cab_details.city} Airport Transfer
                                    </div>
                                    <div className="reg-card-dates">
                                        <div>
                                            <div className="reg-card-date-label">Pickup</div>
                                            <div className="reg-card-date-value">{formatTime(firstFlight?.arrival_time)}</div>
                                        </div>
                                        <div>
                                            <div className="reg-card-date-label">Driver</div>
                                            <div className="reg-card-date-value">{booking.cab_details.driver_name || 'John Doe'}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button data-html2canvas-ignore className="reg-card-button">Contact Driver</button>
                        </div>
                    )}
                </div>
            )}

            <div className="ticket-action-buttons">
                {booking?.status !== 'cancelled' && (
                    <button onClick={handleDownload} className="btn-ticket-primary">
                        Download Ticket
                    </button>
                )}
                <Link to="/" className="btn-ticket-outline flex items-center gap-2">
                    Other Plans
                </Link>
                {booking?.status !== 'cancelled' && (
                    <button onClick={handleCancelClick} className="btn-ticket-outline flex items-center gap-2 border-red-500 text-red-500 hover:bg-red-500/10">
                        Cancel Booking
                    </button>
                )}
            </div>
        </div>
    );
};

export default Success;
