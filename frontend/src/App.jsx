import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Recommendations from './pages/Recommendations';
import Checkout from './pages/Checkout';
import Success from './pages/Success';
import Manage from './pages/Manage';
import Status from './pages/Status';
import Explore from './pages/Explore';
import Login from './pages/Login';
import Register from './pages/Register';
import SeatSelection from './pages/SeatSelection';
import CancelBooking from './pages/CancelBooking';
import AdminDashboard from './pages/AdminDashboard';
import AdminFlights from './pages/AdminFlights';
import AdminHotels from './pages/AdminHotels';
import AdminTransport from './pages/AdminTransport';
import AdminBookings from './pages/AdminBookings';
import AdminUsers from './pages/AdminUsers';
import Profile from './pages/Profile';
import { BookingProvider } from './context/BookingContext';
import { AuthProvider } from './context/AuthContext';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/seats" element={<SeatSelection />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/success/:id" element={<Success />} />
            <Route path="/cancel/:id" element={<CancelBooking />} />
            <Route path="/manage" element={<Manage />} />
            <Route path="/status" element={<Status />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/flights" element={<AdminFlights />} />
            <Route path="/admin/hotels" element={<AdminHotels />} />
            <Route path="/admin/transport" element={<AdminTransport />} />
            <Route path="/admin/bookings" element={<AdminBookings />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </Router>
      </BookingProvider>
    </AuthProvider>
  )
}

export default App
