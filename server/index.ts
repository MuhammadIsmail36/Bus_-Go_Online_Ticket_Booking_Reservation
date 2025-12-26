import express from "express";
import cors from "cors";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

import busesRouter from "./routes/buses.js";
import bookingsRouter from "./routes/bookings.js";
import adminRouter from "./routes/admin.js";
import contactRouter from "./routes/contact.js";
import feedbackRouter from "./routes/feedback.js";
import { testConnection } from "./db.js";
import { requireAdminAuth } from "./middleware/auth.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(express.json());
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || "*",
      credentials: true,
    })
  );

  app.use("/api/buses", busesRouter);
  app.use("/api/bookings", bookingsRouter);
  app.use("/api/admin", requireAdminAuth, adminRouter);
  // Alias admin endpoints under /api to satisfy frontend expectations
  // This exposes POST /api/routes, /api/buses, /api/schedules via the existing admin router.
  app.use("/api/routes", requireAdminAuth, adminRouter);
  app.use("/api/contact", contactRouter);
  app.use("/api/contact/messages", requireAdminAuth, contactRouter);
  app.use("/api/feedback", requireAdminAuth, feedbackRouter);

  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "client", "dist");

  app.use(express.static(staticPath));

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

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
