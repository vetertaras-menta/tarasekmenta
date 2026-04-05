const { Database } = require('node-sqlite3-wasm');
const bcrypt = require('bcryptjs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'tarasekmenta.db');

let db;
try {
  db = new Database(DB_PATH);
} catch (err) {
  console.error('FATAL: Failed to open database:', err.message);
  process.exit(1);
}

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS enrollments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, course_id)
  );
`);

// Seed default admin user if not exists
const adminExists = db.get('SELECT id FROM users WHERE username = ?', ['admin']);
if (!adminExists) {
  const passwordHash = bcrypt.hashSync('admin123', 10);
  db.run(
    'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
    ['admin', 'admin@tarasekmenta.cz', passwordHash, 'admin']
  );
  console.log('Default admin user created (username: admin, password: admin123)');
}

// Seed sample courses if none exist
const courseCount = db.get('SELECT COUNT(*) as count FROM courses');
if (courseCount.count === 0) {
  db.run('INSERT INTO courses (name, description) VALUES (?, ?)', ['Matematika', 'Kurz matematiky pro základní školu']);
  db.run('INSERT INTO courses (name, description) VALUES (?, ?)', ['Čeština', 'Kurz českého jazyka a literatury']);
  db.run('INSERT INTO courses (name, description) VALUES (?, ?)', ['Angličtina', 'Kurz anglického jazyka pro začátečníky']);
  console.log('Sample courses created');
}

module.exports = db;
