import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';

const CancelBooking = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [canceling, setCanceling] = useState(false);
    const [error, setError] = useState('');
    const [successData, setSuccessData] = useState(null);

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const res = await fetch(`http://localhost:8000/api/bookings/${id}/`);
                if (res.ok) {
                    const data = await res.json();
                    setBooking(data);
                } else {
                    setError('Booking not found');
                }
            } catch (err) {
                setError('Failed to fetch booking details');
            } finally {
                setLoading(false);
            }
        };
        fetchBooking();
    }, [id]);

    const handleCancel = async () => {
        if (!window.confirm('Are you sure you want to proceed with cancellation?')) return;
        setCanceling(true);
        setError('');
        try {
            const res = await fetch(`http://localhost:8000/api/bookings/${id}/cancel/`, { method: 'POST' });
            
            // Check if response is ok and is json
            const text = await res.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch(e) {
                console.error("Server returned non-json:", text);
                throw new Error("Server error, could not cancel booking");
            }

            if (res.ok) {
                setSuccessData(data);
            } else {
                setError(data.error || 'Failed to cancel booking');
            }
        } catch(err) {
            console.error(err);
            setError(err.message || 'Error communicating with server');
        } finally {
            setCanceling(false);
        }
    };

    if (loading) return <div className="container mt-20 text-center"><Loader2 className="animate-spin mx-auto mb-4" /> Loading booking details...</div>;
    
    if (error && !booking) return <div className="container mt-20 text-center text-red-500">{error}</div>;

    if (successData || booking?.status === 'cancelled') {
        const refundAmt = successData?.refund_amount || booking?.refund_amount;
        return (
            <div className="container mt-20 max-w-2xl mx-auto animate-slide-up">
                <div className="glass-panel p-12 text-center border-t-4 border-red-500">
                    <CheckCircle size={64} className="mx-auto text-green-500 mb-6" />
                    <h1 className="text-4xl font-bold mb-4 text-main-color">Booking Cancelled</h1>
                    <p className="text-xl text-muted mb-8">Your reservation has been successfully cancelled.</p>
                    
                    <div className="bg-white/5 rounded-xl p-6 mb-8 text-left">
                        <div className="flex justify-between mb-4 border-b border-white/10 pb-4">
                            <span className="text-muted">Booking Reference</span>
                            <span className="font-bold text-main-color">{booking?.reference_number}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted">Refund Amount</span>
                            <span className="text-2xl font-bold text-sky-400">${parseFloat(refundAmt || 0).toFixed(2)}</span>
                        </div>
                    </div>
                    
                    <button onClick={() => navigate('/')} className="btn-primary px-8">Return Home</button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-20 max-w-3xl mx-auto animate-slide-up">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sky-400 mb-8 hover:text-sky-300 transition">
                <ArrowLeft size={20} /> Back to Booking
            </button>
            
            <div className="glass-panel p-10 border-l-4 border-amber-500">
                <h1 className="text-4xl font-bold mb-4">Cancel Reservation</h1>
                <p className="text-lg text-muted mb-8">Review the cancellation policy before proceeding.</p>
                
                {error && (
                    <div className="bg-red-500/10 text-red-500 p-4 rounded-lg mb-8 flex items-center gap-3">
                        <AlertCircle /> {error}
                    </div>
                )}
                
                <div className="grid md:grid-cols-2 gap-8 mb-10">
                    <div className="bg-white/5 p-6 rounded-xl">
                        <h3 className="text-main-color font-bold mb-4 uppercase tracking-wider text-sm">Booking Details</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between"><span className="text-muted">Reference:</span> <span className="font-bold">{booking.reference_number}</span></div>
                            <div className="flex justify-between"><span className="text-muted">Passengers:</span> <span>{booking.passengers.length}</span></div>
                            <div className="flex justify-between"><span className="text-muted">Total Paid:</span> <span>${booking.total_price}</span></div>
                        </div>
                    </div>
                    
                    <div className="bg-white/5 p-6 rounded-xl">
                        <h3 className="text-main-color font-bold mb-4 uppercase tracking-wider text-sm">Refund Policy</h3>
                        <ul className="space-y-3 text-sm text-muted">
                            <li className="flex items-start gap-2"><div className="w-2 h-2 rounded-full bg-green-500 mt-1"></div> <strong>≥ 3 days prior:</strong> 100% full refund</li>
                            <li className="flex items-start gap-2"><div className="w-2 h-2 rounded-full bg-amber-500 mt-1"></div> <strong>Exactly 2 days prior:</strong> 75% refund</li>
                            <li className="flex items-start gap-2"><div className="w-2 h-2 rounded-full bg-red-500 mt-1"></div> <strong>&lt; 2 days prior:</strong> No refund</li>
                        </ul>
                    </div>
                </div>
                
                <div className="bg-red-500/10 p-6 rounded-xl border border-red-500/30 flex justify-between items-center flex-col sm:flex-row gap-6">
                    <div>
                        <h3 className="text-red-400 font-bold mb-1">Confirm Cancellation</h3>
                        <p className="text-sm text-red-400/80">This action cannot be undone. Seats will be released.</p>
                    </div>
                    <button 
                        onClick={handleCancel} 
                        disabled={canceling}
                        className="btn-primary bg-red-600 hover:bg-red-700 w-full sm:w-auto px-8"
                    >
                        {canceling ? <Loader2 className="animate-spin inline mr-2" /> : null}
                        {canceling ? 'Processing...' : 'Cancel Reservation'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CancelBooking;
