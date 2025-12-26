// server/index.ts
import express from "express";
import cors from "cors";
import { createServer } from "http";
import path2 from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import dotenv2 from "dotenv";

// server/routes/buses.ts
import { Router } from "express";

// server/db.ts
import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sqlite3 from "sqlite3";
import { promisify } from "util";
import dotenv from "dotenv";
dotenv.config();
var mysqlPool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "bus_reservation",
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectionTimeout: 3e3
  // 3-second timeout for MySQL connections
});
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var currentDb = {
  // placeholder until testConnection runs
  query: async () => {
    throw new Error("Database not initialized");
  }
};
async function createSqliteAdapter() {
  const dbFile = path.resolve(process.cwd(), "dev.sqlite3");
  const sqlite = sqlite3.verbose();
  const db = new sqlite.Database(dbFile);
  const all = promisify(db.all.bind(db));
  const run = promisify(db.run.bind(db));
  const exec = promisify(db.exec.bind(db));
  await new Promise((resolve, reject) => {
    db.run("PRAGMA foreign_keys = ON;", (err) => err ? reject(err) : resolve());
  });
  const candidatePaths = [
    path.resolve(__dirname, "../server/schema.sqlite.sql"),
    path.resolve(process.cwd(), "server/schema.sqlite.sql"),
    path.resolve(__dirname, "schema.sqlite.sql"),
    path.resolve(__dirname, "schema.sql"),
    path.resolve(process.cwd(), "server/schema.sql")
  ];
  const schemaPath = candidatePaths.find((p) => fs.existsSync(p));
  if (schemaPath) {
    let sql = fs.readFileSync(schemaPath, "utf8");
    if (schemaPath.endsWith("schema.sql")) {
      sql = sql.replace(/CREATE\s+DATABASE[^;]*;?/ig, "");
      sql = sql.replace(/USE\s+[^;]*;?/ig, "");
      sql = sql.replace(/\bINT\b/ig, "INTEGER");
      sql = sql.replace(/\bTINYINT\b/ig, "INTEGER");
      sql = sql.replace(/\bVARCHAR\([^)]*\)/ig, "TEXT");
      sql = sql.replace(/\bDECIMAL\([^)]*\)/ig, "REAL");
      sql = sql.replace(/\bDATETIME\b/ig, "TEXT");
      sql = sql.replace(/\bENUM\([^)]*\)/ig, "TEXT");
      sql = sql.replace(/AUTO_INCREMENT/ig, "AUTOINCREMENT");
      sql = sql.replace(/UNIQUE KEY [^(]+\(([^)]+)\)/ig, "UNIQUE($1)");
    }
    try {
      await exec(sql);
    } catch (e) {
      const stmts = sql.split(";").map((s) => s.trim()).filter(Boolean);
      for (const s of stmts) {
        try {
          await run(s);
        } catch (inner) {
        }
      }
    }
  }
  return {
    query: async (sql, params) => {
      const rows = await all(sql, params || []);
      return [rows, void 0];
    },
    raw: db
  };
}
async function testConnection() {
  try {
    await mysqlPool.query("SELECT 1 as ok");
    currentDb = mysqlPool;
    return true;
  } catch (err) {
    console.warn("MySQL unavailable, attempting SQLite fallback:", err && err.message ? err.message : err);
    try {
      const sqliteAdapter = await createSqliteAdapter();
      currentDb = sqliteAdapter;
      return true;
    } catch (e) {
      console.error("SQLite fallback failed:", e.message || e);
      currentDb = { query: async () => [[], void 0] };
      return true;
    }
  }
}
var dbProxy = {
  query: (...args) => currentDb.query(...args)
};
var db_default = dbProxy;

