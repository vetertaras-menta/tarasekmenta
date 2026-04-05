const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database initialization
const db = new sqlite3.Database(path.resolve(__dirname, 'database.db'), (err) => {
    if (err) {
        console.error('Error opening database ' + err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Schema setup
db.serialize(() => {
    // Create users table
    db.run(`CREATE TABLE IF NOT EXISTS users ( 
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`);

    // Create courses table
    db.run(`CREATE TABLE IF NOT EXISTS courses ( 
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`);

    // Create enrollments table
    db.run(`CREATE TABLE IF NOT EXISTS enrollments ( 
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        course_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
    );`);

    // Default admin user seeding
    const adminUsername = 'admin';
    const adminPassword = 'admin123'; // Consider hashing this in a production environment
    const adminEmail = 'admin@example.com';

    db.run(`INSERT OR IGNORE INTO users (username, password, email) VALUES (?, ?, ?)`, [adminUsername, adminPassword, adminEmail], function(err) {
        if (err) {
            console.error('Error inserting admin user: ' + err.message);
        } else {
            console.log('Admin user seeded.');
        }
    });
});

module.exports = db;