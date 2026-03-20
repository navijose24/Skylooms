import React from 'react';
import { Settings, User, CreditCard, Luggage, Coffee, Clock } from 'lucide-react';

const Manage = () => {
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
                        <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-sky-400 transition-colors">{item.name}</h3>
                        <p className="text-muted leading-relaxed text-sm">{item.desc}</p>
                    </div>
                ))}
            </div>

            <div className="mt-32 glass-panel p-16 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-sky-500/5 to-transparent pointer-events-none"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-12">
                    <div className="max-w-xl">
                        <span className="text-sky-400 font-bold tracking-widest text-xs uppercase mb-4 block">Reservation Check</span>
                        <h2 className="text-4xl font-bold mb-6">Retrieve Your Booking</h2>
                        <p className="text-muted text-lg leading-relaxed">Enter your 6-digit booking reference and surname to manage your upcoming flight details and services.</p>
                    </div>
                    <div className="flex-1 w-full flex flex-col sm:flex-row gap-6">
                        <div className="flex-1">
                            <label className="text-xs font-bold text-muted uppercase mb-3 block opacity-60">Reference Number</label>
                            <input type="text" placeholder="e.g. SL7H3K" className="input-field w-full" />
                        </div>
                        <div className="flex-1">
                            <label className="text-xs font-bold text-muted uppercase mb-3 block opacity-60">Last Name</label>
                            <input type="text" placeholder="as on passport" className="input-field w-full" />
                        </div>
                        <button className="btn-primary px-12 h-[56px] self-end rounded-xl shadow-lg shadow-sky-500/20">Find Booking</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Manage;
