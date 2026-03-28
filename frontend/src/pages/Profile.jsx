import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Settings, Activity, Calendar } from 'lucide-react';

const Profile = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen app-bg flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="pt-32 min-h-screen app-bg text-center text-gray-300 px-6">
                <h1 className="text-3xl font-bold mb-4 text-white">Profile Settings</h1>
                <p>Please log in to view your profile details.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen app-bg px-6" style={{ paddingTop: '8rem', paddingBottom: '5rem' }}>
            <div className="space-y-8" style={{ maxWidth: '900px', margin: '0 auto' }}>
                
                {/* Header Section */}
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
                    <p className="text-muted">View and manage your account details and preferences.</p>
                </div>

                {/* Profile Card */}
                <div className="glass-panel p-8 rounded-2xl flex flex-col md:flex-row gap-8 items-start relative overflow-hidden" style={{ border: '1px solid var(--glass-border)' }}>
                    {/* Decorative glow */}
                    <div style={{ position: 'absolute', top: 0, right: 0, width: '16rem', height: '16rem', background: 'var(--primary)', opacity: 0.15, filter: 'blur(60px)', borderRadius: '50%', zIndex: -1, transform: 'translate(50%, -50%)' }}></div>
                    
                    <div className="rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-xl flex-shrink-0" style={{ width: '6rem', height: '6rem', background: 'linear-gradient(to top right, var(--primary), var(--secondary))', border: '4px solid rgba(255,255,255,0.05)' }}>
                        {user.username.charAt(0).toUpperCase()}
                    </div>
                    
                    <div className="flex-1 w-full space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* Detail Item: Username */}
                            <div className="space-y-1">
                                <label className="text-sm text-muted flex items-center gap-2 mb-2">
                                    <User size={14} /> Full Name / Username
                                </label>
                                <div className="text-lg font-semibold text-white bg-white/5 py-3 px-4 rounded-xl border border-white/5">
                                    {user.username}
                                </div>
                            </div>

                            {/* Detail Item: Email */}
                            <div className="space-y-1">
                                <label className="text-sm text-muted flex items-center gap-2 mb-2">
                                    <Mail size={14} /> Email Address
                                </label>
                                <div className="text-lg font-semibold text-white bg-white/5 py-3 px-4 rounded-xl border border-white/5 break-all">
                                    {user.email || 'Not provided'}
                                </div>
                            </div>

                            {/* Detail Item: Role */}
                            <div className="space-y-1">
                                <label className="text-sm text-muted flex items-center gap-2 mb-2">
                                    <Shield size={14} /> Account Role
                                </label>
                                <div className="text-lg font-semibold text-white bg-white/5 py-3 px-4 rounded-xl border border-white/5 capitalize flex items-center gap-3">
                                    {user.role} 
                                    {user.role === 'admin' && <span className="text-xs text-white px-2 py-1 rounded-full font-bold uppercase tracking-widest" style={{ background: 'var(--primary)' }}>Verified</span>}
                                </div>
                            </div>
                            
                            {/* Detail Item: Status */}
                            <div className="space-y-1">
                                <label className="text-sm text-muted flex items-center gap-2 mb-2">
                                    <Activity size={14} /> Account Status
                                </label>
                                <div className="text-lg font-semibold bg-white/5 py-3 px-4 rounded-xl border flex items-center gap-2" style={{ color: '#34d399', borderColor: 'rgba(52, 211, 153, 0.2)' }}>
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399', display: 'inline-block' }}></span>
                                    Active
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Additional Sections Placeholder */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass-panel p-6 rounded-2xl transition-all">
                        <div className="flex items-center gap-3 mb-4 text-white">
                            <div className="p-2 bg-white/5 rounded-xl text-white" style={{ color: 'var(--primary)' }}><Settings size={20} /></div>
                            <h3 className="font-semibold text-lg">Preferences</h3>
                        </div>
                        <p className="text-sm text-muted pb-4">Manage notifications, language, and display settings.</p>
                        <button className="text-sm font-bold mt-2" style={{ color: 'var(--primary)' }}>Edit Preferences &rarr;</button>
                    </div>

                    <div className="glass-panel p-6 rounded-2xl transition-all">
                        <div className="flex items-center gap-3 mb-4 text-white">
                            <div className="p-2 bg-white/5 rounded-xl text-white" style={{ color: 'var(--secondary)' }}><Calendar size={20} /></div>
                            <h3 className="font-semibold text-lg">Recent Activity</h3>
                        </div>
                        <p className="text-sm text-muted pb-4">View recent bookings, logins, and account changes.</p>
                        <button className="text-sm font-bold mt-2" style={{ color: 'var(--secondary)' }}>View Activity Log &rarr;</button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Profile;