// server/routes/buses.ts
var router = Router();
router.get("/search", async (req, res) => {
  try {
    const { from, to, date, passengers } = req.query;
    if (!from || !to || !date) {
      return res.status(400).json({ error: "from, to and date are required" });
    }
    const numPassengers = passengers ? Number(passengers) : 1;
    const [rows] = await db_default.query(
      `
      SELECT
        s.id AS scheduleId,
        b.id AS busId,
        b.bus_name AS name,
        b.bus_type AS type,
        b.seat_type AS seatType,
        s.departure_time AS departureTime,
        s.arrival_time AS arrivalTime,
        s.duration_minutes AS durationMinutes,
        s.price AS price,
        b.total_seats - IFNULL(SUM(bookings.seats), 0) AS availableSeats,
        b.total_seats AS totalSeats,
        c_from.name AS fromCity,
        c_to.name AS toCity
      FROM schedules s
      JOIN buses b ON s.bus_id = b.id
      JOIN routes r ON s.route_id = r.id
      JOIN cities c_from ON r.from_city_id = c_from.id
      JOIN cities c_to ON r.to_city_id = c_to.id
      LEFT JOIN bookings ON bookings.schedule_id = s.id AND bookings.status = 'Confirmed'
      WHERE c_from.name = ? AND c_to.name = ? AND DATE(s.departure_time) = DATE(?)
      GROUP BY
        s.id,
        b.id,
        b.bus_name,
        b.bus_type,
        b.seat_type,
        s.departure_time,
        s.arrival_time,
        s.duration_minutes,
        s.price,
        b.total_seats,
        c_from.name,
        c_to.name
      HAVING availableSeats >= ?
      ORDER BY s.departure_time ASC
      `,
      [from, to, date, numPassengers]
    );
    const buses = rows.map((row) => {
      const durationHours = row.durationMinutes ? `${Math.floor(row.durationMinutes / 60)}h ${row.durationMinutes % 60}m` : "";
      return {
        id: String(row.scheduleId),
        name: row.name,
        type: row.type,
        seatType: row.seatType,
        departureTime: row.departureTime,
        arrivalTime: row.arrivalTime,
        duration: durationHours,
        price: Number(row.price),
        availableSeats: row.availableSeats,
        totalSeats: row.totalSeats,
        fromCity: row.fromCity,
        toCity: row.toCity
      };
    });
    res.json({ buses });
  } catch (err) {
    console.error("Error in /api/buses/search:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
var buses_default = router;

// server/routes/bookings.ts
import { Router as Router2 } from "express";
import { randomBytes } from "crypto";
var router2 = Router2();
function generatePNR() {
  return randomBytes(4).toString("hex").toUpperCase();
}
router2.post("/", async (req, res) => {
  try {
    const {
      scheduleId,
      passengerName,
      passengerEmail,
      passengerPhone,
      seats,
      amount
    } = req.body || {};
    if (!scheduleId || !passengerName || !passengerEmail || !seats || !amount) {
      return res.status(400).json({ error: "Missing required booking fields" });
    }
    const connection = await db_default.getConnection();
    try {
      await connection.beginTransaction();
      const [seatRows] = await connection.query(
        `
        SELECT
          b.total_seats - IFNULL(SUM(bookings.seats), 0) AS availableSeats
        FROM schedules s
        JOIN buses b ON s.bus_id = b.id
        LEFT JOIN bookings ON bookings.schedule_id = s.id AND bookings.status = 'Confirmed'
        WHERE s.id = ?
        GROUP BY b.total_seats
        `,
        [scheduleId]
      );
      const availableSeats = Array.isArray(seatRows) && seatRows.length > 0 ? seatRows[0].availableSeats : 0;
      if (availableSeats < seats) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({ error: "Not enough seats available" });
      }
      const pnr = generatePNR();
      const [result] = await connection.query(
        `
        INSERT INTO bookings
          (schedule_id, passenger_name, passenger_email, passenger_phone,
           seats, amount, pnr, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'Confirmed', NOW())
        `,
        [
          scheduleId,
          passengerName,
          passengerEmail,
          passengerPhone || null,
          seats,
          amount,
          pnr
        ]
      );
      await connection.commit();
      connection.release();
      res.status(201).json({
        message: "Booking created",
        pnr,
        bookingId: result.insertId
      });
    } catch (err) {
      await connection.rollback();
      connection.release();
      throw err;
    }
  } catch (err) {
    console.error("Error creating booking:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
router2.get("/", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: "email is required" });
    }
    const [rows] = await db_default.query(
      `
      SELECT
        bk.id,
        bk.pnr,
        bk.status,
        bk.seats,
        bk.amount,
        bk.created_at,
        s.departure_time,
        s.arrival_time,
        c_from.name AS fromCity,
        c_to.name AS toCity,
        b.bus_name AS busName
      FROM bookings bk
      JOIN schedules s ON bk.schedule_id = s.id
      JOIN routes r ON s.route_id = r.id
      JOIN cities c_from ON r.from_city_id = c_from.id
      JOIN cities c_to ON r.to_city_id = c_to.id
      JOIN buses b ON s.bus_id = b.id
      WHERE bk.passenger_email = ?
      ORDER BY bk.created_at DESC
      `,
      [email]
    );
    res.json({ bookings: rows });
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
var bookings_default = router2;

// server/routes/admin.ts
import { Router as Router3 } from "express";
var router3 = Router3();
async function ensureCity(name, country = "Pakistan", state = null) {
  const [rows] = await db_default.query(
    "SELECT id FROM cities WHERE name = ? LIMIT 1",
    [name]
  );
  if (Array.isArray(rows) && rows.length > 0) {
    return rows[0].id;
  }
  const [result] = await db_default.query(
    "INSERT INTO cities (name, country, state) VALUES (?, ?, ?)",
    [name, country, state]
  );
  return result.insertId;
}
router3.post("/routes", async (req, res) => {
  try {
    const { fromCity, toCity, distanceKm, fromCountry, toCountry, fromState, toState } = req.body || {};
    if (!fromCity || !toCity) {
      return res.status(400).json({ error: "fromCity and toCity are required" });
    }
    const fromId = await ensureCity(fromCity, fromCountry || "Pakistan", fromState || null);
    const toId = await ensureCity(toCity, toCountry || "Pakistan", toState || null);
    await db_default.query(
      `
      INSERT INTO routes (from_city_id, to_city_id, distance_km)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE distance_km = VALUES(distance_km)
      `,
      [fromId, toId, distanceKm ?? null]
    );
    res.status(201).json({ message: "Route saved successfully" });
  } catch (err) {
    console.error("Error in POST /api/admin/routes:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
router3.post("/buses", async (req, res) => {
  try {
    const { busName, busType, seatType, totalSeats } = req.body || {};
    if (!busName || typeof busName !== "string") {
      return res.status(400).json({ error: "busName is required and must be a string" });
    }
    const normalizedBusType = busType && typeof busType === "string" ? busType : "AC";
    const normalizedSeatType = seatType && typeof seatType === "string" ? seatType : "Seater";
    const seats = totalSeats ? Number(totalSeats) : 40;
    if (!Number.isInteger(seats) || seats <= 0) {
      return res.status(400).json({ error: "totalSeats must be a positive integer" });
    }
    const [result] = await db_default.query(
      `
      INSERT INTO buses (bus_name, bus_type, seat_type, total_seats)
      VALUES (?, ?, ?, ?)
      `,
      [
        busName,
        normalizedBusType,
        normalizedSeatType,
        seats
      ]
    );
    res.status(201).json({
      message: "Bus created successfully",
      busId: result.insertId
    });
  } catch (err) {
    console.error("Error in POST /api/admin/buses:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
router3.post("/schedules", async (req, res) => {
  try {
    const { busId, fromCity, toCity, departureTime, arrivalTime, durationMinutes, price } = req.body || {};
    if (!busId || !fromCity || !toCity || !departureTime || !arrivalTime || !price) {
      return res.status(400).json({
        error: "busId, fromCity, toCity, departureTime, arrivalTime and price are required"
      });
    }
    const [busRows] = await db_default.query(
      "SELECT id FROM buses WHERE id = ? LIMIT 1",
      [busId]
    );
    if (!Array.isArray(busRows) || busRows.length === 0) {
      return res.status(400).json({
        error: `Bus with ID ${busId} does not exist. Please create the bus first.`
      });
    }
    const fromId = await ensureCity(fromCity);
    const toId = await ensureCity(toCity);
    const [routeRows] = await db_default.query(
      "SELECT id FROM routes WHERE from_city_id = ? AND to_city_id = ? LIMIT 1",
      [fromId, toId]
    );
    let routeId;
    if (Array.isArray(routeRows) && routeRows.length > 0) {
      routeId = routeRows[0].id;
    } else {
      const [routeInsert] = await db_default.query(
        "INSERT INTO routes (from_city_id, to_city_id, distance_km) VALUES (?, ?, ?)",
        [fromId, toId, null]
      );
      routeId = routeInsert.insertId;
    }
    const duration = durationMinutes != null ? Number(durationMinutes) : Math.max(
      60,
      Math.round(
        (new Date(arrivalTime).getTime() - new Date(departureTime).getTime()) / 6e4
      )
    );
    const [result] = await db_default.query(
      `
      INSERT INTO schedules (bus_id, route_id, departure_time, arrival_time, duration_minutes, price)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [busId, routeId, departureTime, arrivalTime, duration, price]
    );
    res.status(201).json({
      message: "Schedule created successfully",
      scheduleId: result.insertId
    });
  } catch (err) {
    console.error("Error in POST /api/admin/schedules:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
var admin_default = router3;

// server/routes/contact.ts
import { Router as Router4 } from "express";
var router4 = Router4();
router4.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body || {};
    if (!name || !email || !message) {
      return res.status(400).json({ error: "name, email and message are required" });
    }
    const [result] = await db_default.query(
      `
      INSERT INTO contact_messages (name, email, message)
      VALUES (?, ?, ?)
      `,
      [name, email, message]
    );
    res.status(201).json({
      message: "Message sent successfully",
      id: result.insertId
    });
  } catch (err) {
    console.error("Error in POST /api/contact:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
router4.get("/messages", async (_req, res) => {
  try {
    const [rows] = await db_default.query(
      `
      SELECT id, name, email, message, status, admin_reply as adminReply,
             created_at as createdAt, replied_at as repliedAt
      FROM contact_messages
      ORDER BY created_at DESC
      `
    );
    res.json({ messages: rows });
  } catch (err) {
    console.error("Error in GET /api/contact/messages:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
router4.post("/messages/:id/reply", async (req, res) => {
  try {
    const { id } = req.params;
    const { reply } = req.body || {};
    if (!reply) {
      return res.status(400).json({ error: "reply is required" });
    }
    const [result] = await db_default.query(
      `
      UPDATE contact_messages
      SET admin_reply = ?, status = 'replied', replied_at = NOW()
      WHERE id = ?
      `,
      [reply, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Message not found" });
    }
    res.json({ message: "Reply saved successfully" });
  } catch (err) {
    console.error("Error in POST /api/contact/messages/:id/reply:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
var contact_default = router4;

// server/routes/feedback.ts
import { Router as Router5 } from "express";
var router5 = Router5();
router5.post("/", async (req, res) => {
  try {
    const { name, email, rating, comment } = req.body || {};
    if (!name || !email || !rating || !comment) {
      return res.status(400).json({ error: "name, email, rating and comment are required" });
    }
    const numericRating = Number(rating);
    if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ error: "rating must be between 1 and 5" });
    }
    const [result] = await db_default.query(
      `
      INSERT INTO feedback (name, email, rating, comment)
      VALUES (?, ?, ?, ?)
      `,
      [name, email, numericRating, comment]
    );
    res.status(201).json({
      message: "Feedback submitted successfully",
      id: result.insertId
    });
  } catch (err) {
    console.error("Error in POST /api/feedback:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
router5.get("/", async (_req, res) => {
  try {
    const [rows] = await db_default.query(
      `
      SELECT id, name, email, rating, comment, created_at as createdAt
      FROM feedback
      ORDER BY created_at DESC
      `
    );
    res.json({ feedback: rows });
  } catch (err) {
    console.error("Error in GET /api/feedback:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
var feedback_default = router5;

// server/middleware/auth.ts
var ADMIN_TOKEN = "admin_secure_token_2025";
function requireAdminAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    if (token === ADMIN_TOKEN) {
      return next();
    }
  }
  const adminSession = req.headers["x-admin-session"];
  if (adminSession === "true") {
    return next();
  }
  return res.status(401).json({
    error: "Unauthorized. Admin authentication required.",
    requiresLogin: true
  });
}

// server/index.ts
dotenv2.config();
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = path2.dirname(__filename2);
async function startServer() {
  const app = express();
  const server = createServer(app);
  app.use(express.json());
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || "*",
      credentials: true
    })
  );
  app.use("/api/buses", buses_default);
  app.use("/api/bookings", bookings_default);
  app.use("/api/admin", requireAdminAuth, admin_default);
  app.use("/api", requireAdminAuth, admin_default);
  app.use("/api/contact", contact_default);
  app.use("/api/feedback", feedback_default);
  const staticPath = process.env.NODE_ENV === "production" ? path2.resolve(__dirname2, "public") : path2.resolve(__dirname2, "..", "client", "dist");
  app.use(express.static(staticPath));
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });
  app.get("*", (_req, res) => {
    res.sendFile(path2.join(staticPath, "index.html"));
  });
  const port = process.env.PORT || 3e3;
  try {
    await testConnection();
  } catch (err) {
    console.error(
      "Unable to connect to the database. Check your .env DB settings (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME)."
    );
    process.exit(1);
  }
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
