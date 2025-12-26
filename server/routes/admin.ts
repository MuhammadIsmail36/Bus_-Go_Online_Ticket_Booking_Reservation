import { Router } from "express";
import pool from "../db.js";

const router = Router();

async function ensureCity(name: string, country = "Pakistan", state: string | null = null) {
  const [rows] = await pool.query(
    "SELECT id FROM cities WHERE name = ? LIMIT 1",
    [name]
  );
  if (Array.isArray(rows) && rows.length > 0) {
    return (rows[0] as any).id as number;
  }

  const [result] = await pool.query(
    "INSERT INTO cities (name, country, state) VALUES (?, ?, ?)",
    [name, country, state]
  );
  return (result as any).insertId as number;
}

router.post("/routes", async (req, res) => {
  try {
    const { fromCity, toCity, distanceKm, fromCountry, toCountry, fromState, toState } =
      req.body || {};

    if (!fromCity || !toCity) {
      return res.status(400).json({ error: "fromCity and toCity are required" });
    }

    const fromId = await ensureCity(fromCity, fromCountry || "Pakistan", fromState || null);
    const toId = await ensureCity(toCity, toCountry || "Pakistan", toState || null);

    await pool.query(
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

router.post("/buses", async (req, res) => {
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

    const [result] = await pool.query(
      `
      INSERT INTO buses (bus_name, bus_type, seat_type, total_seats)
      VALUES (?, ?, ?, ?)
      `,
      [
        busName,
        normalizedBusType,
        normalizedSeatType,
        seats,
      ]
    );

    res.status(201).json({
      message: "Bus created successfully",
      busId: (result as any).insertId,
    });
  } catch (err) {
    console.error("Error in POST /api/admin/buses:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/schedules", async (req, res) => {
  try {
    const { busId, fromCity, toCity, departureTime, arrivalTime, durationMinutes, price } =
      req.body || {};

    if (!busId || !fromCity || !toCity || !departureTime || !arrivalTime || !price) {
      return res.status(400).json({
        error: "busId, fromCity, toCity, departureTime, arrivalTime and price are required",
      });
    }

    // Validate that the bus exists
    const [busRows] = await pool.query(
      "SELECT id FROM buses WHERE id = ? LIMIT 1",
      [busId]
    );
    if (!Array.isArray(busRows) || busRows.length === 0) {
      return res.status(400).json({
        error: `Bus with ID ${busId} does not exist. Please create the bus first.`,
      });
    }

    const fromId = await ensureCity(fromCity);
    const toId = await ensureCity(toCity);

    const [routeRows] = await pool.query(
      "SELECT id FROM routes WHERE from_city_id = ? AND to_city_id = ? LIMIT 1",
      [fromId, toId]
    );

    let routeId: number;
    if (Array.isArray(routeRows) && routeRows.length > 0) {
      routeId = (routeRows[0] as any).id;
    } else {
      const [routeInsert] = await pool.query(
        "INSERT INTO routes (from_city_id, to_city_id, distance_km) VALUES (?, ?, ?)",
        [fromId, toId, null]
      );
      routeId = (routeInsert as any).insertId;
    }

    const duration =
      durationMinutes != null
        ? Number(durationMinutes)
        : Math.max(
            60,
            Math.round(
              (new Date(arrivalTime).getTime() - new Date(departureTime).getTime()) / 60000
            )
          );

    // Validate that duration is a valid number
    if (!Number.isFinite(duration) || duration < 0) {
      return res.status(400).json({
        error: "Duration calculation failed. Check that departureTime and arrivalTime are valid ISO dates.",
      });
    }

    const [result] = await pool.query(
      `
      INSERT INTO schedules (bus_id, route_id, departure_time, arrival_time, duration_minutes, price)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [busId, routeId, departureTime, arrivalTime, duration, price]
    );

    res.status(201).json({
      message: "Schedule created successfully",
      scheduleId: (result as any).insertId,
    });
  } catch (err) {
    console.error("Error in POST /api/admin/schedules:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
