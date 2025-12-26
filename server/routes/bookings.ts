import { Router } from "express";
import { randomBytes } from "crypto";
import pool from "../db.js";

const router = Router();

function generatePNR() {
  return randomBytes(4).toString("hex").toUpperCase();
}

router.post("/", async (req, res) => {
  try {
    const {
      scheduleId,
      passengerName,
      passengerEmail,
      passengerPhone,
      seats,
      amount,
    } = req.body || {};

    if (!scheduleId || !passengerName || !passengerEmail || !seats || !amount) {
      return res.status(400).json({ error: "Missing required booking fields" });
    }

    // Check available seats
    const [seatRows] = await pool.query(
      `
      SELECT
        b.total_seats - COALESCE(SUM(bookings.seats), 0) AS availableSeats
      FROM schedules s
      JOIN buses b ON s.bus_id = b.id
      LEFT JOIN bookings ON bookings.schedule_id = s.id AND bookings.status = 'Confirmed'
      WHERE s.id = ?
      GROUP BY b.total_seats
      `,
      [scheduleId]
    );

    const availableSeats =
      Array.isArray(seatRows) && seatRows.length > 0
        ? (seatRows[0] as any).availableSeats
        : 0;

    if (availableSeats < seats) {
      return res.status(400).json({ error: "Not enough seats available" });
    }

    const pnr = generatePNR();

    const [result] = await pool.query(
      `
      INSERT INTO bookings
        (schedule_id, passenger_name, passenger_email, passenger_phone,
         seats, amount, pnr, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'Confirmed', CURRENT_TIMESTAMP)
      `,
      [
        scheduleId,
        passengerName,
        passengerEmail,
        passengerPhone || null,
        seats,
        amount,
        pnr,
      ]
    );

    res.status(201).json({
      message: "Booking created",
      pnr,
      bookingId: (result as any).insertId,
    });
  } catch (err) {
    console.error("Error creating booking:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: "email is required" });
    }

    const [rows] = await pool.query(
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

export default router;
