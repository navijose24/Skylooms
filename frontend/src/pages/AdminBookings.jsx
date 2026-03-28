import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { ShoppingCart, Check, X, Info } from 'lucide-react';
import axios from 'axios';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8000/api/admin/bookings/', {
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
    })
    .then(res => setBookings(res.data.bookings || []))
    .catch(err => console.error('Error fetching admin bookings:', err));
  }, []);

  return (
    <AdminLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
             <div className="bg-orange-100 p-2 rounded-lg text-orange-600"><ShoppingCart size={24} /></div>
             <h1 className="text-xl font-bold text-gray-800">Global Bookings</h1>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-sm font-bold text-gray-800 mb-6">Booking Records (Tickets, Hotels, Cabs)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-gray-400 border-b border-gray-100">
                <tr>
                  <th className="text-left font-medium pb-4">Booking Ref</th>
                  <th className="text-left font-medium pb-4">Package Type</th>
                  <th className="text-left font-medium pb-4">Details</th>
                  <th className="text-left font-medium pb-4">Status & Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bookings.map((bkg, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="py-4">
                      <div className="font-semibold text-gray-700">{bkg.ref}</div>
                      <div className="text-xs text-blue-500 hover:underline cursor-pointer mt-1">{bkg.user}</div>
                    </td>
                    <td className="py-4 font-medium text-gray-600">
                      <span className="bg-gray-100 px-2 py-1 rounded text-xs">{bkg.type}</span>
                    </td>
                    <td className="py-4">
                      <ul className="text-xs text-gray-500 space-y-1 list-disc list-inside">
                        {bkg.items.map((item, i) => <li key={i}>{item}</li>)}
                      </ul>
                    </td>
                    <td className="py-4 font-semibold">
                       <div className="flex flex-col gap-1">
                          <span className={bkg.status === 'Confirmed' ? 'text-emerald-500 flex items-center gap-1 text-xs uppercase' : 'text-red-500 flex items-center gap-1 text-xs uppercase'}>
                            {bkg.status === 'Confirmed' ? <Check size={12}/> : <X size={12}/>} {bkg.status}
                          </span>
                          <span className="text-gray-800 text-sm mt-1">{bkg.amount}</span>
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

export default AdminBookings;
