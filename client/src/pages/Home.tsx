import { useState } from 'react';
import { useLocation } from 'wouter';
import Layout from '@/components/Layout';

/**
 * Home Page - Modern Transit Minimalism Design
 * Hero section with search box, how it works, popular routes, and testimonials
 */

const PAKISTAN_CITIES = [
  'Karachi',
  'Lahore',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Quetta',
  'Hyderabad',
  'Gujranwala',
];

const INDIA_CITIES = [
  'Delhi',
  'Mumbai',
  'Bangalore',
  'Chennai',
  'Kolkata',
  'Hyderabad',
  'Pune',
  'Jaipur',
  'Lucknow',
  'Ahmedabad',
];

const ALL_CITIES = Array.from(new Set([...PAKISTAN_CITIES, ...INDIA_CITIES])).sort();

const POPULAR_ROUTES = [
  { from: 'Karachi', to: 'Lahore', price: 2500 },
  { from: 'Lahore', to: 'Islamabad', price: 1500 },
  { from: 'Islamabad', to: 'Peshawar', price: 1800 },
  { from: 'Delhi', to: 'Mumbai', price: 3500 },
  { from: 'Bangalore', to: 'Chennai', price: 2800 },
  { from: 'Lahore', to: 'Karachi', price: 2500 },
];

const TESTIMONIALS = [
  {
    name: 'Ahmed Khan',
    text: 'Safe, fast, and easy booking. BusGo made my journey hassle-free!',
    rating: 5,
  },
  {
    name: 'Priya Sharma',
    text: 'Great selection of buses and affordable prices. Highly recommended!',
    rating: 5,
  },
  {
    name: 'Hassan Ali',
    text: 'The seat selection feature is amazing. Very user-friendly interface.',
    rating: 5,
  },
];

