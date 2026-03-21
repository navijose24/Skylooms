import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, AtSign, ArrowRight } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const result = await login(username, password);
        if (result.success) {
            navigate('/');
        } else {
            setError(result.error);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="auth-card max-w-md w-full glass p-8 rounded-2xl border-white/10 shadow-2xl animate-fade-in">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-gradient">Welcome Back</h1>
                    <p className="text-white/60 mt-2">Sign in to your Skylooms account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm animate-shake">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/60 ml-1">Username</label>
                        <div className="relative group">
                            <div className="absolute left-4 inset-y-0 flex items-center pointer-events-none">
                                <User className="text-white/20 group-focus-within:text-blue-500 transition-colors" size={20} />
                            </div>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-white/5 border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-white/10"
                                placeholder="Enter your username"
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
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white/5 border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-white/10"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input type="checkbox" className="w-4 h-4 rounded border-white/10 bg-white/5 text-blue-500 focus:ring-offset-0 focus:ring-blue-500/50" />
                            <span className="text-white/40 group-hover:text-white/60 transition-colors">Remember me</span>
                        </label>
                        <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">Forgot password?</a>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 group transition-all transform active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>

                <div className="mt-8 pt-8 border-t border-white/5 text-center">
                    <p className="text-white/40">
                        Don't have an account? {' '}
                        <Link to="/register" className="text-white hover:text-blue-400 font-semibold transition-colors">Create Account</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
