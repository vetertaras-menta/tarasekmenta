const express = require('express');
const { SQLite3Error } = require('node-sqlite3-wasm');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/enrollments - get enrollments for the logged-in user
router.get('/', authenticateToken, (req, res) => {
  const enrollments = db.all(`
    SELECT e.id, e.enrolled_at,
           c.id as course_id, c.name as course_name, c.description as course_description
    FROM enrollments e
    JOIN courses c ON e.course_id = c.id
    WHERE e.user_id = ?
    ORDER BY e.enrolled_at DESC
  `, [req.user.id]);

  res.json(enrollments);
});

// POST /api/enrollments - enroll in a course
router.post('/', authenticateToken, (req, res) => {
  const { course_id } = req.body;

  if (!course_id) {
    return res.status(400).json({ error: 'course_id is required' });
  }

  const course = db.get('SELECT id FROM courses WHERE id = ?', [course_id]);
  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }

  try {
    const result = db.run(
      'INSERT INTO enrollments (user_id, course_id) VALUES (?, ?)',
      [req.user.id, course_id]
    );

    res.status(201).json({ id: result.lastInsertRowid, user_id: req.user.id, course_id });
  } catch (err) {
    if (err instanceof SQLite3Error && err.message.startsWith('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'Already enrolled in this course' });
    }
    throw err;
  }
});

module.exports = router;
