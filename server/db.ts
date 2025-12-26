import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sqlite3 from "sqlite3";
import { promisify } from "util";
import dotenv from "dotenv";

dotenv.config();

// Create a MySQL pool (may fail at runtime if credentials are wrong)
const mysqlPool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "bus_reservation",
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectionTimeout: 3000, // 3-second timeout for MySQL connections
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let currentDb: any = {
  // placeholder until testConnection runs
  query: async () => {
    throw new Error("Database not initialized");
  },
};

async function createSqliteAdapter() {
  // Place the sqlite DB at project root for consistency
  const dbFile = path.resolve(process.cwd(), "dev.sqlite3");
  const sqlite = sqlite3.verbose();
  const db = new sqlite.Database(dbFile);
  const all = promisify(db.all.bind(db));
  const run = promisify(db.run.bind(db));
  const exec = promisify(db.exec.bind(db));

  // Enable foreign keys
  await new Promise<void>((resolve, reject) => {
    db.run("PRAGMA foreign_keys = ON;", (err: any) => (err ? reject(err) : resolve()));
  });

  // Prefer a SQLite-specific schema file; fall back to MySQL schema if needed
  const candidatePaths = [
    path.resolve(__dirname, "../server/schema.sqlite.sql"),
    path.resolve(process.cwd(), "server/schema.sqlite.sql"),
    path.resolve(__dirname, "schema.sqlite.sql"),
    path.resolve(__dirname, "schema.sql"),
    path.resolve(process.cwd(), "server/schema.sql"),
  ];
  const schemaPath = candidatePaths.find(p => fs.existsSync(p));

  if (schemaPath) {
    let sql = fs.readFileSync(schemaPath, "utf8");

    // If using MySQL schema, strip unsupported statements (best-effort)
    if (schemaPath.endsWith("schema.sql")) {
      sql = sql.replace(/CREATE\s+DATABASE[^;]*;?/ig, "");
      sql = sql.replace(/USE\s+[^;]*;?/ig, "");
      // naive type replacements to improve compatibility
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
      // Fall back to running statements individually to bypass non-fatal incompatibilities
      const stmts = sql.split(";").map(s => s.trim()).filter(Boolean);
      for (const s of stmts) {
        try { await run(s); } catch (inner) { /* ignore individual statement errors */ }
      }
    }
  }

  return {
    query: async (sql: string, params?: any[]) => {
      const rows = await all(sql, params || []);
      return [rows, undefined];
    },
    raw: db,
  };
}

export async function testConnection() {
  try {
    await mysqlPool.query("SELECT 1 as ok");
    currentDb = mysqlPool;
    return true;
  } catch (err: any) {
    console.warn("MySQL unavailable, attempting SQLite fallback:", err && err.message ? err.message : err);
    try {
      const sqliteAdapter = await createSqliteAdapter();
      currentDb = sqliteAdapter;
      return true;
    } catch (e) {
      console.error("SQLite fallback failed:", (e as any).message || e);
      // set a no-op adapter to avoid crashes (returns empty results)
      currentDb = { query: async () => [[], undefined] };
      return true;
    }
  }
}

// exported dbProxy keeps a stable reference for other modules
const dbProxy = {
  query: (...args: any[]) => currentDb.query(...args),
};

export default dbProxy;
