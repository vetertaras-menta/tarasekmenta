const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/courses - get all courses
router.get('/', (req, res) => {
  const courses = db.all(
    'SELECT * FROM courses ORDER BY created_at DESC'
  );
  res.json(courses);
});

// GET /api/courses/:id - get course details with enrollment count
router.get('/:id', (req, res) => {
  const course = db.get('SELECT * FROM courses WHERE id = ?', [req.params.id]);
  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }

  const enrollmentCount = db.get(
    'SELECT COUNT(*) as count FROM enrollments WHERE course_id = ?',
    [req.params.id]
  );

  res.json({ ...course, enrollment_count: enrollmentCount.count });
});

// POST /api/courses - create new course (protected)
router.post('/', authenticateToken, (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Course name is required' });
  }

  const result = db.run(
    'INSERT INTO courses (name, description) VALUES (?, ?)',
    [name, description || null]
  );

  const newCourse = db.get('SELECT * FROM courses WHERE id = ?', [result.lastInsertRowid]);
  res.status(201).json(newCourse);
});

module.exports = router;
