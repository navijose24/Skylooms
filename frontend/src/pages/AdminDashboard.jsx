import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Briefcase, FileText, Package, Database, 
  Wrench, FilePlus, ShoppingCart, Activity, FileCheck, CircleDollarSign,
  Search, Bell, Plus, MoreVertical, Share2, User, MessageSquare, ExternalLink
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';

const SidebarCategory = ({ label }) => (
  <div className="px-6 py-2 mt-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
    {label}
  </div>
);

const MetricCard = ({ title, value, icon: Icon, bgClass, textClass, path }) => (
  <Link to={path || '#'} className={`${bgClass} rounded-xl p-5 shadow-sm text-white relative overflow-hidden flex flex-col justify-between hover:scale-[1.02] transition-transform duration-200 cursor-pointer`}>
    <div className="flex justify-between items-start z-10">
      <div>
        <p className="text-3xl font-bold mb-1">{value}</p>
        <p className="uppercase text-xs font-semibold opacity-90 tracking-wider">{title}</p>
      </div>
      <div className="bg-white/20 p-2 rounded-lg">
        <Icon size={24} className="text-white opacity-90" />
      </div>
    </div>
    {/* Decorative circle */}
    <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-white opacity-10"></div>
  </Link>
);

const AdminDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/admin/dashboard/', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      setData(response.data);
    } catch (err) {
      setError('Failed to fetch dashboard data. Make sure you have admin privileges.');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-900 bg-gray-50 min-h-screen">Loading...</div>;

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" />;
  }

  if (error) return <div className="p-8 text-center text-red-500 bg-gray-50 min-h-screen">{error}</div>;
  if (!data) return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        
        {/* Top Navbar Area inside Dashboard */}
          <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="bg-gray-50 rounded-lg px-3 py-1.5 flex items-center gap-2 border border-gray-100 group focus-within:border-blue-300 transition-all">
                <Search size={14} className="text-gray-400 group-hover:text-blue-400 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search here..." 
                  className="bg-transparent border-none outline-none text-xs w-32 md:w-48 text-gray-700"
                />
              </div>
              
              <div className="flex items-center gap-4 text-gray-400">
                <div className="relative cursor-pointer hover:text-blue-500 transition-colors">
                  <Bell size={18} />
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white"></span>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-50 overflow-hidden border border-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-all overflow-hidden">
                   <img 
                     src={`https://ui-avatars.com/api/?name=${user.username}&background=random`} 
                     alt="Admin" 
                     className="w-full h-full object-cover"
                   />
                </div>
              </div>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <MetricCard 
              title="Total Bookings" 
              value={data.total_bookings} 
              icon={ShoppingCart} 
              bgClass="bg-gradient-to-br from-orange-400 to-orange-500" 
              path="/admin/bookings"
            />
            <MetricCard 
              title="Net Revenue" 
              value={`$${(data.net_revenue || 0).toLocaleString()}`} 
              icon={CircleDollarSign} 
              bgClass="bg-gradient-to-br from-purple-500 to-purple-600" 
              path="/admin"
            />
            <MetricCard 
              title="Available Flights" 
              value={data.total_flights} 
              icon={Package} 
              bgClass="bg-gradient-to-br from-emerald-400 to-emerald-500" 
              path="/admin/flights"
            />
            <MetricCard 
              title="Properties" 
              value={data.total_hotels} 
              icon={Briefcase} 
              bgClass="bg-gradient-to-br from-gray-800 to-gray-900" 
              path="/admin/hotels"
            />
            <MetricCard 
              title="Active Users" 
              value="8" 
              icon={Users} 
              bgClass="bg-gradient-to-br from-cyan-400 to-cyan-500" 
              path="/admin/users"
            />
          </div>

          {/* Business Overview */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-sm font-bold text-gray-800 mb-6 flex items-center gap-2">
              Business Overview <span className="text-blue-500 font-normal text-xs">live data</span>
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <div 
                  className="bg-emerald-400 text-white px-4 py-2 rounded-l-md flex justify-between items-center text-sm font-semibold transition-all duration-1000"
                  style={{ width: `${Math.min(100, Math.max(20, ((data.net_revenue || 0) / Math.max(data.gross_revenue || 1, 1)) * 100))}%` }}
                >
                  <span className="hidden md:inline truncate pr-2">NET REVENUE (CONFIRMED)</span>
                  <span>${(data.net_revenue || 0).toLocaleString()}</span>
                </div>
                <div className="bg-gray-100 text-gray-500 px-4 py-2 rounded-r-md flex-1 text-sm flex justify-between">
                  <span className="hidden md:inline">FINAL TOTAL (GROSS)</span>
                  <span className="font-semibold">${(data.gross_revenue || 0).toLocaleString()}</span>
                </div>
              </div>
              
              <div className="flex items-center">
                <div 
                  className="bg-red-400 text-white px-4 py-2 rounded-l-md flex justify-between items-center text-sm font-semibold transition-all duration-1000"
                  style={{ width: `${Math.min(100, Math.max(20, ((data.total_refunds || 0) / Math.max(data.gross_revenue || 1, 1)) * 100))}%` }}
                >
                  <span className="hidden md:inline truncate pr-2">CANCELLED REFUNDS</span>
                  <span>${(data.total_refunds || 0).toLocaleString()}</span>
                </div>
                <div className="bg-gray-100 text-gray-500 px-4 py-2 rounded-r-md flex-1 text-sm flex justify-between">
                  <span className="hidden md:inline">REALIZED EARNINGS</span>
                  <span className="font-semibold">${(data.net_revenue || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Transactions Layout - Full Width Since Messages is Removed */}
          <div className="mb-8">
            
            {/* Column 1: Recent Transactions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <h2 className="text-sm font-bold text-gray-800">Recent Transactions</h2>
                  <div className="w-6 h-6 rounded-full border border-gray-300 flex justify-center items-center text-gray-500 text-xs font-bold">{data.recent_bookings.length}</div>
                </div>
                <Link to="/admin/bookings" className="text-xs text-blue-500 hover:underline flex items-center gap-1 font-semibold">
                  View All <ExternalLink size={12} />
                </Link>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-gray-400 border-b border-gray-100">
                    <tr>
                      <th className="text-left font-medium pb-4 pl-2">Name / Ref</th>
                      <th className="text-left font-medium pb-4">Status</th>
                      <th className="text-right font-medium pb-4 pr-2">Total Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.recent_bookings.map((booking, idx) => (
                      <tr 
                        key={idx} 
                        onClick={() => navigate('/admin/bookings')}
                        className="hover:bg-blue-50/50 hover:shadow-sm transition-all duration-200 cursor-pointer group border-b border-transparent hover:border-blue-100"
                      >
                        <td className="py-4 pl-2 rounded-l-lg">
                          <div className="flex items-start flex-col">
                            <span className="text-blue-500 font-medium">{booking.user_email}</span>
                            <span className="text-gray-400 text-xs mt-0.5">Ref: {booking.reference_number}</span>
                          </div>
                        </td>
                        <td className={`py-4 text-sm font-medium capitalize ${booking.status.toLowerCase() === 'confirmed' ? 'text-emerald-500' : booking.status.toLowerCase() === 'cancelled' ? 'text-red-500' : 'text-gray-500'}`}>
                          {booking.status}
                        </td>
                        <td className="py-4 text-right font-semibold text-gray-700 rounded-r-lg pr-2">${booking.total_price}</td>
                      </tr>
                    ))}
                    {data.recent_bookings.length === 0 && (
                      <tr><td colSpan="3" className="text-center py-8 text-gray-400">No recent transactions.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
