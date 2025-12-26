import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import Layout from '@/components/Layout';
import { Bus, generateSeatLayout } from '@/lib/busData';

/**
 * Bus Details & Seat Selection Page - Modern Transit Minimalism Design
 * Visual seat layout with selection and booking summary
 */

export default function BusDetails() {
  const [, navigate] = useLocation();
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
    }
  }, [navigate]);

  const [bus, setBus] = useState<Bus | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [seatLayout, setSeatLayout] = useState<string[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const stored = sessionStorage.getItem('selectedBus');
    if (stored) {
      const busData = JSON.parse(stored);
      setBus(busData);
      setSeatLayout(generateSeatLayout(busData.totalSeats));
    }
  }, []);

  useEffect(() => {
    if (bus) {
      setTotalPrice(selectedSeats.length * bus.price);
    }
  }, [selectedSeats, bus]);

  if (!bus) {
    return (
      <Layout>
        <section className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-background">
          <div className="text-center">
            <i className="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i>
            <p className="text-muted-foreground">Loading bus details...</p>
          </div>
        </section>
      </Layout>
    );
  }

  const toggleSeat = (seat: string) => {
    if (bus.bookedSeats.includes(seat)) {
      // Seat is already booked
      return;
    }

    if (selectedSeats.includes(seat)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seat));
    } else {
      if (selectedSeats.length < 6) {
        setSelectedSeats([...selectedSeats, seat]);
      }
    }
  };

  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      alert('Please select at least one seat');
      return;
    }
    sessionStorage.setItem('selectedSeats', JSON.stringify(selectedSeats));
    navigate('/passenger-details');
  };

  const getSeatStatus = (seat: string) => {
    if (bus.bookedSeats.includes(seat)) return 'booked';
    if (selectedSeats.includes(seat)) return 'selected';
    return 'available';
  };

  return (
    <Layout>
      {/* Route Summary */}
      <section className="bg-primary text-primary-foreground py-6 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm opacity-75">Route</p>
              <p className="font-bold text-lg">From → To</p>
            </div>
            <div>
              <p className="text-sm opacity-75">Date</p>
              <p className="font-bold">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            </div>
            <div>
              <p className="text-sm opacity-75">Bus</p>
              <p className="font-bold">{bus.name}</p>
            </div>
            <div>
              <p className="text-sm opacity-75">Type</p>
              <p className="font-bold">{bus.type}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Seat Layout */}
            <div className="lg:col-span-2">
              <div className="bg-card rounded-lg p-8 border border-border">
                <h2 className="text-2xl font-bold text-primary mb-8">Select Your Seats</h2>

                {/* Seat Legend */}
                <div className="flex flex-wrap gap-6 mb-8 pb-8 border-b border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 border border-green-300 rounded"></div>
                    <span className="text-sm text-muted-foreground">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-red-100 border border-red-300 rounded"></div>
                    <span className="text-sm text-muted-foreground">Booked</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-500 border border-blue-600 rounded"></div>
                    <span className="text-sm text-muted-foreground">Selected</span>
                  </div>
                </div>

                {/* Seat Grid */}
                <div className="flex justify-center mb-8">
                  <div className="inline-block">
                    {/* Seat Layout - 2 columns left, 2 columns right */}
                    <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
                      {seatLayout.map((seat, idx) => {
                        const status = getSeatStatus(seat);
                        const isBooked = status === 'booked';
                        const isSelected = status === 'selected';

                        // Add aisle gap
                        const colIndex = idx % 4;
                        const gapClass = colIndex === 1 ? 'mr-4' : '';

                        return (
                          <div key={seat} className={gapClass}>
                            <button
                              onClick={() => toggleSeat(seat)}
                              disabled={isBooked}
                              title={
                                isBooked
                                  ? 'This seat is already booked.'
                                  : `${seat} - Click to select`
                              }
                              className={`w-10 h-10 rounded font-semibold text-sm transition-all duration-200 ${
                                isBooked
                                  ? 'seat-booked opacity-50 cursor-not-allowed'
                                  : isSelected
                                    ? 'seat-selected hover:scale-110'
                                    : 'seat-available hover:scale-110 cursor-pointer'
                              }`}
                            >
                              {seat}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <p className="text-center text-sm text-muted-foreground">
                  Maximum 6 seats per booking
                </p>
              </div>
            </div>

            {/* Booking Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-lg p-6 border border-border sticky top-4">
                <h3 className="text-xl font-bold text-primary mb-6">Booking Summary</h3>

                <div className="space-y-4 mb-6 pb-6 border-b border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">Route</p>
                    <p className="font-semibold text-foreground">From → To</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Date</p>
                    <p className="font-semibold text-foreground">
                      {new Date().toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Bus</p>
                    <p className="font-semibold text-foreground">{bus.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Time</p>
                    <p className="font-semibold text-foreground">
                      {bus.departureTime} - {bus.arrivalTime}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 mb-6 pb-6 border-b border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">Selected Seats</p>
                    {selectedSeats.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedSeats.map((seat) => (
                          <span
                            key={seat}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold"
                          >
                            {seat}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground mt-2">No seats selected</p>
                    )}
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fare per seat</span>
                    <span className="font-semibold">PKR {bus.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Number of seats</span>
                    <span className="font-semibold">{selectedSeats.length}</span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between">
                    <span className="font-bold">Total Fare</span>
                    <span className="text-2xl font-bold text-accent">PKR {totalPrice}</span>
                  </div>
                </div>

                <button
                  onClick={handleContinue}
                  disabled={selectedSeats.length === 0}
                  className="w-full btn-accent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to Passenger Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
