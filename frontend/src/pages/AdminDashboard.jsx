import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { user, loading } = useAuth();
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

  if (loading) return <div className="p-8 text-center text-white">Loading...</div>;

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" />;
  }

  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!data) return <div className="p-8 text-center text-white flex justify-center items-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>;

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white p-8 pt-24">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/50 shadow-[0_0_15px_rgba(59,130,246,0.1)] hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all">
            <h3 className="text-gray-400 text-sm font-medium mb-2">Total Bookings</h3>
            <p className="text-4xl font-bold text-white">{data.total_bookings}</p>
          </div>
          <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/50 shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all">
            <h3 className="text-gray-400 text-sm font-medium mb-2">Total Revenue</h3>
            <p className="text-4xl font-bold text-emerald-400">${data.total_revenue}</p>
          </div>
          <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/50 shadow-[0_0_15px_rgba(96,165,250,0.1)] hover:shadow-[0_0_20px_rgba(96,165,250,0.3)] transition-all">
            <h3 className="text-gray-400 text-sm font-medium mb-2">Total Flights</h3>
            <p className="text-4xl font-bold text-blue-400">{data.total_flights}</p>
          </div>
          <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/50 shadow-[0_0_15px_rgba(167,139,250,0.1)] hover:shadow-[0_0_20px_rgba(167,139,250,0.3)] transition-all">
            <h3 className="text-gray-400 text-sm font-medium mb-2">Total Properties</h3>
            <p className="text-4xl font-bold text-purple-400">{data.total_hotels}</p>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-2xl border border-gray-700/50 overflow-hidden shadow-lg">
          <div className="p-6 border-b border-gray-700/50 flex justify-between items-center">
            <h2 className="text-xl font-bold">Recent Transactions</h2>
            <div className="text-sm text-gray-400">Live Data</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50 text-gray-400 text-left">
                <tr>
                  <th className="p-4 font-medium tracking-wider text-xs uppercase">Reference</th>
                  <th className="p-4 font-medium tracking-wider text-xs uppercase">Customer</th>
                  <th className="p-4 font-medium tracking-wider text-xs uppercase">Date</th>
                  <th className="p-4 font-medium tracking-wider text-xs uppercase">Amount</th>
                  <th className="p-4 font-medium tracking-wider text-xs uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {data.recent_bookings.map((booking, idx) => (
                  <tr key={idx} className="hover:bg-gray-700/30 transition-colors">
                    <td className="p-4 font-mono text-blue-400 font-medium">{booking.reference_number}</td>
                    <td className="p-4">{booking.user_email}</td>
                    <td className="p-4 text-gray-400">{new Date(booking.created_at).toLocaleDateString()}</td>
                    <td className="p-4 font-medium">${booking.total_price}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-400' :
                        booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.recent_bookings.length === 0 && (
              <div className="p-8 text-center text-gray-500">No recent transactions found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
