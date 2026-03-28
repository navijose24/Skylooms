import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { 
  LayoutDashboard, ShoppingCart, Package, Briefcase, 
  Wrench, Users, Settings, LogOut, Check, X
} from 'lucide-react';

export const AdminStyles = () => (
  <style>{`
    .mobile-bottom-nav {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: white;
      border-top: 1px solid #f1f5f9;
      display: flex;
      justify-content: space-around;
      align-items: center;
      padding: 12px 6px;
      z-index: 1000;
      box-shadow: 0 -4px 10px rgba(0,0,0,0.03);
    }
    .mobile-nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      color: #94a3b8;
      font-size: 10px;
      font-weight: 600;
      flex: 1;
      background: none;
      border: none;
      outline: none;
      cursor: pointer;
    }
    .mobile-nav-item.active {
      color: #2563eb;
    }
    
    #admin-root {
      --admin-text-main: #334155;
      --admin-text-muted: #64748b;
      --admin-bg-white: #ffffff;
      --admin-bg-light: #f8fafc;
      --admin-bg-sidebar: #1e293b;
      background-color: #f1f5f9;
      color: var(--admin-text-main);
      height: 100vh;
      overflow: hidden;
      display: flex;
      font-family: sans-serif;
    }
    
    #admin-root * { color: inherit; }
    #admin-root .bg-white { background-color: var(--admin-bg-white) !important; }
    #admin-root .bg-gray-50 { background-color: var(--admin-bg-light) !important; }
    #admin-root .bg-gray-100 { background-color: #f1f5f9 !important; }
    #admin-root .bg-gray-800 { background-color: #2563eb !important; color: #fff !important; }
    #admin-root .sidebar-blue { background-color: #2563eb !important; }
    
    #admin-root .text-gray-900 { color: #0f172a !important; }
    #admin-root .text-gray-800 { color: #1e293b !important; }
    #admin-root .text-gray-700 { color: #334155 !important; }
    #admin-root .text-gray-500 { color: #64748b !important; }
    #admin-root .text-gray-400 { color: #cbd5e1 !important; }
    #admin-root .text-white { color: #ffffff !important; }
    #admin-root .text-blue-500 { color: #3b82f6 !important; }
    #admin-root .text-emerald-500 { color: #10b981 !important; }
    #admin-root .text-orange-500 { color: #f97316 !important; }
    #admin-root .text-red-500 { color: #ef4444 !important; }
    #admin-root .text-red-400 { color: #f87171 !important; }
    #admin-root .text-red-100 { color: #fee2e2 !important; }

    #admin-root .bg-orange-500 { background-color: #f97316 !important; color: #fff; }
    #admin-root .bg-blue-100 { background-color: #dbeafe !important; }
    #admin-root .bg-emerald-400 { background-color: #34d399 !important; }
    #admin-root .bg-red-400 { background-color: #f87171 !important; }

    .sidebar-active-container {
      position: relative;
      background: white;
      color: #2563eb !important;
      border-top-left-radius: 30px;
      border-bottom-left-radius: 30px;
      margin-left: 20px;
      padding-left: 20px;
    }
    
    .sidebar-active-container::before {
      content: "";
      position: absolute;
      background-color: transparent;
      bottom: 100%;
      right: 0;
      height: 20px;
      width: 20px;
      border-bottom-right-radius: 20px;
      box-shadow: 0 10px 0 0 white;
      pointer-events: none;
    }

    .sidebar-active-container::after {
      content: "";
      position: absolute;
      background-color: transparent;
      top: 100%;
      right: 0;
      height: 20px;
      width: 20px;
      border-top-right-radius: 20px;
      box-shadow: 0 -10px 0 0 white;
      pointer-events: none;
    }

    .sidebar-item-active * {
      color: #2563eb !important;
    }
    
    #admin-root .text-xs { font-size: 0.75rem !important; }

    /* Gradients */
    .from-orange-400 { --tw-gradient-from: #fb923c; --tw-gradient-stops: var(--tw-gradient-from), #f97316; }
    .from-purple-500 { --tw-gradient-from: #a855f7; --tw-gradient-stops: var(--tw-gradient-from), #9333ea; }
    .from-emerald-400 { --tw-gradient-from: #34d399; --tw-gradient-stops: var(--tw-gradient-from), #10b981; }
    .from-gray-800 { --tw-gradient-from: #1f2937; --tw-gradient-stops: var(--tw-gradient-from), #111827; }
    .from-cyan-400 { --tw-gradient-from: #22d3ee; --tw-gradient-stops: var(--tw-gradient-from), #06b6d4; }
    
    .bg-gradient-to-br {
      background-image: linear-gradient(to bottom right, var(--tw-gradient-stops));
    }

    /* Essential Layout structures */
    .flex { display: flex !important; }
    .flex-col { flex-direction: column !important; }
    .flex-1 { flex: 1 1 0% !important; }
    .flex-shrink-0 { flex-shrink: 0 !important; }
    .items-center { align-items: center !important; }
    .items-start { align-items: flex-start !important; }
    .justify-between { justify-content: space-between !important; }
    .justify-center { justify-content: center !important; }
    
    .admin-layout-root {
      padding-bottom: 64px !important;
    }
    .sidebar-desktop {
      display: none !important;
    }
    .mobile-nav-container {
      display: flex !important;
    }
    
    @media (min-width: 768px) {
      .admin-layout-root {
        padding-bottom: 0px !important;
      }
      .sidebar-desktop {
        display: block !important;
      }
      .mobile-nav-container {
        display: none !important;
      }
      
      .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
      .md\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }
      .md\\:flex { display: flex !important; }
      .md\\:w-3\\/4 { width: 75% !important; }
      .md\\:w-1\\/2 { width: 50% !important; }
      .md\\:p-8 { padding: 2rem !important; }
    }
    @media (min-width: 1024px) {
      .lg\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
      .lg\\:grid-cols-5 { grid-template-columns: repeat(5, minmax(0, 1fr)) !important; }
      .lg\\:col-span-2 { grid-column: span 2 / span 2 !important; }
    }

    /* Spacing & Sizes */
    .w-64 { width: 16rem !important; }
    .w-full { width: 100% !important; }
    .min-h-screen { min-height: 100vh !important; }
    .h-screen { height: 100vh !important; }
    .h-full { height: 100% !important; }
    .h-8 { height: 2rem !important; } .w-8 { width: 2rem !important; }
    .h-10 { height: 2.5rem !important; } .w-10 { width: 2.5rem !important; }
    .h-24 { height: 6rem !important; } .w-24 { width: 6rem !important; }
    .max-w-7xl { max-width: 80rem !important; }
    .mx-auto { margin-left: auto !important; margin-right: auto !important; }

    .gap-1 { gap: 0.25rem !important; }
    .gap-2 { gap: 0.5rem !important; }
    .gap-3 { gap: 0.75rem !important; }
    .gap-4 { gap: 1rem !important; }
    .gap-6 { gap: 1.5rem !important; }
    
    .p-2 { padding: 0.5rem !important; }
    .p-4 { padding: 1rem !important; }
    .p-6 { padding: 1.5rem !important; }
    .p-8 { padding: 2rem !important; }
    .px-2 { padding-left: 0.5rem !important; padding-right: 0.5rem !important; }
    .px-4 { padding-left: 1rem !important; padding-right: 1rem !important; }
    .px-6 { padding-left: 1.5rem !important; padding-right: 1.5rem !important; }
    .py-1 { padding-top: 0.25rem !important; padding-bottom: 0.25rem !important; }
    .py-2 { padding-top: 0.5rem !important; padding-bottom: 0.5rem !important; }
    .py-3 { padding-top: 0.75rem !important; padding-bottom: 0.75rem !important; }
    .py-4 { padding-top: 1rem !important; padding-bottom: 1rem !important; }
    .pt-16 { padding-top: 4rem !important; }
    
    .mb-6 { margin-bottom: 1.5rem !important; }
    .mb-8 { margin-bottom: 2rem !important; }
    .mt-auto { margin-top: auto !important; }

    /* Typography */
    .text-xs { font-size: 0.75rem !important; }
    .text-sm { font-size: 0.875rem !important; }
    .text-lg { font-size: 1.125rem !important; }
    .text-xl { font-size: 1.25rem !important; }
    .text-3xl { font-size: 1.875rem !important; }
    
    .font-semibold { font-weight: 600 !important; }
    .font-bold { font-weight: 700 !important; }
    .tracking-wide { letter-spacing: 0.025em !important; }
    .uppercase { text-transform: uppercase !important; }
    .capitalize { text-transform: capitalize !important; }
    
    .text-center { text-align: center !important; }
    .text-right { text-align: right !important; }

    /* Borders & Radius & Shadow */
    .rounded-lg { border-radius: 0.5rem !important; }
    .rounded-xl { border-radius: 0.75rem !important; }
    .rounded-2xl { border-radius: 1rem !important; }
    .rounded-full { border-radius: 9999px !important; }
    .rounded-tr-3xl { border-top-right-radius: 1.5rem !important; }
    
    .border { border-width: 1px !important; }
    .border-b { border-bottom-width: 1px !important; }
    
    .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important; }

    /* Absolute/Positioning/Opacity */
    .relative { position: relative !important; }
    .absolute { position: absolute !important; }
    .-bottom-6 { bottom: -1.5rem !important; }
    .-right-6 { right: -1.5rem !important; }
    .-top-1 { top: -0.25rem !important; }
    .-right-1 { right: -0.25rem !important; }
    .z-10 { z-index: 10 !important; }
    .opacity-10 { opacity: 0.1 !important; }
    .opacity-90 { opacity: 0.9 !important; }
    .opacity-0 { opacity: 0 !important; }
    .group:hover .group-hover\\:opacity-100 { opacity: 1 !important; }
    
    .transition-opacity { transition-property: opacity !important; transition-duration: 200ms !important; }
    .transition-all { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }

    .border-none { border-style: none !important; }
    .inset-y-0 { top: 0; bottom: 0; }
    .pointer-events-none { pointer-events: none !important; }
    .pl-3 { padding-left: 0.75rem !important; }
    .pl-10 { padding-left: 2.5rem !important; }
    .pr-4 { padding-right: 1rem !important; }

    .overflow-hidden { overflow: hidden !important; }
    .overflow-y-auto { overflow-y: auto !important; }
    .antialiased { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
  `}</style>
);

