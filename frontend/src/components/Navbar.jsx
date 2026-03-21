import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plane, Search, User, Moon, Sun, Menu, X } from 'lucide-react';

const Navbar = () => {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <header className="app-header">
            <div className="header-container">
                <Link to="/" className="nav-logo">
                    <Plane size={24} className="text-sky-400 transform -rotate-12" />
                    <span>SKYLOOMS</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="desktop-nav">
                    <Link to="/" className="nav-link">Book</Link>
                    <Link to="/manage" className="nav-link">Manage</Link>
                    <Link to="/status" className="nav-link">Status</Link>
                    <Link to="/explore" className="nav-link">Explore</Link>
                </nav>

                <div className="flex items-center gap-4 md:gap-6">
                    <div onClick={toggleTheme} className="theme-toggle">
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </div>
                    <Search size={20} className="nav-icon" />
                    <User size={20} className="nav-icon hidden md:block" />
                    
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
                    <hr className="mobile-nav-divider" />
                    <div className="mobile-nav-footer">
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
