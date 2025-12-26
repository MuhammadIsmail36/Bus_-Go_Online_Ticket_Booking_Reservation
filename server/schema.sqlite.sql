-- SQLite schema for local fallback
PRAGMA foreign_keys = ON;

-- Core data: cities and routes
CREATE TABLE IF NOT EXISTS cities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  country TEXT NOT NULL DEFAULT 'Pakistan',
  state TEXT
);

CREATE TABLE IF NOT EXISTS routes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  from_city_id INTEGER NOT NULL,
  to_city_id INTEGER NOT NULL,
  distance_km INTEGER,
  UNIQUE(from_city_id, to_city_id),
  FOREIGN KEY (from_city_id) REFERENCES cities(id) ON DELETE CASCADE,
  FOREIGN KEY (to_city_id) REFERENCES cities(id) ON DELETE CASCADE
);

-- Buses
CREATE TABLE IF NOT EXISTS buses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bus_name TEXT NOT NULL,
  bus_type TEXT NOT NULL,
  seat_type TEXT NOT NULL,
  total_seats INTEGER NOT NULL
);

-- Schedules for routes
CREATE TABLE IF NOT EXISTS schedules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bus_id INTEGER NOT NULL,
  route_id INTEGER NOT NULL,
  departure_time TEXT NOT NULL,
  arrival_time TEXT NOT NULL,
  duration_minutes INTEGER,
  price REAL NOT NULL,
  FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE CASCADE,
  FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE
);

-- Bookings (used for availability calculations)
CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  schedule_id INTEGER NOT NULL,
  passenger_name TEXT NOT NULL,
  passenger_email TEXT NOT NULL,
  passenger_phone TEXT,
  seats INTEGER NOT NULL,
  amount REAL NOT NULL,
  pnr TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('Confirmed','Cancelled')) DEFAULT 'Confirmed',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE CASCADE
);

-- Contact messages from customers to admin
CREATE TABLE IF NOT EXISTS contact_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('new','replied')) DEFAULT 'new',
  admin_reply TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  replied_at TEXT
);

-- Feedback submitted by customers
CREATE TABLE IF NOT EXISTS feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
