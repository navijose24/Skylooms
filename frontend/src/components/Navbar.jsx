import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plane, User, Moon, Sun, Menu, X, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    if (location.pathname.startsWith('/admin')) return null;

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <header className={`app-header ${scrolled ? 'scrolled' : ''}`}>
            <div className="header-container">
                <Link to="/" className="nav-logo">Skylooms</Link>

                {/* Desktop Navigation */}
                <nav className="desktop-nav">
                    <Link to="/" className="nav-link">Book</Link>
                    <Link to="/manage" className="nav-link">Manage</Link>
                    <Link to="/status" className="nav-link">Status</Link>
                    <Link to="/explore" className="nav-link">Explore</Link>
                    <Link to="/offers" className="nav-link">Offers</Link>
                </nav>

                <div className="flex items-center gap-4 md:gap-6">
                    <div onClick={toggleTheme} className="theme-toggle">
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </div>
                    
                    {!user ? (
                        <Link to="/login" className="nav-btn-primary flex items-center gap-2">
                            <LogIn size={18} />
                            <span className="hidden md:inline">Sign In</span>
                        </Link>
                    ) : (
                        <div className="relative">
                            <button 
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-2 nav-icon"
                            >
                                <User size={20} />
                                <span className="hidden md:inline text-sm font-medium">{user.username}</span>
                            </button>
                            
                            {isProfileOpen && (
                                <div className="absolute right-0 mt-2 w-48 glass rounded-2xl border border-white/10 shadow-2xl py-2 z-50">
                                    {user.role === 'admin' && (
                                        <Link to="/admin" className="block px-4 py-2 text-sm text-emerald-400 font-medium hover:bg-white/5 transition-colors">Admin Dashboard</Link>
                                    )}
                                    <Link to="/profile" className="block px-4 py-2 text-sm hover:bg-white/5 transition-colors">Profile Settings</Link>
                                    <button 
                                        onClick={logout}
                                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 transition-colors flex items-center gap-2"
                                    >
                                        <LogOut size={16} /> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {/* Mobile Menu Button */}
                    <button className="mobile-menu-btn" onClick={toggleMenu}>
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Overlay */}
            <div className={`mobile-nav-overlay ${isMenuOpen ? 'open' : ''}`} onClick={() => setIsMenuOpen(false)}>
                <nav className="mobile-nav" onClick={e => e.stopPropagation()}>
                    <Link to="/" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>Book</Link>
                    <Link to="/manage" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>Manage</Link>
                    <Link to="/status" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>Status</Link>
                    <Link to="/explore" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>Explore</Link>
                    <Link to="/offers" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>Offers</Link>
                    <hr className="mobile-nav-divider" />
                    <div className="mobile-nav-footer">
                        {user?.role === 'admin' && (
                            <Link to="/admin" className="mobile-nav-link flex items-center gap-2 text-emerald-400" onClick={() => setIsMenuOpen(false)}>
                                <User size={18} /> Admin Dashboard
                            </Link>
                        )}
                        <Link to="/profile" className="mobile-nav-link flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                            <User size={18} /> Profile
                        </Link>
                    </div>
                </nav>
            </div>
        </header>
    );
};

export default Navbar;
