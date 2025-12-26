import { Router } from "express";
import pool from "../db.js";

const router = Router();

// Public endpoint: customer sends a message
router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body || {};

    if (!name || !email || !message) {
      return res.status(400).json({ error: "name, email and message are required" });
    }

    const [result] = await pool.query(
      `
      INSERT INTO contact_messages (name, email, message)
      VALUES (?, ?, ?)
      `,
      [name, email, message]
    );

    res.status(201).json({
      message: "Message sent successfully",
      id: (result as any).insertId,
    });
  } catch (err) {
    console.error("Error in POST /api/contact:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin endpoint: list all messages (newest first)
router.get("/messages", async (_req, res) => {
  try {
    const [rows] = await pool.query(
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

// Admin endpoint: reply to a message
router.post("/messages/:id/reply", async (req, res) => {
  try {
    const { id } = req.params;
    const { reply } = req.body || {};

    if (!reply) {
      return res.status(400).json({ error: "reply is required" });
    }

    const [result] = await pool.query(
      `
      UPDATE contact_messages
      SET admin_reply = ?, status = 'replied', replied_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [reply, id]
    );

    // @ts-ignore – mysql2 types are broad here
    if ((result as any).affectedRows === 0) {
      return res.status(404).json({ error: "Message not found" });
    }

    res.json({ message: "Reply saved successfully" });
  } catch (err) {
    console.error("Error in POST /api/contact/messages/:id/reply:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
