import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, User, CreditCard, Luggage, Coffee, Clock, Loader2, AlertCircle } from 'lucide-react';

const Manage = () => {
    const [reference, setReference] = useState('');
    const [lastName, setLastName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [cancelRef, setCancelRef] = useState('');
    const [cancelLast, setCancelLast] = useState('');
    const [cancelLoading, setCancelLoading] = useState(false);
    const [cancelError, setCancelError] = useState('');
    const navigate = useNavigate();

    const handleFindBooking = async () => {
        if (!reference || !lastName) {
            setError('Please fill in both fields');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`http://localhost:8000/api/bookings/search/?reference=${reference}&last_name=${lastName}`);
            if (res.ok) {
                const data = await res.json();
                navigate(`/success/${data.id}`);
            } else {
                const errData = await res.json();
                setError(errData.error || 'Booking not found. Please check your details.');
            }
        } catch (err) {
            setError('Unable to reach the server. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelSearch = async () => {
        if (!cancelRef || !cancelLast) {
            setCancelError('Please fill in both fields');
            return;
        }
        setCancelLoading(true);
        setCancelError('');
        try {
            const res = await fetch(`http://localhost:8000/api/bookings/search/?reference=${cancelRef}&last_name=${cancelLast}`);
            if (res.ok) {
                const data = await res.json();
                navigate(`/cancel/${data.id}`);
            } else {
                const errData = await res.json();
                setCancelError(errData.error || 'Booking not found. Please check your details.');
            }
        } catch (err) {
            setCancelError('Unable to reach the server. Please try again later.');
        } finally {
            setCancelLoading(false);
        }
    };

    return (
        <div className="container py-20 animate-slide-up">
            <h1 className="text-5xl font-bold mb-4">Manage Your Booking</h1>
            <p className="text-xl text-muted mb-12">Take full control of your journey and onboard experience.</p>
            
            <div className="grid md:grid-cols-3 gap-8">
                {[
                    { icon: <User />, name: 'Personal Details', desc: 'Securely manage your travel documents and contact info.' },
                    { icon: <Luggage />, name: 'Extra Baggage', desc: 'Add bags and sports equipment to your journey in seconds.' },
                    { icon: <Settings />, name: 'Seat Selection', desc: 'Pick your perfect spot or upgrade for extra legroom.' },
                    { icon: <Coffee />, name: 'Meals & Beverages', desc: 'Pre-order from our curated selection of onboard delicacies.' },
                    { icon: <Clock />, name: 'Priority Access', desc: 'Enjoy priority check-in and lounge access for a smooth start.' },
                    { icon: <CreditCard />, name: 'Payment & Invoices', desc: 'Access your receipts and manage your payment methods.' }
                ].map((item, i) => (
                    <div key={i} className="glass-panel p-10 hover:border-sky-500/50 transition-all duration-300 group cursor-pointer relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-sky-500/10 transition-colors"></div>
                        <div className="text-sky-400 mb-8 transform group-hover:scale-110 transition-transform origin-left">
                            {React.cloneElement(item.icon, { size: 32 })}
                        </div>
                        <h3 className="text-2xl font-bold mb-4 text-main-color group-hover:text-sky-400 transition-colors">{item.name}</h3>
                        <p className="text-muted leading-relaxed text-sm">{item.desc}</p>
                    </div>
                ))}
            </div>

            <div className="mt-32 glass-panel p-16 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-sky-500/5 to-transparent pointer-events-none"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12">
                    <div className="max-w-xl">
                        <span className="text-sky-400 font-bold tracking-widest text-xs uppercase mb-4 block">Reservation Check</span>
                        <h2 className="text-4xl font-bold mb-6">Retrieve Your Booking</h2>
                        <p className="text-muted text-lg leading-relaxed">Enter your 6-digit booking reference and surname to manage your upcoming flight details and services.</p>
                        
                        {error && (
                            <div className="mt-6 flex items-center gap-2 text-red-400 bg-red-400/10 p-4 rounded-lg animate-shake">
                                <AlertCircle size={18} />
                                <span className="text-sm font-semibold">{error}</span>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex-1 w-full flex flex-col sm:flex-row gap-6 items-end">
                        <div className="flex flex-col flex-1">
                            <label className="text-xs font-bold text-muted uppercase mb-3 block opacity-60">Reference Number</label>
                            <input 
                                type="text" 
                                placeholder="e.g. SL7H3K" 
                                className="input-field uppercase"
                                value={reference}
                                onChange={(e) => setReference(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col flex-1">
                            <label className="text-xs font-bold text-muted uppercase mb-3 block opacity-60">Last Name</label>
                            <input 
                                type="text" 
                                placeholder="as on passport" 
                                className="input-field"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                            />
                        </div>
                        <div className="w-full sm:w-auto">
                            <button 
                                className="btn-primary w-full sm:w-[180px] h-[56px] rounded-xl shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2"
                                onClick={handleFindBooking}
                                disabled={loading}
                            >
                                {loading ? <Loader2 className="animate-spin" /> : 'Find Booking'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-16 glass-panel p-16 relative overflow-hidden border-t-2 border-red-500/20">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent pointer-events-none"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12">
                    <div className="max-w-xl">
                        <span className="text-red-400 font-bold tracking-widest text-xs uppercase mb-4 block">Cancellation Check</span>
                        <h2 className="text-4xl font-bold mb-6">Cancel Your Booking</h2>
                        <p className="text-muted text-lg leading-relaxed">Enter your 6-digit booking reference and surname to proceed with cancellation and view refund options.</p>
                        
                        {cancelError && (
                            <div className="mt-6 flex items-center gap-2 text-red-400 bg-red-400/10 p-4 rounded-lg animate-shake">
                                <AlertCircle size={18} />
                                <span className="text-sm font-semibold">{cancelError}</span>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex-1 w-full flex flex-col sm:flex-row gap-6 items-end">
                        <div className="flex flex-col flex-1">
                            <label className="text-xs font-bold text-muted uppercase mb-3 block opacity-60">Reference Number</label>
                            <input 
                                type="text" 
                                placeholder="e.g. SL7H3K" 
                                className="input-field uppercase"
                                value={cancelRef}
                                onChange={(e) => setCancelRef(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col flex-1">
                            <label className="text-xs font-bold text-muted uppercase mb-3 block opacity-60">Last Name</label>
                            <input 
                                type="text" 
                                placeholder="as on passport" 
                                className="input-field"
                                value={cancelLast}
                                onChange={(e) => setCancelLast(e.target.value)}
                            />
                        </div>
                        <div className="w-full sm:w-auto">
                            <button 
                                className="btn-primary w-full sm:w-[180px] h-[56px] rounded-xl shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700"
                                onClick={handleCancelSearch}
                                disabled={cancelLoading}
                            >
                                {cancelLoading ? <Loader2 className="animate-spin" /> : 'Cancel Booking'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Manage;
