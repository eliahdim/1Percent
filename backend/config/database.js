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
      x INTEGER DEFAULT 0,
      y INTEGER DEFAULT 0,
      collapsed INTEGER DEFAULT 0,
      priority TEXT DEFAULT 'none',
      FOREIGN KEY (parent_id) REFERENCES goals(id) ON DELETE CASCADE
    )
  `);

  // Check if x and y columns exist (for existing databases)
  try {
    const columns = db.pragma('table_info(goals)');
    const hasX = columns.some(col => col.name === 'x');
    const hasY = columns.some(col => col.name === 'y');
    const hasCollapsed = columns.some(col => col.name === 'collapsed');
    const hasPriority = columns.some(col => col.name === 'priority');

    if (!hasX) {
      db.exec('ALTER TABLE goals ADD COLUMN x INTEGER DEFAULT 0');
    }
    if (!hasY) {
      db.exec('ALTER TABLE goals ADD COLUMN y INTEGER DEFAULT 0');
    }
    if (!hasCollapsed) {
      db.exec('ALTER TABLE goals ADD COLUMN collapsed INTEGER DEFAULT 0');
    }
    if (!hasPriority) {
      db.exec("ALTER TABLE goals ADD COLUMN priority TEXT DEFAULT 'none'");
    }
  } catch (error) {
    console.error('Error migrating database:', error);
  }

  // Create index for faster parent lookups
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_goals_parent_id ON goals(parent_id)
  `);
};

// Initialize the database on module load
initializeDatabase();

module.exports = db;
