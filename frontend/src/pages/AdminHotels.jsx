import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Briefcase, MapPin } from 'lucide-react';
import axios from 'axios';

const AdminHotels = () => {
  const [hotels, setHotels] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8000/api/admin/hotels/', {
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
    })
    .then(res => setHotels(res.data.hotels || []))
    .catch(err => console.error('Error fetching admin hotels:', err));
  }, []);

  return (
    <AdminLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
             <div className="bg-orange-100 p-2 rounded-lg text-orange-500"><Briefcase size={24} /></div>
             <h1 className="text-xl font-bold text-gray-800">Hotel management</h1>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-sm font-bold text-gray-800 mb-6">Booked Hotels Overview</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-gray-400 border-b border-gray-100">
                <tr>
                  <th className="text-left font-medium pb-4">Hotel Name</th>
                  <th className="text-center font-medium pb-4">Reservations</th>
                  <th className="text-left font-medium pb-4">Check-in / Check-out</th>
                  <th className="text-left font-medium pb-4">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {hotels.map((hotel, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="py-4 font-medium text-gray-800">{hotel.name}</td>
                    <td className="py-4 text-center font-semibold text-gray-700">{hotel.reservations}</td>
                    <td className="py-4 text-gray-500 text-xs">In: {hotel.checkinTime} | Out: {hotel.checkoutTime}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-1 text-gray-500 text-xs">
                        <MapPin size={12} className="text-orange-400"/> {hotel.location}
                      </div>
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

export default AdminHotels;
