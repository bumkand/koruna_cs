"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDb = initDb;
exports.getDb = getDb;
const sqlite3_1 = __importDefault(require("sqlite3"));
const sqlite_1 = require("sqlite");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
let db;
async function initDb() {
    const dataDir = path_1.default.resolve(__dirname, '..', 'data');
    if (!fs_1.default.existsSync(dataDir)) {
        fs_1.default.mkdirSync(dataDir, { recursive: true });
    }
    db = await (0, sqlite_1.open)({
        filename: path_1.default.join(dataDir, 'database.sqlite'),
        driver: sqlite3_1.default.Database
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
function getDb() {
    return db;
}
