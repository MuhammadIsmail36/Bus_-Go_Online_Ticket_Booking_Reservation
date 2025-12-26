import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import Layout from '@/components/Layout';
import { Bus, PassengerInfo } from '@/lib/busData';

/**
 * Passenger Details & Review Page - Modern Transit Minimalism Design
 * Collect passenger information and display booking summary
 */

export default function PassengerDetails() {
  const [, navigate] = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
    }
  }, [navigate]);

  const [bus, setBus] = useState<Bus | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [passengers, setPassengers] = useState<PassengerInfo[]>([]);
  const [contactInfo, setContactInfo] = useState({ mobile: '', email: '' });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const busData = sessionStorage.getItem('selectedBus');
    const seatsData = sessionStorage.getItem('selectedSeats');

    if (busData && seatsData) {
      const bus = JSON.parse(busData);
      const seats = JSON.parse(seatsData);
      setBus(bus);
      setSelectedSeats(seats);

      // Initialize passenger form with empty fields
      const passengerForms = seats.map((seat: string) => ({
        name: '',
        gender: 'Male',
        age: 0,
        seatNumber: seat,
      }));
      setPassengers(passengerForms);
    }
  }, []);

  const handlePassengerChange = (
    index: number,
    field: keyof PassengerInfo,
    value: string | number
  ) => {
    const updated = [...passengers];
    updated[index] = { ...updated[index], [field]: value };
    setPassengers(updated);
    if (errors[`passenger-${index}-${field}`]) {
      setErrors((prev) => ({ ...prev, [`passenger-${index}-${field}`]: '' }));
    }
  };

  const handleContactChange = (field: string, value: string) => {
    setContactInfo((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate passengers
    passengers.forEach((passenger, idx) => {
      if (!passenger.name.trim()) {
        newErrors[`passenger-${idx}-name`] = 'Name is required';
      }
      if (passenger.age <= 0) {
        newErrors[`passenger-${idx}-age`] = 'Age must be greater than 0';
      }
    });

    // Validate contact info
    if (!contactInfo.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (contactInfo.mobile.replace(/\D/g, '').length < 10) {
      newErrors.mobile = 'Mobile number must be at least 10 digits';
    }

    if (!contactInfo.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactInfo.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!termsAccepted) {
      newErrors.terms = 'You must agree to Terms & Conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      // Store booking data and redirect to confirmation
      const bookingData = {
        bus,
        selectedSeats,
        passengers,
        contactInfo,
      };
      sessionStorage.setItem('bookingData', JSON.stringify(bookingData));
      setIsSubmitting(false);
      navigate('/booking-confirmation');
    }, 1500);
  };

  if (!bus) {
    return (
      <Layout>
        <section className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-background">
          <div className="text-center">
            <i className="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i>
            <p className="text-muted-foreground">Loading passenger details...</p>
          </div>
        </section>
      </Layout>
    );
  }

  const totalFare = selectedSeats.length * bus.price;

  return (
    <Layout>
      {/* Header */}
      <section className="bg-primary text-primary-foreground py-6 border-b border-border">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <i className="fas fa-user-check"></i>
            Passenger Details
          </h1>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Passenger Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Passenger Forms */}
                {passengers.map((passenger, idx) => (
                  <div key={idx} className="bg-card rounded-lg p-6 border border-border">
                    <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                      <i className="fas fa-user-circle"></i>
                      Passenger {idx + 1} - Seat {passenger.seatNumber}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Name */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-foreground mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={passenger.name}
                          onChange={(e) => handlePassengerChange(idx, 'name', e.target.value)}
                          placeholder="Enter passenger name"
                          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        {errors[`passenger-${idx}-name`] && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors[`passenger-${idx}-name`]}
                          </p>
                        )}
                      </div>

                      {/* Gender */}
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">
                          Gender *
                        </label>
                        <select
                          value={passenger.gender}
                          onChange={(e) =>
                            handlePassengerChange(
                              idx,
                              'gender',
                              e.target.value as 'Male' | 'Female' | 'Other'
                            )
                          }
                          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      {/* Age */}
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">
                          Age *
                        </label>
                        <input
                          type="number"
                          value={passenger.age || ''}
                          onChange={(e) =>
                            handlePassengerChange(idx, 'age', parseInt(e.target.value) || 0)
                          }
                          placeholder="Enter age"
                          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        {errors[`passenger-${idx}-age`] && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors[`passenger-${idx}-age`]}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Contact Information */}
                <div className="bg-card rounded-lg p-6 border border-border">
                  <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                    <i className="fas fa-phone"></i>
                    Contact Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Mobile */}
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Mobile Number *
                      </label>
                      <input
                        type="tel"
                        value={contactInfo.mobile}
                        onChange={(e) => handleContactChange('mobile', e.target.value)}
                        placeholder="Enter mobile number"
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      {errors.mobile && (
                        <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={contactInfo.email}
                        onChange={(e) => handleContactChange('email', e.target.value)}
                        placeholder="Enter email address"
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Terms & Conditions */}
                <div className="bg-card rounded-lg p-6 border border-border">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="w-5 h-5 mt-1 cursor-pointer"
                    />
                    <span className="text-sm text-muted-foreground">
                      I agree to the{' '}
                      <a href="#terms" className="text-primary hover:underline">
                        Terms & Conditions
                      </a>{' '}
                      and{' '}
                      <a href="#privacy" className="text-primary hover:underline">
                        Privacy Policy
                      </a>
                    </span>
                  </label>
                  {errors.terms && (
                    <p className="text-red-500 text-sm mt-2">{errors.terms}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-accent flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check-circle"></i>
                      Confirm Booking
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Booking Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-lg p-6 border border-border sticky top-4">
                <h3 className="text-xl font-bold text-primary mb-6">Booking Summary</h3>

                <div className="space-y-4 mb-6 pb-6 border-b border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">Bus</p>
                    <p className="font-semibold text-foreground">{bus.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Route</p>
                    <p className="font-semibold text-foreground">From → To</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Date & Time</p>
                    <p className="font-semibold text-foreground">
                      {new Date().toLocaleDateString()} {bus.departureTime}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 mb-6 pb-6 border-b border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">Passengers</p>
                    <p className="font-semibold text-foreground">{passengers.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Selected Seats</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedSeats.map((seat) => (
                        <span
                          key={seat}
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold"
                        >
                          {seat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fare per seat</span>
                    <span className="font-semibold">PKR {bus.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Seats</span>
                    <span className="font-semibold">{selectedSeats.length}</span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between">
                    <span className="font-bold">Total Fare</span>
                    <span className="text-2xl font-bold text-accent">PKR {totalFare}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
