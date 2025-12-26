CREATE DATABASE IF NOT EXISTS bus_reservation; USE bus_reservation;

-- Core data: cities and routes
CREATE TABLE IF NOT EXISTS cities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  country VARCHAR(100) NOT NULL DEFAULT 'Pakistan',
  state VARCHAR(100) NULL
);

CREATE TABLE IF NOT EXISTS routes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  from_city_id INT NOT NULL,
  to_city_id INT NOT NULL,
  distance_km INT NULL,
  UNIQUE KEY uniq_route (from_city_id, to_city_id),
  CONSTRAINT fk_routes_from_city FOREIGN KEY (from_city_id) REFERENCES cities(id) ON DELETE CASCADE,
  CONSTRAINT fk_routes_to_city FOREIGN KEY (to_city_id) REFERENCES cities(id) ON DELETE CASCADE
);

-- Buses
CREATE TABLE IF NOT EXISTS buses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bus_name VARCHAR(100) NOT NULL,
  bus_type VARCHAR(50) NOT NULL,
  seat_type VARCHAR(50) NOT NULL,
  total_seats INT NOT NULL
);

-- Schedules for routes
CREATE TABLE IF NOT EXISTS schedules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bus_id INT NOT NULL,
  route_id INT NOT NULL,
  departure_time DATETIME NOT NULL,
  arrival_time DATETIME NOT NULL,
  duration_minutes INT NULL,
  price DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_schedules_bus FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE CASCADE,
  CONSTRAINT fk_schedules_route FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE
);

-- Bookings (used for availability calculations)
CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  schedule_id INT NOT NULL,
  passenger_name VARCHAR(100) NOT NULL,
  passenger_email VARCHAR(255) NOT NULL,
  passenger_phone VARCHAR(20) NULL,
  seats INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  pnr VARCHAR(50) NOT NULL UNIQUE,
  status ENUM('Confirmed','Cancelled') NOT NULL DEFAULT 'Confirmed',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_bookings_schedule FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE CASCADE
);

-- Contact messages from customers to admin
CREATE TABLE IF NOT EXISTS contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('new', 'replied') NOT NULL DEFAULT 'new',
  admin_reply TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  replied_at DATETIME NULL
);

-- Feedback submitted by customers
CREATE TABLE IF NOT EXISTS feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
