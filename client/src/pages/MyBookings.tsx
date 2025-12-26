import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import Layout from '@/components/Layout';
import { Booking, getBookingsFromStorage, updateBookingStatus } from '@/lib/busData';

/**
 * My Bookings Page - Modern Transit Minimalism Design
 * Display user's bookings with options to view and cancel
 */

export default function MyBookings() {
  const [, navigate] = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
    }
  }, [navigate]);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const storedBookings = getBookingsFromStorage();
    setBookings(storedBookings as Booking[]);
  }, []);

  const handleViewTicket = (booking: Booking) => {
    setSelectedBooking(booking as Booking);
    setShowModal(true);
  };

  const handleCancelBooking = (pnr: string) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      updateBookingStatus(pnr, 'Cancelled');
      const updated = bookings.map((b) =>
        b.pnr === pnr ? { ...b, status: 'Cancelled' as const } : b
      );
      setBookings(updated);
      setShowModal(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBooking(null);
  };

  return (
    <Layout>
      {/* Header */}
      <section className="bg-primary text-primary-foreground py-6 border-b border-border">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <i className="fas fa-ticket-alt"></i>
            My Bookings
          </h1>
          <p className="opacity-90 mt-2">View and manage your bus bookings</p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          {bookings.length > 0 ? (
            <div className="space-y-6">
              {bookings.map((booking) => (
                <div key={booking.id} className="bus-card">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                    {/* Booking ID */}
                    <div>
                      <p className="text-xs text-muted-foreground">Booking ID</p>
                      <p className="font-bold text-primary font-mono">{booking.pnr}</p>
                    </div>

                    {/* Route */}
                    <div>
                      <p className="text-xs text-muted-foreground">Route</p>
                      <p className="font-semibold text-foreground">
                        {booking.from} → {booking.to}
                      </p>
                    </div>

                    {/* Date & Time */}
                    <div>
                      <p className="text-xs text-muted-foreground">Date</p>
                      <p className="font-semibold text-foreground">
                        {new Date(booking.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>

                    {/* Seats */}
                    <div>
                      <p className="text-xs text-muted-foreground">Seats</p>
                      <p className="font-semibold text-foreground">{booking.seats.join(', ')}</p>
                    </div>

                    {/* Status */}
                    <div className="flex items-end justify-between md:flex-col">
                      <div>
                        <p className="text-xs text-muted-foreground">Status</p>
                        <p
                          className={`font-bold ${
                            booking.status === 'Confirmed'
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {booking.status}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-border pt-4 mt-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">
                          <i className="fas fa-bus mr-2"></i>
                          {booking.busName}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewTicket(booking)}
                          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:shadow-lg transition-all"
                        >
                          <i className="fas fa-eye mr-2"></i>
                          View Ticket
                        </button>
                        {booking.status === 'Confirmed' && (
                          <button
                            onClick={() => handleCancelBooking(booking.pnr)}
                            className="px-4 py-2 border border-red-500 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 transition-all"
                          >
                            <i className="fas fa-times mr-2"></i>
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <i className="fas fa-inbox text-5xl text-muted-foreground mb-4"></i>
              <h2 className="text-2xl font-bold text-foreground mb-2">No Bookings Yet</h2>
              <p className="text-muted-foreground mb-6">You haven't made any bus bookings yet.</p>
              <a href="/" className="btn-accent">
                <i className="fas fa-search mr-2"></i>
                Search Buses
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Modal */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-primary text-primary-foreground p-6 flex items-center justify-between border-b border-border">
              <h2 className="text-2xl font-bold">Ticket Details</h2>
              <button
                onClick={closeModal}
                className="text-xl hover:opacity-75 transition-opacity"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* PNR */}
              <div className="text-center pb-6 border-b border-border">
                <p className="text-muted-foreground mb-2">Booking Reference</p>
                <p className="text-3xl font-bold text-primary font-mono">{selectedBooking.pnr}</p>
              </div>

              {/* Journey Details */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Route</p>
                  <p className="font-bold text-foreground">
                    {selectedBooking.from} → {selectedBooking.to}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-bold text-foreground">
                    {new Date(selectedBooking.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bus</p>
                  <p className="font-bold text-foreground">{selectedBooking.busName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p
                    className={`font-bold ${
                      selectedBooking.status === 'Confirmed'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {selectedBooking.status}
                  </p>
                </div>
              </div>

              {/* Seats */}
              <div className="pb-6 border-b border-border">
                <p className="text-sm text-muted-foreground mb-3">Seats</p>
                <div className="flex flex-wrap gap-2">
                  {selectedBooking.seats.map((seat) => (
                    <span
                      key={seat}
                      className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-bold"
                    >
                      {seat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Passengers */}
              <div className="pb-6 border-b border-border">
                <p className="text-sm text-muted-foreground mb-3">Passengers</p>
                <div className="space-y-2">
                  {selectedBooking.passengers.map((passenger, idx) => (
                    <div key={idx} className="flex justify-between p-3 bg-background rounded-lg">
                      <div>
                        <p className="font-semibold text-foreground">{passenger.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {passenger.gender} • Age {passenger.age}
                        </p>
                      </div>
                      <p className="font-semibold text-primary">Seat {passenger.seatNumber}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fare */}
              <div className="pb-6 border-b border-border">
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Fare per seat</span>
                  <span className="font-semibold">
                    PKR {Math.round(selectedBooking.totalFare / selectedBooking.seats.length)}
                  </span>
                </div>
                <div className="flex justify-between mb-3">
                  <span className="text-muted-foreground">Seats</span>
                  <span className="font-semibold">{selectedBooking.seats.length}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-border">
                  <span className="font-bold">Total Fare</span>
                  <span className="text-2xl font-bold text-accent">PKR {selectedBooking.totalFare}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={() => window.print()}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  <i className="fas fa-print"></i>
                  Print
                </button>
                {selectedBooking.status === 'Confirmed' && (
                  <button
                    onClick={() => handleCancelBooking(selectedBooking.pnr)}
                    className="flex-1 px-4 py-3 border border-red-500 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-all"
                  >
                    <i className="fas fa-times mr-2"></i>
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
