import { Router } from "express";
import pool from "../db.js";

const router = Router();

// Public: submit feedback
router.post("/", async (req, res) => {
  try {
    const { name, email, rating, comment } = req.body || {};

    if (!name || !email || !rating || !comment) {
      return res.status(400).json({ error: "name, email, rating and comment are required" });
    }

    const numericRating = Number(rating);
    if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ error: "rating must be between 1 and 5" });
    }

    const [result] = await pool.query(
      `
      INSERT INTO feedback (name, email, rating, comment)
      VALUES (?, ?, ?, ?)
      `,
      [name, email, numericRating, comment]
    );

    res.status(201).json({
      message: "Feedback submitted successfully",
      id: (result as any).insertId,
    });
  } catch (err) {
    console.error("Error in POST /api/feedback:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin: list feedback (latest first)
router.get("/", async (_req, res) => {
  try {
    const [rows] = await pool.query(
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

export default router;
