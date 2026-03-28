import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { Menu, X } from 'lucide-react';

export const AdminStyles = () => (
  <style>{`
    /* Reset and Theme Overrides for Admin Pages */
    #admin-root {
      --admin-text-main: #334155;
      --admin-text-muted: #64748b;
      --admin-bg-white: #ffffff;
      --admin-bg-light: #f8fafc;
      --admin-bg-sidebar: #1e293b;
      background-color: #f1f5f9;
      color: var(--admin-text-main);
      min-height: 100vh;
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

    #admin-root .bg-orange-500 { background-color: #f97316 !important; color: #fff; }
    #admin-root .bg-blue-100 { background-color: #dbeafe !important; }
    #admin-root .bg-emerald-400 { background-color: #34d399 !important; }
    #admin-root .bg-red-400 { background-color: #f87171 !important; }

    /* Sidebar Active Item Curve Effect */
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
    
    .grid { display: grid !important; }
    .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)) !important; }
    
    @media (min-width: 768px) {
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
    .h-8 { height: 2rem !important; } .w-8 { width: 2rem !important; }
    .h-10 { height: 2.5rem !important; } .w-10 { width: 2.5rem !important; }
    .h-24 { height: 6rem !important; } .w-24 { width: 6rem !important; }
    .max-w-7xl { max-width: 80rem !important; }
    .max-w-md { max-width: 28rem !important; }
    .mx-auto { margin-left: auto !important; margin-right: auto !important; }

    .gap-1 { gap: 0.25rem !important; }
    .gap-2 { gap: 0.5rem !important; }
    .gap-3 { gap: 0.75rem !important; }
    .gap-4 { gap: 1rem !important; }
    .gap-6 { gap: 1.5rem !important; }
    
    .p-2 { padding: 0.5rem !important; }
    .p-4 { padding: 1rem !important; }
    .p-5 { padding: 1.25rem !important; }
    .p-6 { padding: 1.5rem !important; }
    .p-8 { padding: 2rem !important; }
    .px-2 { padding-left: 0.5rem !important; padding-right: 0.5rem !important; }
    .px-4 { padding-left: 1rem !important; padding-right: 1rem !important; }
    .px-6 { padding-left: 1.5rem !important; padding-right: 1.5rem !important; }
    .py-1 { padding-top: 0.25rem !important; padding-bottom: 0.25rem !important; }
    .py-2 { padding-top: 0.5rem !important; padding-bottom: 0.5rem !important; }
    .py-3 { padding-top: 0.75rem !important; padding-bottom: 0.75rem !important; }
    .py-4 { padding-top: 1rem !important; padding-bottom: 1rem !important; }
    .pt-4 { padding-top: 1rem !important; }
    .pt-16 { padding-top: 4rem !important; }
    .pb-4 { padding-bottom: 1rem !important; }
    .pl-2 { padding-left: 0.5rem !important; }
    
    .mb-1 { margin-bottom: 0.25rem !important; }
    .mb-2 { margin-bottom: 0.5rem !important; }
    .mb-6 { margin-bottom: 1.5rem !important; }
    .mb-8 { margin-bottom: 2rem !important; }
    .mt-0\\.5 { margin-top: 0.125rem !important; }
    .mt-1 { margin-top: 0.25rem !important; }
    .mt-4 { margin-top: 1rem !important; }
    .ml-2 { margin-left: 0.5rem !important; }

    /* Typography */
    .text-xs { font-size: 0.75rem !important; line-height: 1rem !important; }
    .text-sm { font-size: 0.875rem !important; line-height: 1.25rem !important; }
    .text-lg { font-size: 1.125rem !important; line-height: 1.75rem !important; }
    .text-xl { font-size: 1.25rem !important; line-height: 1.75rem !important; }
    .text-3xl { font-size: 1.875rem !important; line-height: 2.25rem !important; }
    
    .font-normal { font-weight: 400 !important; }
    .font-medium { font-weight: 500 !important; }
    .font-semibold { font-weight: 600 !important; }
    .font-bold { font-weight: 700 !important; }
    .tracking-wider { letter-spacing: 0.05em !important; }
    .tracking-widest { letter-spacing: 0.1em !important; }
    .uppercase { text-transform: uppercase !important; }
    .capitalize { text-transform: capitalize !important; }
    
    .text-left { text-align: left !important; }
    .text-center { text-align: center !important; }
    .text-right { text-align: right !important; }

    /* Borders & Radius & Shadow */
    .rounded { border-radius: 0.25rem !important; }
    .rounded-md { border-radius: 0.375rem !important; }
    .rounded-lg { border-radius: 0.5rem !important; }
    .rounded-xl { border-radius: 0.75rem !important; }
    .rounded-2xl { border-radius: 1rem !important; }
    .rounded-full { border-radius: 9999px !important; }
    .rounded-tr-3xl { border-top-right-radius: 1.5rem !important; }
    .rounded-l-md { border-top-left-radius: 0.375rem !important; border-bottom-left-radius: 0.375rem !important; }
    .rounded-r-md { border-top-right-radius: 0.375rem !important; border-bottom-right-radius: 0.375rem !important; }
    
    .border { border-width: 1px !important; }
    .border-2 { border-width: 2px !important; }
    .border-b { border-bottom-width: 1px !important; }
    .border-t { border-top-width: 1px !important; }
    .border-none { border-style: none !important; }
    .border-transparent { border-color: transparent !important; }
    
    .border-gray-50 { border-color: #f9fafb !important; }
    .border-gray-100 { border-color: #f3f4f6 !important; }
    .border-gray-300 { border-color: #d1d5db !important; }
    .border-gray-700 { border-color: #374151 !important; }
    .border-gray-800 { border-color: #1f2937 !important; }
    .border-orange-500 { border-color: #f97316 !important; }

    .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important; }
    .shadow-md { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important; }
    .shadow-orange-500\\/30 { box-shadow: 0 4px 6px -1px rgba(249, 115, 22, 0.3) !important; }

    /* Absolute/Positioning/Overflow */
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

    .overflow-hidden { overflow: hidden !important; }
    .overflow-y-auto { overflow-y: auto !important; }
    .overflow-x-auto { overflow-x: auto !important; }
    .whitespace-nowrap { white-space: nowrap !important; }
    
    .cursor-pointer { cursor: pointer !important; }
    .outline-none { outline: 2px solid transparent !important; outline-offset: 2px !important; }
    .bg-transparent { background-color: transparent !important; }
    .hidden { display: none !important; }
    .hover\\:underline:hover { text-decoration: underline !important; }
    .block { display: block !important; }
    .w-px { width: 1px !important; }
    .h-4 { height: 1rem !important; }
    
    .transition-opacity { transition-property: opacity !important; transition-duration: 150ms !important; }
    .transition-colors { transition-property: color, background-color, border-color, text-decoration-color, fill, stroke !important; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1) !important; transition-duration: 150ms !important; }

    table { border-collapse: collapse; }
    .divide-y > :not([hidden]) ~ :not([hidden]) { border-top: 1px solid #f1f5f9; }
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }

    /* Mobile Sidebar Overrides */
    @media (max-width: 767px) {
      .admin-sidebar-mobile {
        position: fixed !important;
        left: -100%;
        top: 0;
        bottom: 0;
        z-index: 50;
        transition: left 0.3s ease;
        display: flex !important;
      }
      .admin-sidebar-mobile.open {
        left: 0;
      }
      .admin-sidebar-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.5);
        z-index: 40;
        backdrop-filter: blur(4px);
      }
    }
  `}</style>
);

const AdminLayout = ({ children }) => {
  const { user, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (loading) return <div className="p-8 text-center text-gray-900 bg-gray-50 min-h-screen">Loading...</div>;

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return (
    <div id="admin-root" className="min-h-screen flex font-sans antialiased">
      <AdminStyles />
      
      {/* Mobile Toggle & Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-100 p-4 flex justify-between items-center z-30 shadow-sm">
        <span className="font-bold text-blue-600 text-lg">Skylooms</span>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-gray-500 hover:text-blue-500 transition-colors"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar with mobile classes */}
      <div className={`admin-sidebar-mobile ${isSidebarOpen ? 'open' : ''} md:relative md:left-0 md:flex`}>
        <AdminSidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="admin-sidebar-overlay md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex-1 overflow-y-auto pt-16 md:pt-0">
        {/* Render children directly if passed, else render Outlet (useful for React Router) */}
        {children || <Outlet />}
      </div>
    </div>
  );
};

export default AdminLayout;