const NavItem = ({ icon: Icon, path, label, onClick }) => {
  const location = useLocation();
  const active = path && (location.pathname === path || (path !== '/admin' && location.pathname.startsWith(path)));
  
  if (onClick) {
    return (
      <button onClick={onClick} className="mobile-nav-item">
        <Icon size={20} />
        <span>{label}</span>
      </button>
    );
  }
  
  return (
    <Link to={path} className={`mobile-nav-item ${active ? 'active' : ''}`}>
      <Icon size={20} />
      <span>{label}</span>
    </Link>
  );
};

const AdminLayout = ({ children }) => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  if (loading) return <div className="p-8 text-center text-gray-900 bg-gray-50 min-h-screen">Loading...</div>;

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" />;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div id="admin-root" className={`h-screen flex font-sans antialiased admin-layout-root overflow-hidden`}>
      <AdminStyles />
      
      {/* Sidebar - Desktop Only now */}
      <div className="sidebar-desktop h-full">
        <AdminSidebar />
      </div>

      {/* Mobile Bottom Nav */}
      <div className="mobile-nav-container mobile-bottom-nav">
        <NavItem icon={LayoutDashboard} path="/admin" label="Home" />
        <NavItem icon={ShoppingCart} path="/admin/bookings" label="Bookings" />
        <NavItem icon={Package} path="/admin/flights" label="Flights" />
        <NavItem icon={Users} path="/admin/users" label="Users" />
        <NavItem icon={LogOut} label="Logout" onClick={handleLogout} />
      </div>

      <div className="flex-1 overflow-y-auto h-full">
        {/* Render children directly if passed, else render Outlet (useful for React Router) */}
        {children || <Outlet />}
      </div>
    </div>
  );
};

export default AdminLayout;
