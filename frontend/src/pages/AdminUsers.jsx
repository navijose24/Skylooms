import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Users, FileText, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';

const AdminUsers = () => {
  const [usersList, setUsersList] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8000/api/admin/users/', {
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
    })
    .then(res => setUsersList(res.data.usersList || []))
    .catch(err => console.error('Error fetching admin users:', err));
  }, []);

  return (
    <AdminLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
             <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600"><Users size={24} /></div>
             <h1 className="text-xl font-bold text-gray-800">User accounts & histories</h1>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-sm font-bold text-gray-800 mb-6">User Database</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-gray-400 border-b border-gray-100">
                <tr>
                  <th className="text-left font-medium pb-4">Email Address</th>
                  <th className="text-left font-medium pb-4">Role</th>
                  <th className="text-left font-medium pb-4">Bookings (Flight/Cab/Hotel)</th>
                  <th className="text-left font-medium pb-4">Transactions & Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {usersList.map((usr, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="py-4 font-medium text-blue-500 hover:underline cursor-pointer">{usr.email}</td>
                    <td className="py-4 text-xs font-semibold uppercase text-gray-500">{usr.role}</td>
                    <td className="py-4">
                      <div className="flex flex-col gap-1 text-xs text-gray-600">
                        <span>Flight: <b>{usr.flightId || 'None'}</b></span>
                        <span>Hotel: <b>{usr.hotel || 'None'}</b></span>
                        <span>Transport: <b>{usr.cabId || 'None'}</b></span>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-gray-500 font-semibold">{usr.paidTransactions} payments ({usr.totalSpent})</span>
                        <div className="flex items-center gap-1 mt-1 text-xs font-bold text-emerald-500">
                          <CheckCircle size={12} /> {usr.status}
                        </div>
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

export default AdminUsers;
