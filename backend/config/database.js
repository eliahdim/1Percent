const Database = require('better-sqlite3');
const path = require('path');

// Create database in the backend folder
const dbPath = path.join(__dirname, '..', 'data', 'goals.db');

// Ensure the data directory exists
const fs = require('fs');
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize tables
const initializeDatabase = () => {
  // Create goals table
  db.exec(`
    CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      parent_id INTEGER,
      status TEXT DEFAULT 'Not Started',
      color TEXT DEFAULT '#var(--bg-secondary)',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (parent_id) REFERENCES goals(id) ON DELETE CASCADE
    )
  `);

  // Create index for faster parent lookups
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_goals_parent_id ON goals(parent_id)
  `);
};

// Initialize the database on module load
initializeDatabase();

module.exports = db;
