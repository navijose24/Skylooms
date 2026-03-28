import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Wrench, Clock, User } from 'lucide-react';
import axios from 'axios';

const AdminTransport = () => {
  const [transports, setTransports] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8000/api/admin/transport/', {
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
    })
    .then(res => setTransports(res.data.transports || []))
    .catch(err => console.error('Error fetching admin transport:', err));
  }, []);

  return (
    <AdminLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
             <div className="bg-purple-100 p-2 rounded-lg text-purple-600"><Wrench size={24} /></div>
             <h1 className="text-xl font-bold text-gray-800">Transport & Cabs</h1>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-sm font-bold text-gray-800 mb-6">Transport Booking Schedule</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-gray-400 border-b border-gray-100">
                <tr>
                  <th className="text-left font-medium pb-4">Ref ID</th>
                  <th className="text-left font-medium pb-4">Cab Details</th>
                  <th className="text-left font-medium pb-4">Pickup Time</th>
                  <th className="text-left font-medium pb-4">User Details</th>
                  <th className="text-left font-medium pb-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {transports.map((transport, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="py-4 text-xs font-semibold text-gray-500">{transport.id}</td>
                    <td className="py-4 font-medium text-gray-800">{transport.cabDetails}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Clock size={12} className="text-purple-400" /> {transport.pickupTime}
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-1 text-blue-500 text-xs font-medium cursor-pointer hover:underline">
                        <User size={12} /> {transport.user}
                      </div>
                    </td>
                    <td className="py-4 font-semibold text-xs capitalize">
                      <span className={transport.status === 'Completed' ? 'text-emerald-500' : transport.status === 'Assigned' ? 'text-blue-500' : 'text-orange-500'}>
                        {transport.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminTransport;
