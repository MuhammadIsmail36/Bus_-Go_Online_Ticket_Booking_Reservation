/**
 * Mock Bus Data and Utilities
 * Modern Transit Minimalism Design
 */

export interface Bus {
  id: string;
  name: string;
  type: 'AC' | 'Non-AC' | 'Sleeper';
  seatType: 'Seater' | 'Sleeper';
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  availableSeats: number;
  totalSeats: number;
  bookedSeats: string[];
}

export interface Booking {
  id: string;
  pnr: string;
  from: string;
  to: string;
  date: string;
  busName: string;
  seats: string[];
  totalFare: number;
  status: 'Confirmed' | 'Cancelled';
  passengers: PassengerInfo[];
  createdAt: string;
}

export interface PassengerInfo {
  name: string;
  gender: 'Male' | 'Female' | 'Other';
  age: number;
  seatNumber: string;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

// Mock bus database
const mockBuses: Record<string, Bus[]> = {
  'Karachi-Lahore': [
    {
      id: 'bus-1',
      name: 'Daewoo Express',
      type: 'AC',
      seatType: 'Seater',
      departureTime: '08:00 AM',
      arrivalTime: '06:00 PM',
      duration: '10h 00m',
      price: 2500,
      availableSeats: 15,
      totalSeats: 50,
      bookedSeats: ['A1', 'A2', 'B1', 'C5', 'D3'],
    },
    {
      id: 'bus-2',
      name: 'Hira Travels',
      type: 'AC',
      seatType: 'Sleeper',
      departureTime: '10:00 PM',
      arrivalTime: '08:00 AM',
      duration: '10h 00m',
      price: 3500,
      availableSeats: 20,
      totalSeats: 40,
      bookedSeats: ['A1', 'B2', 'C1'],
    },
    {
      id: 'bus-3',
      name: 'Faisal Movers',
      type: 'Non-AC',
      seatType: 'Seater',
      departureTime: '12:00 PM',
      arrivalTime: '10:00 PM',
      duration: '10h 00m',
      price: 1800,
      availableSeats: 25,
      totalSeats: 50,
      bookedSeats: ['A1', 'A3', 'B1'],
    },
  ],
  'Lahore-Islamabad': [
    {
      id: 'bus-4',
      name: 'City Express',
      type: 'AC',
      seatType: 'Seater',
      departureTime: '06:00 AM',
      arrivalTime: '09:00 AM',
      duration: '3h 00m',
      price: 1500,
      availableSeats: 30,
      totalSeats: 50,
      bookedSeats: ['A1', 'B3'],
    },
    {
      id: 'bus-5',
      name: 'Skyways',
      type: 'AC',
      seatType: 'Sleeper',
      departureTime: '08:00 PM',
      arrivalTime: '11:00 PM',
      duration: '3h 00m',
      price: 2200,
      availableSeats: 18,
      totalSeats: 40,
      bookedSeats: ['A2', 'C1', 'D2'],
    },
  ],
  'Islamabad-Peshawar': [
    {
      id: 'bus-6',
      name: 'Northern Express',
      type: 'AC',
      seatType: 'Seater',
      departureTime: '07:00 AM',
      arrivalTime: '11:00 AM',
      duration: '4h 00m',
      price: 1800,
      availableSeats: 28,
      totalSeats: 50,
      bookedSeats: ['A1', 'B2'],
    },
  ],
  'Delhi-Mumbai': [
    {
      id: 'bus-7',
      name: 'Shatabdi Express',
      type: 'AC',
      seatType: 'Seater',
      departureTime: '06:00 AM',
      arrivalTime: '04:00 PM',
      duration: '10h 00m',
      price: 3500,
      availableSeats: 22,
      totalSeats: 50,
      bookedSeats: ['A1', 'A2', 'B1', 'C3'],
    },
  ],
  'Bangalore-Chennai': [
    {
      id: 'bus-8',
      name: 'South Express',
      type: 'AC',
      seatType: 'Seater',
      departureTime: '10:00 PM',
      arrivalTime: '06:00 AM',
      duration: '8h 00m',
      price: 2800,
      availableSeats: 19,
      totalSeats: 50,
      bookedSeats: ['A1', 'B2', 'C1'],
    },
  ],
};

// Generate seat layout (2 columns on left, 2 on right with aisle)
export const generateSeatLayout = (totalSeats: number) => {
  const seats: string[] = [];
  const rows = Math.ceil(totalSeats / 4);
  const columns = ['A', 'B', 'C', 'D'];

  for (let row = 1; row <= rows; row++) {
    for (let col = 0; col < 4; col++) {
      seats.push(`${columns[col]}${row}`);
    }
  }

  return seats.slice(0, totalSeats);
};

export const getBusesByRoute = (from: string, to: string): Bus[] => {
  const key = `${from}-${to}`;
  return mockBuses[key] || [];
};

export const getBusById = (busId: string): Bus | null => {
  for (const buses of Object.values(mockBuses)) {
    const bus = buses.find((b) => b.id === busId);
    if (bus) return bus;
  }
  return null;
};

export const generatePNR = (): string => {
  return 'PNR' + Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const formatTime = (time: string): string => {
  return time;
};

export const calculateDuration = (departure: string, arrival: string): string => {
  // This is simplified - in real app would calculate actual duration
  return '10h 00m';
};

export const getBookingsFromStorage = (): Booking[] => {
  const stored = localStorage.getItem('bookings');
  return stored ? JSON.parse(stored) : [];
};

export const saveBookingToStorage = (booking: Booking) => {
  const bookings = getBookingsFromStorage();
  bookings.push(booking);
  localStorage.setItem('bookings', JSON.stringify(bookings));
};

export const updateBookingStatus = (pnr: string, status: 'Confirmed' | 'Cancelled') => {
  const bookings = getBookingsFromStorage();
  const booking = bookings.find((b) => b.pnr === pnr);
  if (booking) {
    booking.status = status;
    localStorage.setItem('bookings', JSON.stringify(bookings));
  }
};
