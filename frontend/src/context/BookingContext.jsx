import { createContext, useState, useContext } from 'react';

const BookingContext = createContext();

export const useBooking = () => useContext(BookingContext);

export const BookingProvider = ({ children }) => {
    // Search Criteria
    const [searchParams, setSearchParams] = useState({
        journeyType: 'round_trip',
        source: '',
        destination: '',
        departureDate: new Date().toISOString().split('T')[0],
        returnDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        cabinClass: 'economy',
        passengers: 1
    });

    const [durationDays, setDurationDays] = useState(0);

    // Selected Items
    const [selectedFlights, setSelectedFlights] = useState([]); // Can be 1 (one_way), 2 (round_trip) or more
    const [selectedHotel, setSelectedHotel] = useState(null);
    const [selectedCab, setSelectedCab] = useState(null);

    return (
        <BookingContext.Provider value={{
            searchParams, setSearchParams,
            durationDays, setDurationDays,
            selectedFlights, setSelectedFlights,
            selectedHotel, setSelectedHotel,
            selectedCab, setSelectedCab
        }}>
            {children}
        </BookingContext.Provider>
    );
};
