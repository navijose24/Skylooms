import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Briefcase, Package, 
  Wrench, ShoppingCart, LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SidebarItem = ({ icon: Icon, label, path, onClick }) => {
  const location = useLocation();
  const active = location.pathname === path || (path !== '/admin' && location.pathname.startsWith(path));

  return (
    <Link 
      to={path} 
      onClick={onClick}
      className={`flex items-center gap-3 py-3 transition-all ${active ? 'sidebar-active-container sidebar-item-active' : 'px-6 mx-3 text-gray-200 hover:text-white hover:bg-blue-700 rounded-lg cursor-pointer'}`}
    >
      <Icon size={20} />
      <span className="font-semibold text-sm">{label}</span>
    </Link>
  );
};

const AdminSidebar = ({ onClose }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="w-64 sidebar-blue text-white flex-shrink-0 min-h-screen flex flex-col rounded-tr-[3rem]">
      <div className="p-10 flex flex-col items-center relative">
        <span className="font-bold text-2xl tracking-wide">Skylooms</span>
      </div>
      
      <div className="flex-1 py-4 space-y-2">
        <SidebarItem icon={LayoutDashboard} label="Dashboard" path="/admin" onClick={onClose} />
        <SidebarItem icon={ShoppingCart} label="Bookings" path="/admin/bookings" onClick={onClose} />
        <SidebarItem icon={Package} label="Flights" path="/admin/flights" onClick={onClose} />
        <SidebarItem icon={Briefcase} label="Hotels" path="/admin/hotels" onClick={onClose} />
        <SidebarItem icon={Wrench} label="Transport" path="/admin/transport" onClick={onClose} />
        <SidebarItem icon={Users} label="Users" path="/admin/users" onClick={onClose} />
      </div>

      <div className="px-6 mb-8 mt-auto">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 py-3 px-6 text-red-400 hover:text-white hover:bg-red-500/10 rounded-lg transition-all border border-red-500/20 backdrop-blur-sm"
        >
          <LogOut size={20} />
          <span className="font-semibold text-sm">Logout</span>
        </button>
      </div>

      <div className="p-8 flex justify-center gap-4 text-[10px] text-blue-200 opacity-60">
        <span>Facebook</span>
        <span>Twitter</span>
        <span>Google</span>
      </div>
    </div>
  );
};

export default AdminSidebar;
