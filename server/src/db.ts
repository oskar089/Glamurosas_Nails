import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const DATA_DIR = path.resolve(__dirname, "../data");
export const DB_PATH = path.join(DATA_DIR, "glamurosas.db");

export function openDatabase(): DatabaseSync {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const db = new DatabaseSync(DB_PATH);
  db.exec(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      service TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL
    )
  `);
  return db;
}

declare module "fastify" {
  interface FastifyInstance {
    db: DatabaseSync;
  }
}
