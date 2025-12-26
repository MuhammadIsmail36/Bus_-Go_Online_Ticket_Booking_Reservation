// Simple standalone backend for admin APIs
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

// ====== MySQL POOL ======
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "bus_reservation",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

async function ensureCity(name, country = "Pakistan", state = null) {
  const [rows] = await pool.query(
    "SELECT id FROM cities WHERE name = ? LIMIT 1",
    [name]
  );
  if (rows.length > 0) return rows[0].id;

  const [result] = await pool.query(
    "INSERT INTO cities (name, country, state) VALUES (?, ?, ?)",
    [name, country, state]
  );
  return result.insertId;
}

// === ADMIN: Add/Update Route ===
app.post("/api/admin/routes", async (req, res) => {
  try {
    const { fromCity, toCity, distanceKm } = req.body || {};
    if (!fromCity || !toCity) {
      return res.status(400).json({ error: "fromCity and toCity are required" });
    }

    const fromId = await ensureCity(fromCity);
    const toId = await ensureCity(toCity);

    await pool.query(
      `INSERT INTO routes (from_city_id, to_city_id, distance_km)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE distance_km = VALUES(distance_km)`,
      [fromId, toId, distanceKm ?? null]
    );

    res.status(201).json({ message: "Route saved successfully" });
  } catch (err) {
    console.error("POST /api/admin/routes error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Aliases to match frontend expectations
app.post("/api/routes", async (req, res) => {
  try {
    const { fromCity, toCity, distanceKm } = req.body || {};
    if (!fromCity || !toCity) {
      return res.status(400).json({ error: "fromCity and toCity are required" });
    }

    const fromId = await ensureCity(fromCity);
    const toId = await ensureCity(toCity);

    await pool.query(
      `INSERT INTO routes (from_city_id, to_city_id, distance_km)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE distance_km = VALUES(distance_km)`,
      [fromId, toId, distanceKm ?? null]
    );

    res.status(201).json({ message: "Route saved successfully" });
  } catch (err) {
    console.error("POST /api/routes error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// === ADMIN: Add Bus ===
app.post("/api/admin/buses", async (req, res) => {
  try {
    const { busName, busType, seatType, totalSeats } = req.body || {};
    if (!busName) {
      return res.status(400).json({ error: "busName is required" });
    }

    const [result] = await pool.query(
      `INSERT INTO buses (bus_name, bus_type, seat_type, total_seats)
       VALUES (?, ?, ?, ?)`,
      [busName, busType || "AC", seatType || "Seater", totalSeats || 40]
    );

    res.status(201).json({
      message: "Bus created successfully",
      busId: result.insertId,
    });
  } catch (err) {
    console.error("POST /api/admin/buses error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/buses", async (req, res) => {
  try {
    const { busName, busType, seatType, totalSeats } = req.body || {};
    if (!busName) {
      return res.status(400).json({ error: "busName is required" });
    }

    const [result] = await pool.query(
      `INSERT INTO buses (bus_name, bus_type, seat_type, total_seats)
       VALUES (?, ?, ?, ?)`,
      [busName, busType || "AC", seatType || "Seater", totalSeats || 40]
    );

    res.status(201).json({
      message: "Bus created successfully",
      busId: result.insertId,
    });
  } catch (err) {
    console.error("POST /api/buses error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// === ADMIN: Add Schedule ===
app.post("/api/admin/schedules", async (req, res) => {
  try {
    const { busId, fromCity, toCity, departureTime, arrivalTime, durationMinutes, price } =
      req.body || {};

  if (!busId || !fromCity || !toCity || !departureTime || !arrivalTime || !price) {
    return res.status(400).json({
      error: "busId, fromCity, toCity, departureTime, arrivalTime and price are required",
    });
  }

  const fromId = await ensureCity(fromCity);
  const toId = await ensureCity(toCity);

  let [routeRows] = await pool.query(
    "SELECT id FROM routes WHERE from_city_id = ? AND to_city_id = ? LIMIT 1",
    [fromId, toId]
  );

  let routeId;
  if (routeRows.length > 0) {
    routeId = routeRows[0].id;
  } else {
    const [result] = await pool.query(
      "INSERT INTO routes (from_city_id, to_city_id, distance_km) VALUES (?, ?, NULL)",
      [fromId, toId]
    );
    routeId = result.insertId;
  }

  const dur =
    durationMinutes != null
      ? Number(durationMinutes)
      : Math.max(
          60,
          Math.round(
            (new Date(arrivalTime).getTime() - new Date(departureTime).getTime()) /
              60000
          )
        );

  const [result] = await pool.query(
    `INSERT INTO schedules
       (bus_id, route_id, departure_time, arrival_time, duration_minutes, price)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [busId, routeId, departureTime, arrivalTime, dur, price]
  );

  res.status(201).json({
    message: "Schedule created successfully",
    scheduleId: result.insertId,
  });
  } catch (err) {
    console.error("POST /api/admin/schedules error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/schedules", async (req, res) => {
  try {
    const { busId, fromCity, toCity, departureTime, arrivalTime, durationMinutes, price } =
      req.body || {};

    if (!busId || !fromCity || !toCity || !departureTime || !arrivalTime || !price) {
      return res.status(400).json({
        error: "busId, fromCity, toCity, departureTime, arrivalTime and price are required",
      });
    }

    const fromId = await ensureCity(fromCity);
    const toId = await ensureCity(toCity);

    let [routeRows] = await pool.query(
      "SELECT id FROM routes WHERE from_city_id = ? AND to_city_id = ? LIMIT 1",
      [fromId, toId]
    );

    let routeId;
    if (routeRows.length > 0) {
      routeId = routeRows[0].id;
    } else {
      const [result] = await pool.query(
        "INSERT INTO routes (from_city_id, to_city_id, distance_km) VALUES (?, ?, NULL)",
        [fromId, toId]
      );
      routeId = result.insertId;
    }

    const dur =
      durationMinutes != null
        ? Number(durationMinutes)
        : Math.max(
            60,
            Math.round(
              (new Date(arrivalTime).getTime() - new Date(departureTime).getTime()) /
                60000
            )
          );

    const [result] = await pool.query(
      `INSERT INTO schedules
         (bus_id, route_id, departure_time, arrival_time, duration_minutes, price)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [busId, routeId, departureTime, arrivalTime, dur, price]
    );

    res.status(201).json({
      message: "Schedule created successfully",
      scheduleId: result.insertId,
    });
  } catch (err) {
    console.error("POST /api/schedules error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
