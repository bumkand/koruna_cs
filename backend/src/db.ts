import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import fs from 'fs';

let db: Database<sqlite3.Database, sqlite3.Statement>;

export async function initDb() {
  const dataDir = path.resolve(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  db = await open({
    filename: path.join(dataDir, 'database.sqlite'),
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS sequences (
      id TEXT PRIMARY KEY,
      next_number INTEGER
    );
    INSERT OR IGNORE INTO sequences (id, next_number) VALUES ('male', 1);
    INSERT OR IGNORE INTO sequences (id, next_number) VALUES ('female', 2);

    CREATE TABLE IF NOT EXISTS registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      address TEXT NOT NULL,
      phone TEXT NOT NULL,
      gender TEXT NOT NULL,
      birth_year INTEGER NOT NULL,
      email TEXT NOT NULL,
      bib_number INTEGER UNIQUE NOT NULL,
      terms_accepted INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export function getDb() {
  return db;
}
