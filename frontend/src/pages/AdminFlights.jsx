import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Package, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const AdminFlights = () => {
  // Mocked detailed flight data as requested
  const [flights, setFlights] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8000/api/admin/flights/', {
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
    })
    .then(res => setFlights(res.data.flights || []))
    .catch(err => console.error('Error fetching admin flights:', err));
  }, []);

  return (
    <AdminLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
             <div className="bg-blue-100 p-2 rounded-lg text-blue-500"><Package size={24} /></div>
             <h1 className="text-xl font-bold text-gray-800">Flight management</h1>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-sm font-bold text-gray-800 mb-6">Flights Overview & Seating</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-gray-400 border-b border-gray-100">
                <tr>
                  <th className="text-left font-medium pb-4">Flight Name & Time</th>
                  <th className="text-center font-medium pb-4">Bookings</th>
                  <th className="text-center font-medium pb-4">Remaining</th>
                  <th className="text-left font-medium pb-4">Passengers (Links)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {flights.map((flight, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="py-4">
                      <div className="font-medium text-gray-800">{flight.name}</div>
                      <div className="text-xs text-gray-400">{flight.time}</div>
                    </td>
                    <td className="py-4 text-center font-semibold text-gray-700">{flight.bookedSeats} / {flight.totalSeats}</td>
                    <td className="py-4 text-center font-semibold">
                      <span className={flight.remainingSeats === 0 ? "text-red-500 bg-red-50 px-2 py-1 rounded" : "text-emerald-500"}>
                        {flight.remainingSeats}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex flex-wrap gap-2">
                        {flight.passengers.map((p, i) => (
                           <Link to={`/admin/users`} key={i} className="flex items-center gap-1 text-xs bg-blue-50 text-blue-500 px-2 py-1 rounded hover:bg-blue-100 transition-colors">
                             <User size={12} /> {p.name}
                           </Link>
                        ))}
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

export default AdminFlights;
