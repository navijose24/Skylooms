import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Recommendations from './pages/Recommendations';
import Checkout from './pages/Checkout';
import Success from './pages/Success';
import Manage from './pages/Manage';
import Status from './pages/Status';
import Explore from './pages/Explore';
import { BookingProvider } from './context/BookingContext';
import './index.css';

function App() {
  return (
    <BookingProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/success/:id" element={<Success />} />
          <Route path="/manage" element={<Manage />} />
          <Route path="/status" element={<Status />} />
          <Route path="/explore" element={<Explore />} />
        </Routes>
      </Router>
    </BookingProvider>
  )
}

export default App
