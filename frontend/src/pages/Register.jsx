import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, UserPlus, ArrowRight } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: ''
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        const result = await register(formData);
        if (result.success) {
            navigate('/login');
        } else {
            setError(result.error);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="auth-card max-w-md w-full glass p-8 rounded-2xl border-white/10 shadow-2xl animate-fade-in">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-gradient">Join Skylooms</h1>
                    <p className="text-white/60 mt-2">Start your premium travel experience</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm animate-shake">
                            {typeof error === 'string' ? error : Object.values(error).flat().join(', ')}
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/60 ml-1">First Name</label>
                            <input
                                type="text"
                                value={formData.first_name}
                                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                className="w-full bg-white/5 border-white/10 rounded-xl py-4 px-4 text-white focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-white/10"
                                placeholder="John"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/60 ml-1">Last Name</label>
                            <input
                                type="text"
                                value={formData.last_name}
                                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                className="w-full bg-white/5 border-white/10 rounded-xl py-4 px-4 text-white focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-white/10"
                                placeholder="Doe"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/60 ml-1">Username</label>
                        <div className="relative group">
                            <div className="absolute left-4 inset-y-0 flex items-center pointer-events-none">
                                <User className="text-white/20 group-focus-within:text-blue-500 transition-colors" size={20} />
                            </div>
                            <input
                                type="text"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                className="w-full bg-white/5 border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-white/10"
                                placeholder="johndoe123"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/60 ml-1">Email Address</label>
                        <div className="relative group">
                            <div className="absolute left-4 inset-y-0 flex items-center pointer-events-none">
                                <Mail className="text-white/20 group-focus-within:text-blue-500 transition-colors" size={20} />
                            </div>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full bg-white/5 border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-white/10"
                                placeholder="john.doe@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/60 ml-1">Password</label>
                        <div className="relative group">
                            <div className="absolute left-4 inset-y-0 flex items-center pointer-events-none">
                                <Lock className="text-white/20 group-focus-within:text-blue-500 transition-colors" size={20} />
                            </div>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full bg-white/5 border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-white/10"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 group transition-all transform active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? 'Creating account...' : 'Create Account'}
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>

                <div className="mt-8 pt-8 border-t border-white/5 text-center">
                    <p className="text-white/40">
                        Already have an account? {' '}
                        <Link to="/login" className="text-white hover:text-blue-400 font-semibold transition-colors">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
