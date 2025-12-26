import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import Layout from '@/components/Layout';
import { Bus, getBusesByRoute } from '@/lib/busData';

/**
 * Search Results Page - Modern Transit Minimalism Design
 * Display buses with filtering and sorting options
 */

interface SearchParams {
  from: string;
  to: string;
  date: string;
  passengers: string;
}

export default function SearchResults() {
  const [, navigate] = useLocation();
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [filteredBuses, setFilteredBuses] = useState<Bus[]>([]);
  const [filters, setFilters] = useState({
    busType: 'all',
    departureTime: 'all',
    priceRange: [0, 5000],
  });
  const [sortBy, setSortBy] = useState('price');

  useEffect(() => {
    const stored = sessionStorage.getItem('searchData');
    if (stored) {
      const params: SearchParams = JSON.parse(stored);
      setSearchParams(params);

      (async () => {
        const results = await getBusesByRoute(
          params.from,
          params.to,
          params.date,
          params.passengers
        );
        setBuses(results);
        setFilteredBuses(results);
      })();
    }
  }, []);

  useEffect(() => {
    // Apply filters and sorting
    let result = [...buses];

    // Filter by bus type
    if (filters.busType !== 'all') {
      result = result.filter((bus) => bus.type === filters.busType);
    }

    // Filter by departure time
    if (filters.departureTime !== 'all') {
      result = result.filter((bus) => {
        const hour = parseInt(bus.departureTime.split(':')[0]);
        if (filters.departureTime === 'morning') return hour < 12;
        if (filters.departureTime === 'afternoon') return hour >= 12 && hour < 17;
        if (filters.departureTime === 'night') return hour >= 17;
        return true;
      });
    }

    // Filter by price range
    result = result.filter(
      (bus) => bus.price >= filters.priceRange[0] && bus.price <= filters.priceRange[1]
    );

    // Sort
    if (sortBy === 'price') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'departure') {
      result.sort((a, b) => {
        const aHour = parseInt(a.departureTime.split(':')[0]);
        const bHour = parseInt(b.departureTime.split(':')[0]);
        return aHour - bHour;
      });
    } else if (sortBy === 'seats') {
      result.sort((a, b) => b.availableSeats - a.availableSeats);
    }

    setFilteredBuses(result);
  }, [buses, filters, sortBy]);

  if (!searchParams) {
    return (
      <Layout>
        <section className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-background">
          <div className="text-center">
            <i className="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i>
            <p className="text-muted-foreground">Loading search results...</p>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Search Summary */}
      <section className="bg-primary text-primary-foreground py-6 border-b border-border">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold mb-2">
            <i className="fas fa-bus mr-2"></i>
            Buses from {searchParams.from} to {searchParams.to}
          </h1>
          <p className="opacity-90">
            {new Date(searchParams.date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
            {' • '}
            {searchParams.passengers} {searchParams.passengers === '1' ? 'Passenger' : 'Passengers'}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-lg p-6 border border-border sticky top-4">
                <h2 className="text-lg font-bold text-primary mb-6 flex items-center gap-2">
                  <i className="fas fa-filter"></i>
                  Filters
                </h2>

                {/* Bus Type Filter */}
                <div className="mb-6">
                  <h3 className="font-semibold text-foreground mb-3">Bus Type</h3>
                  <div className="space-y-2">
                    {['all', 'AC', 'Non-AC', 'Sleeper'].map((type) => (
                      <label key={type} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="busType"
                          value={type}
                          checked={filters.busType === type}
                          onChange={(e) =>
                            setFilters((prev) => ({ ...prev, busType: e.target.value }))
                          }
                          className="w-4 h-4 cursor-pointer"
                        />
                        <span className="text-sm text-muted-foreground">
                          {type === 'all' ? 'All Types' : type}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Departure Time Filter */}
                <div className="mb-6">
                  <h3 className="font-semibold text-foreground mb-3">Departure Time</h3>
                  <div className="space-y-2">
                    {[
                      { value: 'all', label: 'All Times' },
                      { value: 'morning', label: 'Morning (Before 12 PM)' },
                      { value: 'afternoon', label: 'Afternoon (12 PM - 5 PM)' },
                      { value: 'night', label: 'Night (After 5 PM)' },
                    ].map((option) => (
                      <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="departureTime"
                          value={option.value}
                          checked={filters.departureTime === option.value}
                          onChange={(e) =>
                            setFilters((prev) => ({ ...prev, departureTime: e.target.value }))
                          }
                          className="w-4 h-4 cursor-pointer"
                        />
                        <span className="text-sm text-muted-foreground">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range Filter */}
                <div className="mb-6">
                  <h3 className="font-semibold text-foreground mb-3">Price Range</h3>
                  <div className="space-y-3">
                    <input
                      type="range"
                      min="0"
                      max="5000"
                      step="100"
                      value={filters.priceRange[1]}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          priceRange: [prev.priceRange[0], parseInt(e.target.value)],
                        }))
                      }
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>PKR {filters.priceRange[0]}</span>
                      <span>PKR {filters.priceRange[1]}</span>
                    </div>
                  </div>
                </div>

                {/* Reset Filters */}
                <button
                  onClick={() => {
                    setFilters({ busType: 'all', departureTime: 'all', priceRange: [0, 5000] });
                  }}
                  className="w-full py-2 px-4 border border-border rounded-lg text-sm font-semibold text-primary hover:bg-secondary transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            </div>

            {/* Results */}
            <div className="lg:col-span-3">
              {/* Sort Options */}
              <div className="mb-6 flex items-center justify-between">
                <p className="text-muted-foreground">
                  Showing {filteredBuses.length} of {buses.length} buses
                </p>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                >
                  <option value="price">Sort by Price</option>
                  <option value="departure">Sort by Departure Time</option>
                  <option value="seats">Sort by Available Seats</option>
                </select>
              </div>

              {/* Bus Cards */}
              {filteredBuses.length > 0 ? (
                <div className="space-y-4">
                  {filteredBuses.map((bus) => (
                    <div key={bus.id} className="bus-card">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        {/* Bus Info */}
                        <div>
                          <h3 className="font-bold text-lg text-primary mb-1">{bus.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {bus.type} • {bus.seatType}
                          </p>
                        </div>

                        {/* Time & Duration */}
                        <div className="text-center">
                          <p className="font-bold text-primary">{bus.departureTime}</p>
                          <p className="text-xs text-muted-foreground">{bus.duration}</p>
                          <p className="font-bold text-primary mt-2">{bus.arrivalTime}</p>
                        </div>

                        {/* Price & Seats */}
                        <div className="text-right">
                          <p className="text-2xl font-bold text-accent">PKR {bus.price}</p>
                          <p className="text-xs text-muted-foreground">per seat</p>
                          <p className="text-sm text-green-600 font-semibold mt-2">
                            {bus.availableSeats} seats available
                          </p>
                        </div>

                        {/* Action Button */}
                        <div className="flex items-end">
                          <button
                            onClick={() => {
                              sessionStorage.setItem('selectedBus', JSON.stringify(bus));
                              navigate('/bus-details');
                            }}
                            className="w-full btn-accent"
                          >
                            View Seats
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <i className="fas fa-search text-4xl text-muted-foreground mb-4"></i>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No buses found</h3>
                  <p className="text-muted-foreground">
                    No buses available for this route on the selected date. Try adjusting your filters.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
