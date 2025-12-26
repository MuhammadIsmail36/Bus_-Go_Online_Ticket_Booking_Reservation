import { Router } from "express";
import pool from "../db.js";

const router = Router();

router.get("/search", async (req, res) => {
  try {
    const { from, to, date, passengers } = req.query;

    if (!from || !to || !date) {
      return res.status(400).json({ error: "from, to and date are required" });
    }

    const numPassengers = passengers ? Number(passengers) : 1;

    const [rows] = await pool.query(
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
        b.total_seats - COALESCE(SUM(bookings.seats), 0) AS availableSeats,
        b.total_seats AS totalSeats,
        c_from.name AS fromCity,
        c_to.name AS toCity
      FROM schedules s
      JOIN buses b ON s.bus_id = b.id
      JOIN routes r ON s.route_id = r.id
      JOIN cities c_from ON r.from_city_id = c_from.id
      JOIN cities c_to ON r.to_city_id = c_to.id
      LEFT JOIN bookings ON bookings.schedule_id = s.id AND bookings.status = 'Confirmed'
      WHERE c_from.name = ? AND c_to.name = ? AND strftime('%Y-%m-%d', s.departure_time) = ?
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

    const buses = (rows as any[]).map((row) => {
      const durationHours = row.durationMinutes
        ? `${Math.floor(row.durationMinutes / 60)}h ${row.durationMinutes % 60}m`
        : "";
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
        toCity: row.toCity,
      };
    });

    res.json({ buses });
  } catch (err) {
    console.error("Error in /api/buses/search:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