export default function Home() {
  const [, navigate] = useLocation();
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: '',
  });

  const [contactStatus, setContactStatus] = useState<null | 'success' | 'error'>(null);

  const [feedbackForm, setFeedbackForm] = useState({
    name: '',
    email: '',
    rating: '5',
    comment: '',
  });

  const [feedbackStatus, setFeedbackStatus] = useState<null | 'success' | 'error'>(null);


  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Trim to ensure whitespace-only inputs are treated as empty
    const payload = {
      name: feedbackForm.name.trim(),
      email: feedbackForm.email.trim(),
      comment: feedbackForm.comment.trim(),
      rating: feedbackForm.rating,
    };
    if (!payload.name || !payload.email || !payload.comment || !payload.rating) {
      setFeedbackStatus('error');
      return;
    }
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || '';
      const res = await fetch(`${apiBase}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error('Failed to submit feedback');
      }
      setFeedbackStatus('success');
      setFeedbackForm({ name: '', email: '', rating: '5', comment: '' });
    } catch (err) {
      console.error('Error sending feedback:', err);
      setFeedbackStatus('error');
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactStatus(null);
    // Trim to ensure whitespace-only inputs are treated as empty
    const payload = {
      name: contactForm.name.trim(),
      email: contactForm.email.trim(),
      message: contactForm.message.trim(),
    };
    if (!payload.name || !payload.email || !payload.message) {
      setContactStatus('error');
      return;
    }

    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || '';
      const res = await fetch(`${apiBase}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Failed to send message');
      }

      setContactStatus('success');
      setContactForm({ name: '', email: '', message: '' });
    } catch (err) {
      console.error('Error sending contact message:', err);
      setContactStatus('error');
    }
  };

  const [searchData, setSearchData] = useState({
    from: '',
    to: '',
    date: '',
    passengers: '1',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSearchData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateSearch = () => {
    const newErrors: Record<string, string> = {};

    if (!searchData.from) newErrors.from = 'Please select departure city';
    if (!searchData.to) newErrors.to = 'Please select destination city';
    if (searchData.from === searchData.to) newErrors.to = 'Departure and destination must be different';
    if (!searchData.date) newErrors.date = 'Please select a journey date';

    const selectedDate = new Date(searchData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      newErrors.date = 'Date must be today or in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateSearch()) {
      // Store search params and navigate to results
      sessionStorage.setItem('searchData', JSON.stringify(searchData));
      navigate('/search-results');
    }
  };

  const handlePopularRouteClick = (from: string, to: string) => {
    setSearchData((prev) => ({
      ...prev,
      from,
      to,
    }));
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Book Your Bus Tickets Online</h1>
            <p className="text-lg md:text-xl opacity-90">
              Search, select seats and book your ticket in minutes. Safe, fast, and easy.
            </p>
          </div>
        </div>
      </section>

      {/* Search Box Section */}
      <section className="py-12 md:py-16 border-b border-border bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/images/bus-hero.png')" }}>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSearch} className="bg-card rounded-lg p-6 md:p-8 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                {/* From City */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    <i className="fas fa-map-marker-alt text-accent mr-2"></i>From
                  </label>
                  <select
                    name="from"
                    value={searchData.from}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                  >
                    <option value="">Select city</option>
                    {ALL_CITIES.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                  {errors.from && <p className="text-red-500 text-xs mt-1">{errors.from}</p>}
                </div>

                {/* To City */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    <i className="fas fa-map-marker-alt text-accent mr-2"></i>To
                  </label>
                  <select
                    name="to"
                    value={searchData.to}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                  >
                    <option value="">Select city</option>
                    {ALL_CITIES.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                  {errors.to && <p className="text-red-500 text-xs mt-1">{errors.to}</p>}
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    <i className="fas fa-calendar-alt text-accent mr-2"></i>Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={searchData.date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                  />
                  {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
                </div>

                {/* Passengers */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    <i className="fas fa-users text-accent mr-2"></i>Passengers
                  </label>
                  <select
                    name="passengers"
                    value={searchData.passengers}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                  >
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'Passenger' : 'Passengers'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search Button */}
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full btn-accent flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-search"></i>
                    Search
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-primary">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              { icon: 'fa-search', title: 'Search Buses', desc: 'Find available buses for your route' },
              { icon: 'fa-chair', title: 'Choose Seats', desc: 'Select your preferred seats' },
              { icon: 'fa-user', title: 'Enter Details', desc: 'Provide passenger information' },
              { icon: 'fa-ticket-alt', title: 'Get e-Ticket', desc: 'Receive your booking confirmation' },
            ].map((step, idx) => (
              <div key={idx} className="text-center">
                <div className="progress-step active mx-auto mb-4 w-16 h-16 text-2xl">
                  <i className={`fas ${step.icon}`}></i>
                </div>
                <h3 className="font-bold text-lg mb-2 text-primary">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Routes Section */}
      <section className="py-16 md:py-24 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-primary">
            Popular Routes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {POPULAR_ROUTES.map((route, idx) => (
              <button
                key={idx}
                onClick={() => handlePopularRouteClick(route.from, route.to)}
                className="bus-card text-left hover:shadow-xl transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <p className="font-semibold text-primary">{route.from}</p>
                    <p className="text-xs text-muted-foreground">Departure</p>
                  </div>
                  <i className="fas fa-arrow-right text-accent mx-4"></i>
                  <div className="flex-1 text-right">
                    <p className="font-semibold text-primary">{route.to}</p>
                    <p className="text-xs text-muted-foreground">Arrival</p>
                  </div>
                </div>
                <div className="border-t border-border pt-3 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Starting from</span>
                  <span className="text-xl font-bold text-accent">PKR {route.price}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-primary">
            What Our Customers Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {TESTIMONIALS.map((testimonial, idx) => (
              <div key={idx} className="bus-card">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    {testimonial.name[0]}
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <div className="flex gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <i key={i} className="fas fa-star text-yellow-400 text-sm"></i>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground italic">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* Contact Section */}
      <section id="contact" className="py-12 md:py-16 bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Contact Us</h2>
          <p className="text-muted-foreground mb-6">
            Have any questions or need help with your booking? Send us a message.
          </p>

          {contactStatus === 'success' && (
            <div className="mb-4 px-3 py-2 rounded bg-green-100 text-green-700 text-sm">
              Your message has been sent. We will contact you soon.
            </div>
          )}
          {contactStatus === 'error' && (
            <div className="mb-4 px-3 py-2 rounded bg-red-100 text-red-700 text-sm">
              Please fill all the fields.
            </div>
          )}

          <form onSubmit={handleContactSubmit} className="space-y-4 bg-card rounded-lg p-6 shadow-md">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background"
                value={contactForm.name}
                onChange={(e) =>
                  setContactForm((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background"
                value={contactForm.email}
                onChange={(e) =>
                  setContactForm((prev) => ({ ...prev, email: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Message</label>
              <textarea
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background min-h-[120px]"
                value={contactForm.message}
                onChange={(e) =>
                  setContactForm((prev) => ({ ...prev, message: e.target.value }))
                }
                required
              />
            </div>
            <button
              type="submit"
              className="btn-accent w-full md:w-auto px-6 py-2 font-medium"
            >
              Send Message
            </button>
          </form>
        </div>
      </section>
      {/* Feedback Section */}
      <section id="feedback" className="py-12 md:py-16 bg-muted/40">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Feedback</h2>
          <p className="text-muted-foreground mb-6">
            Tell us about your experience with our bus booking service.
          </p>

          {feedbackStatus === 'success' && (
            <div className="mb-4 px-3 py-2 rounded bg-green-100 text-green-700 text-sm">
              Thank you for your feedback!
            </div>
          )}
          {feedbackStatus === 'error' && (
            <div className="mb-4 px-3 py-2 rounded bg-red-100 text-red-700 text-sm">
              Please fill all the fields and try again.
            </div>
          )}

          <form
            onSubmit={handleFeedbackSubmit}
            className="space-y-4 bg-card rounded-lg p-6 shadow-md"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background"
                  value={feedbackForm.name}
                  onChange={(e) =>
                    setFeedbackForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background"
                  value={feedbackForm.email}
                  onChange={(e) =>
                    setFeedbackForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div>
                <label className="block text-sm font-medium mb-1">Rating</label>
                <select
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background"
                  value={feedbackForm.rating}
                  onChange={(e) =>
                    setFeedbackForm((prev) => ({ ...prev, rating: e.target.value }))
                  }
                  required
                >
                  <option value="5">⭐⭐⭐⭐⭐ (5 - Excellent)</option>
                  <option value="4">⭐⭐⭐⭐ (4 - Very Good)</option>
                  <option value="3">⭐⭐⭐ (3 - Good)</option>
                  <option value="2">⭐⭐ (2 - Fair)</option>
                  <option value="1">⭐ (1 - Poor)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Comments</label>
              <textarea
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background min-h-[100px]"
                value={feedbackForm.comment}
                onChange={(e) =>
                  setFeedbackForm((prev) => ({ ...prev, comment: e.target.value }))
                }
                required
              />
            </div>

            <button
              type="submit"
              className="btn-accent w-full md:w-auto px-6 py-2 font-medium"
            >
              Submit Feedback
            </button>
          </form>
        </div>
      </section>

    </Layout>
  );
}
