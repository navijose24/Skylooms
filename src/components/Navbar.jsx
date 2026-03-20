import { Link } from 'react-router-dom';
import { Plane, Search, User } from 'lucide-react';

const Navbar = () => {
    return (
        <header className="app-header">
            <div className="header-container">
                <Link to="/" className="nav-logo">
                    <Plane size={24} className="text-sky-400 transform -rotate-12" />
                    <span>SKYLOOMS</span>
                </Link>
                <div className="flex-1 flex justify-center gap-12 text-sm">
                    <Link to="/" className="text-white hover:text-sky-400 font-semibold transition">Book</Link>
                    <Link to="/manage" className="text-white hover:text-sky-400 font-semibold transition">Manage</Link>
                    <Link to="/status" className="text-white hover:text-sky-400 font-semibold transition">Status</Link>
                    <Link to="/explore" className="text-white hover:text-sky-400 font-semibold transition">Explore</Link>
                </div>
                <div className="flex items-center gap-6">
                    <Search size={20} className="text-white cursor-pointer hover:text-sky-400" />
                    <User size={20} className="text-white cursor-pointer hover:text-sky-400" />
                </div>
            </div>
        </header>
    );
};

export default Navbar;
