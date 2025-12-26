import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

// Hard-coded admin credentials (you can change these)
const ADMIN_PHONE = '03001234567';
const ADMIN_PASSWORD = 'Admin@123';

type AlertState = { type: 'success' | 'error'; message: string } | null;

type ContactMessage = {
  id: number;
  name: string;
  email: string;
  message: string;
  status: 'new' | 'replied';
  adminReply: string | null;
  createdAt: string;
  repliedAt: string | null;
};

type FeedbackItem = {
  id: number;
  name: string;
  email: string;
  rating: number;
  comment: string;
  createdAt: string;
};

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export default function Admin() {
  const [isAdminVerified, setIsAdminVerified] = useState<boolean>(() => {
    return localStorage.getItem('isAdmin') === 'true';
  });

  const [adminLogin, setAdminLogin] = useState({
    phoneOrEmail: '',
    password: '',
  });
  const [adminLoginError, setAdminLoginError] = useState<string>('');

  const [routeAlert, setRouteAlert] = useState<AlertState>(null);
  const [busAlert, setBusAlert] = useState<AlertState>(null);
  const [scheduleAlert, setScheduleAlert] = useState<AlertState>(null);

  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [contactLoading, setContactLoading] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);



  const [routeForm, setRouteForm] = useState({
    fromCity: '',
    toCity: '',
    distanceKm: '',
  });

  const [busForm, setBusForm] = useState({
    busName: '',
    busType: 'AC',
    seatType: 'Seater',
    totalSeats: '40',
  });

  const [scheduleForm, setScheduleForm] = useState({
    busId: '',
    fromCity: '',
    toCity: '',
    departureTime: '',
    arrivalTime: '',
    durationMinutes: '',
    price: '',
  });

  const apiBase =
    API_BASE && API_BASE.length > 0
      ? API_BASE
      : window.location.origin.includes('5173')
      ? 'http://localhost:3000'
      : window.location.origin;

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'X-Admin-Session': localStorage.getItem('isAdmin') === 'true' ? 'true' : 'false',
  });


  useEffect(() => {
    if (!isAdminVerified) return;

    const fetchMessages = async () => {
      setContactLoading(true);
      setContactError(null);
      try {
        const res = await fetch(`${apiBase}/api/contact/messages`);
        const data = await safeJson(res);
        if (!res.ok) {
          throw new Error((data && (data as any).error) || 'Failed to load messages');
        }
        const msgs = (data && (data as any).messages) || [];
        setContactMessages(msgs as ContactMessage[]);
      } catch (err: any) {
        console.error('Error loading contact messages:', err);
        setContactError(err?.message || 'Failed to load messages');
      } finally {
        setContactLoading(false);
      }
    };

    fetchMessages();
  }, [isAdminVerified, apiBase]);

  const handleReplySubmit = async (id: number) => {
    if (!replyText.trim()) return;
    try {
      const res = await fetch(`${apiBase}/api/contact/messages/${id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply: replyText }),
      });
      const data = await safeJson(res);
      if (!res.ok) {
        throw new Error((data && (data as any).error) || 'Failed to save reply');
      }
      setReplyText('');
      // Refresh messages
      const refreshed = await fetch(`${apiBase}/api/contact/messages`);
      const refreshedJson = await safeJson(refreshed);
      if (refreshed.ok && refreshedJson && (refreshedJson as any).messages) {
        setContactMessages((refreshedJson as any).messages as ContactMessage[]);
      }
    } catch (err) {
      console.error('Error sending reply:', err);
    }
  };


  useEffect(() => {
    if (!isAdminVerified) return;

    const fetchFeedback = async () => {
      setFeedbackLoading(true);
      setFeedbackError(null);
      try {
        const res = await fetch(`${apiBase}/api/feedback`);
        const data = await safeJson(res);
        if (!res.ok) {
          throw new Error((data && (data as any).error) || 'Failed to load feedback');
        }
        const list = (data && (data as any).feedback) || [];
        setFeedbackItems(list as FeedbackItem[]);
      } catch (err: any) {
        console.error('Error loading feedback:', err);
        setFeedbackError(err?.message || 'Failed to load feedback');
      } finally {
        setFeedbackLoading(false);
      }
    };

    fetchFeedback();
  }, [isAdminVerified, apiBase]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginError('');

    const okPhone =
      adminLogin.phoneOrEmail === ADMIN_PHONE ||
      adminLogin.phoneOrEmail.toLowerCase() === 'admin@example.com';

    if (okPhone && adminLogin.password === ADMIN_PASSWORD) {
      localStorage.setItem('isAdmin', 'true');
      setIsAdminVerified(true);
    } else {
      setAdminLoginError('Invalid admin phone/email or password.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    setIsAdminVerified(false);
    setAdminLogin({ phoneOrEmail: '', password: '' });
    setAdminLoginError('');
  };

  const handleRouteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRouteAlert(null);
    try {
      const res = await fetch(`${apiBase}/api/admin/routes`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          fromCity: routeForm.fromCity.trim(),
          toCity: routeForm.toCity.trim(),
          distanceKm: routeForm.distanceKm ? Number(routeForm.distanceKm) : null,
        }),
      });

      const data = await safeJson(res);

      if (res.status === 401) {
        handleLogout();
        throw new Error('Session expired. Please login again.');
      }

      if (!res.ok) {
        throw new Error(
          (data && (data as any).error) ||
            `Server error (${res.status}). Make sure Node backend is running on ${apiBase}.`
        );
      }

      setRouteAlert({
        type: 'success',
        message:
          (data && (data as any).message) || 'Route saved successfully (no JSON response).',
      });
      setRouteForm({ fromCity: '', toCity: '', distanceKm: '' });
    } catch (err: any) {
      setRouteAlert({
        type: 'error',
        message: err?.message || 'Failed to save route',
      });
    }
  };

  const handleBusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusAlert(null);
    try {
      const res = await fetch(`${apiBase}/api/admin/buses`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          busName: busForm.busName.trim(),
          busType: busForm.busType,
          seatType: busForm.seatType,
          totalSeats: Number(busForm.totalSeats || '40'),
        }),
      });

      const data = await safeJson(res);

      if (res.status === 401) {
        handleLogout();
        throw new Error('Session expired. Please login again.');
      }

      if (!res.ok) {
        throw new Error(
          (data && (data as any).error) ||
            `Server error (${res.status}). Make sure Node backend is running on ${apiBase}.`
        );
      }

      setBusAlert({
        type: 'success',
        message: (data && (data as any).message) || 'Bus saved successfully (no JSON response).',
      });
      setBusForm({ busName: '', busType: 'AC', seatType: 'Seater', totalSeats: '40' });
    } catch (err: any) {
      setBusAlert({
        type: 'error',
        message: err?.message || 'Failed to save bus',
      });
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setScheduleAlert(null);

    // Validate all required fields before submission
    if (!scheduleForm.busId || !scheduleForm.fromCity || !scheduleForm.toCity || 
        !scheduleForm.departureTime || !scheduleForm.arrivalTime || !scheduleForm.price) {
      setScheduleAlert({
        type: 'error',
        message: 'Please fill in all required fields: Bus ID, From City, To City, Departure Time, Arrival Time, and Price.',
      });
      return;
    }

    try {
      const res = await fetch(`${apiBase}/api/admin/schedules`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          busId: Number(scheduleForm.busId),
          fromCity: scheduleForm.fromCity.trim(),
          toCity: scheduleForm.toCity.trim(),
          departureTime: scheduleForm.departureTime,
          arrivalTime: scheduleForm.arrivalTime,
          durationMinutes: scheduleForm.durationMinutes
            ? Number(scheduleForm.durationMinutes)
            : undefined,
          price: Number(scheduleForm.price),
        }),
      });

      const data = await safeJson(res);

      if (res.status === 401) {
        handleLogout();
        throw new Error('Session expired. Please login again.');
      }

      if (!res.ok) {
        throw new Error(
          (data && (data as any).error) ||
            `Server error (${res.status}). Make sure Node backend is running on ${apiBase}.`
        );
      }

      setScheduleAlert({
        type: 'success',
        message:
          (data && (data as any).message) ||
          'Schedule saved successfully (no JSON response).',
      });
      setScheduleForm({
        busId: '',
        fromCity: '',
        toCity: '',
        departureTime: '',
        arrivalTime: '',
        durationMinutes: '',
        price: '',
      });
    } catch (err: any) {
      setScheduleAlert({
        type: 'error',
        message: err?.message || 'Failed to save schedule',
      });
    }
  };

  if (!isAdminVerified) {
    return (
      <Layout>
        <section className="min-h-[60vh] flex items-center justify-center bg-background">
          <div className="w-full max-w-md bg-card border border-border rounded-xl p-6 shadow-sm">
            <h1 className="text-2xl font-bold mb-2 text-center">Admin Login</h1>
            <p className="text-sm text-muted-foreground mb-4 text-center">
              Only authorized admin can access the Admin Panel.
            </p>
            {adminLoginError && (
              <div className="mb-3 text-sm px-3 py-2 rounded bg-red-100 text-red-700">
                {adminLoginError}
              </div>
            )}
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Admin Phone / Email
                </label>
                <input
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background"
                  value={adminLogin.phoneOrEmail}
                  onChange={(e) =>
                    setAdminLogin((prev) => ({ ...prev, phoneOrEmail: e.target.value }))
                  }
                  placeholder="e.g. 03001234567"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Admin Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background"
                  value={adminLogin.password}
                  onChange={(e) =>
                    setAdminLogin((prev) => ({ ...prev, password: e.target.value }))
                  }
                  required
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                To change the admin password in future, you must edit it in the project code
                (constants ADMIN_PHONE and ADMIN_PASSWORD).
              </p>
              <button
                type="submit"
                className="w-full btn-accent mt-2 flex items-center justify-center gap-2"
              >
                Login as Admin
              </button>
            </form>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-10 bg-background">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <i className="fas fa-tools text-primary"></i>
                Admin Panel
              </h1>
              <p className="text-muted-foreground mt-2 max-w-2xl">
                Manage cities, routes, buses and schedules. This panel changes data in the MySQL
                database (bus_reservation).
              </p>
              <p className="text-xs text-orange-500 mt-1">
                Note: In development, also run the Node backend on port 3000
                (pnpm build && pnpm start), or set VITE_API_BASE_URL to your backend URL.
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <i className="fas fa-sign-out-alt"></i>
              Logout
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Add / Update Route */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <i className="fas fa-road text-primary"></i>
                Add / Update Route
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Create new routes between cities. If the route already exists, distance will be updated.
              </p>
              {routeAlert && (
                <div
                  className={`mb-3 text-sm px-3 py-2 rounded ${
                    routeAlert.type === 'success'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {routeAlert.message}
                </div>
              )}
              <form onSubmit={handleRouteSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">From City</label>
                  <input
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background"
                    value={routeForm.fromCity}
                    onChange={(e) =>
                      setRouteForm((prev) => ({ ...prev, fromCity: e.target.value }))
                    }
                    placeholder="e.g. Karachi"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">To City</label>
                  <input
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background"
                    value={routeForm.toCity}
                    onChange={(e) =>
                      setRouteForm((prev) => ({ ...prev, toCity: e.target.value }))
                    }
                    placeholder="e.g. Lahore"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Distance (km){' '}
                    <span className="text-xs text-muted-foreground">(optional)</span>
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background"
                    value={routeForm.distanceKm}
                    onChange={(e) =>
                      setRouteForm((prev) => ({ ...prev, distanceKm: e.target.value }))
                    }
                    placeholder="e.g. 1210"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full btn-accent mt-2 flex items-center justify-center gap-2"
                >
                  <i className="fas fa-plus"></i>
                  Save Route
                </button>
              </form>
            </div>

            {/* Add Bus */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <i className="fas fa-bus text-primary"></i>
                Add Bus
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Add new buses that can be used in schedules.
              </p>
              {busAlert && (
                <div
                  className={`mb-3 text-sm px-3 py-2 rounded ${
                    busAlert.type === 'success'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {busAlert.message}
                </div>
              )}
              <form onSubmit={handleBusSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Bus Name</label>
                  <input
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background"
                    value={busForm.busName}
                    onChange={(e) =>
                      setBusForm((prev) => ({ ...prev, busName: e.target.value }))
                    }
                    placeholder="e.g. Daewoo Express"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Bus Type</label>
                    <select
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background"
                      value={busForm.busType}
                      onChange={(e) =>
                        setBusForm((prev) => ({ ...prev, busType: e.target.value }))
                      }
                    >
                      <option value="AC">AC</option>
                      <option value="Non-AC">Non-AC</option>
                      <option value="Sleeper">Sleeper</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Seat Type</label>
                    <select
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background"
                      value={busForm.seatType}
                      onChange={(e) =>
                        setBusForm((prev) => ({ ...prev, seatType: e.target.value }))
                      }
                    >
                      <option value="Seater">Seater</option>
                      <option value="Sleeper">Sleeper</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Total Seats</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background"
                    value={busForm.totalSeats}
                    onChange={(e) =>
                      setBusForm((prev) => ({ ...prev, totalSeats: e.target.value }))
                    }
                    min={10}
                    max={80}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full btn-accent mt-2 flex items-center justify-center gap-2"
                >
                  <i className="fas fa-plus"></i>
                  Save Bus
                </button>
              </form>
            </div>

            {/* Add Schedule */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <i className="fas fa-clock text-primary"></i>
                Add Schedule
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Link a bus to a route with specific date, time and price.
                Make sure the bus and cities already exist.
              </p>
              {scheduleAlert && (
                <div
                  className={`mb-3 text-sm px-3 py-2 rounded ${
                    scheduleAlert.type === 'success'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {scheduleAlert.message}
                </div>
              )}
              <form onSubmit={handleScheduleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Bus ID</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background"
                    value={scheduleForm.busId}
                    onChange={(e) =>
                      setScheduleForm((prev) => ({ ...prev, busId: e.target.value }))
                    }
                    placeholder="e.g. 1"
                    required
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">
                    You can see IDs from phpMyAdmin / MySQL (table: buses).
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">From City</label>
                    <input
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background"
                      value={scheduleForm.fromCity}
                      onChange={(e) =>
                        setScheduleForm((prev) => ({ ...prev, fromCity: e.target.value }))
                      }
                      placeholder="e.g. Karachi"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">To City</label>
                    <input
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background"
                      value={scheduleForm.toCity}
                      onChange={(e) =>
                        setScheduleForm((prev) => ({ ...prev, toCity: e.target.value }))
                      }
                      placeholder="e.g. Lahore"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Departure Time</label>
                    <input
                      type="datetime-local"
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background"
                      value={scheduleForm.departureTime}
                      onChange={(e) =>
                        setScheduleForm((prev) => ({
                          ...prev,
                          departureTime: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Arrival Time</label>
                    <input
                      type="datetime-local"
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background"
                      value={scheduleForm.arrivalTime}
                      onChange={(e) =>
                        setScheduleForm((prev) => ({
                          ...prev,
                          arrivalTime: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Duration (minutes){' '}
                    <span className="text-xs text-muted-foreground">(optional)</span>
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background"
                    value={scheduleForm.durationMinutes}
                    onChange={(e) =>
                      setScheduleForm((prev) => ({
                        ...prev,
                        durationMinutes: e.target.value,
                      }))
                    }
                    placeholder="If empty, system will calculate automatically."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ticket Price (PKR)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background"
                    value={scheduleForm.price}
                    onChange={(e) =>
                      setScheduleForm((prev) => ({ ...prev, price: e.target.value }))
                    }
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full btn-accent mt-2 flex items-center justify-center gap-2"
                >
                  <i className="fas fa-plus"></i>
                  Save Schedule
                </button>
              </form>
            </div>

            {/* Contact Messages */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm lg:col-span-3">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <i className="fas fa-envelope-open-text text-primary"></i>
                Contact Messages
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                See messages sent from the Contact form and write replies for follow up.
              </p>

              {contactLoading && (
                <p className="text-sm text-muted-foreground">Loading messages...</p>
              )}
              {contactError && (
                <div className="mb-3 text-sm px-3 py-2 rounded bg-red-100 text-red-700">
                  {contactError}
                </div>
              )}

              {!contactLoading && !contactError && contactMessages.length === 0 && (
                <p className="text-sm text-muted-foreground">No messages yet.</p>
              )}

              <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                {contactMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className="border border-border rounded-lg p-3 text-sm flex flex-col gap-2"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{msg.name}</p>
                        <p className="text-xs text-muted-foreground">{msg.email}</p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          msg.status === 'new'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {msg.status === 'new' ? 'New' : 'Replied'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                      {msg.message}
                    </p>
                    {msg.adminReply && (
                      <div className="mt-1 text-xs bg-muted rounded px-2 py-1">
                        <span className="font-semibold">Admin reply: </span>
                        {msg.adminReply}
                      </div>
                    )}
                    <div className="mt-2 flex flex-col gap-2">
                      <textarea
                        className="w-full px-2 py-1 border border-border rounded-md text-xs bg-background"
                        placeholder="Write a reply (this will be stored in the system)"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => handleReplySubmit(msg.id)}
                        className="self-start text-xs px-3 py-1 rounded bg-primary text-primary-foreground hover:opacity-90"
                      >
                        Save Reply
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Feedback Panel */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm lg:col-span-3 mt-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <i className="fas fa-star text-primary"></i>
                Customer Feedback
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                See feedback submitted by customers about their experience.
              </p>

              {feedbackLoading && (
                <p className="text-sm text-muted-foreground">Loading feedback...</p>
              )}
              {feedbackError && (
                <div className="mb-3 text-sm px-3 py-2 rounded bg-red-100 text-red-700">
                  {feedbackError}
                </div>
              )}
              {!feedbackLoading && !feedbackError && feedbackItems.length === 0 && (
                <p className="text-sm text-muted-foreground">No feedback yet.</p>
              )}

              <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                {feedbackItems.map((fb) => (
                  <div
                    key={fb.id}
                    className="border border-border rounded-lg p-3 text-sm flex flex-col gap-1"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{fb.name}</p>
                        <p className="text-xs text-muted-foreground">{fb.email}</p>
                      </div>
                      <div className="text-xs">
                        {'⭐'.repeat(Math.max(1, Math.min(5, fb.rating)))}{' '}
                        <span className="text-muted-foreground">({fb.rating}/5)</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                      {fb.comment}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Submitted: {new Date(fb.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
