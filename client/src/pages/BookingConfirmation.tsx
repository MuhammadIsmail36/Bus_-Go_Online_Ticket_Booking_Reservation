import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import Layout from '@/components/Layout';
import { Booking, generatePNR, saveBookingToStorage } from '@/lib/busData';

/**
 * Booking Confirmation Page - Modern Transit Minimalism Design
 * Display confirmation details and provide download/print options
 */

export default function BookingConfirmation() {
  const [, navigate] = useLocation();
  const [booking, setBooking] = useState<Booking | null>(null);

  useEffect(() => {
    const bookingData = sessionStorage.getItem('bookingData');
    if (bookingData) {
      const data = JSON.parse(bookingData);
      const pnr = generatePNR();

      const newBooking: Booking = {
        id: Math.random().toString(36).substring(7),
        pnr,
        from: 'Karachi',
        to: 'Lahore',
        date: new Date().toISOString().split('T')[0],
        busName: data.bus.name,
        seats: data.selectedSeats,
        totalFare: data.selectedSeats.length * data.bus.price,
        status: 'Confirmed',
        passengers: data.passengers,
        createdAt: new Date().toISOString(),
      };

      setBooking(newBooking);
      saveBookingToStorage(newBooking);

      // Clear session storage
      sessionStorage.removeItem('bookingData');
      sessionStorage.removeItem('selectedBus');
      sessionStorage.removeItem('selectedSeats');
      sessionStorage.removeItem('searchData');
    }
  }, []);

  if (!booking) {
    return (
      <Layout>
        <section className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-background">
          <div className="text-center">
            <i className="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i>
            <p className="text-muted-foreground">Generating your booking...</p>
          </div>
        </section>
      </Layout>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // Simple implementation - in real app would use a PDF library
    const content = `
BOOKING CONFIRMATION
PNR: ${booking.pnr}
Date: ${new Date().toLocaleDateString()}

PASSENGER DETAILS
${booking.passengers.map((p) => `${p.name} (${p.gender}, Age: ${p.age}) - Seat: ${p.seatNumber}`).join('\n')}

JOURNEY DETAILS
Bus: ${booking.busName}
From: ${booking.from}
To: ${booking.to}
Date: ${new Date(booking.date).toLocaleDateString()}

FARE DETAILS
Total Fare: PKR ${booking.totalFare}
Status: ${booking.status}
    `;
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', `booking-${booking.pnr}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <Layout>
      {/* Success Message */}
      <section className="bg-gradient-to-r from-green-500 to-green-600 text-white py-12 border-b border-border">
        <div className="container mx-auto px-4 text-center">
          <i className="fas fa-check-circle text-5xl mb-4"></i>
          <h1 className="text-4xl font-bold mb-2">Booking Confirmed!</h1>
          <p className="text-lg opacity-90">Your ticket has been successfully booked</p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* PNR Card */}
            <div className="bg-card rounded-lg p-8 border border-border mb-8">
              <div className="text-center mb-8 pb-8 border-b border-border">
                <p className="text-muted-foreground mb-2">Your Booking Reference</p>
                <p className="text-4xl font-bold text-primary font-mono">{booking.pnr}</p>
                <p className="text-sm text-muted-foreground mt-2">Save this for your records</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-border">
                {/* Journey Details */}
                <div>
                  <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
                    <i className="fas fa-bus"></i>
                    Journey Details
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Bus</p>
                      <p className="font-semibold text-foreground">{booking.busName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Route</p>
                      <p className="font-semibold text-foreground">
                        {booking.from} → {booking.to}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Date</p>
                      <p className="font-semibold text-foreground">
                        {new Date(booking.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Seat Details */}
                <div>
                  <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
                    <i className="fas fa-chair"></i>
                    Seat Details
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Seats Booked</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {booking.seats.map((seat) => (
                          <span
                            key={seat}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-semibold"
                          >
                            {seat}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Passengers</p>
                      <p className="font-semibold text-foreground">{booking.passengers.length}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Passenger List */}
              <div className="mb-8 pb-8 border-b border-border">
                <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
                  <i className="fas fa-users"></i>
                  Passenger Details
                </h3>
                <div className="space-y-3">
                  {booking.passengers.map((passenger, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-background rounded-lg">
                      <div>
                        <p className="font-semibold text-foreground">{passenger.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {passenger.gender} • Age {passenger.age}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary">Seat {passenger.seatNumber}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fare Summary */}
              <div className="space-y-3 mb-8">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fare per seat</span>
                  <span className="font-semibold">PKR {Math.round(booking.totalFare / booking.seats.length)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Number of seats</span>
                  <span className="font-semibold">{booking.seats.length}</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between">
                  <span className="font-bold text-lg">Total Amount</span>
                  <span className="text-2xl font-bold text-accent">PKR {booking.totalFare}</span>
                </div>
              </div>

              {/* Status */}
              <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-muted-foreground">Booking Status</p>
                <p className="text-lg font-bold text-green-600">{booking.status}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={handleDownloadPDF}
                className="btn-primary flex items-center justify-center gap-2"
              >
                <i className="fas fa-download"></i>
                Download Ticket
              </button>
              <button
                onClick={handlePrint}
                className="btn-primary flex items-center justify-center gap-2"
              >
                <i className="fas fa-print"></i>
                Print Ticket
              </button>
              <button
                onClick={() => navigate('/my-bookings')}
                className="btn-accent flex items-center justify-center gap-2"
              >
                <i className="fas fa-list"></i>
                View My Bookings
              </button>
            </div>

            {/* Additional Info */}
            <div className="mt-8 p-6 bg-card rounded-lg border border-border">
              <h3 className="font-bold text-primary mb-3">Important Information</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <i className="fas fa-check text-green-500 mt-1"></i>
                  <span>Please arrive at the bus terminal 30 minutes before departure</span>
                </li>
                <li className="flex items-start gap-2">
                  <i className="fas fa-check text-green-500 mt-1"></i>
                  <span>Carry your booking confirmation and valid ID</span>
                </li>
                <li className="flex items-start gap-2">
                  <i className="fas fa-check text-green-500 mt-1"></i>
                  <span>A confirmation email has been sent to your registered email address</span>
                </li>
                <li className="flex items-start gap-2">
                  <i className="fas fa-check text-green-500 mt-1"></i>
                  <span>For cancellations, visit our website or contact customer support</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
