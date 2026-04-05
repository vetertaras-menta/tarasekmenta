const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/users - get all users (protected)
router.get('/', authenticateToken, (req, res) => {
  const users = db.all(
    'SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC'
  );
  res.json(users);
});

module.exports = router;
