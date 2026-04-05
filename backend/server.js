require('dotenv').config();

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const coursesRoutes = require('./routes/courses');
const usersRoutes = require('./routes/users');
const enrollmentsRoutes = require('./routes/enrollments');

// Validate required environment variables
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not set. Copy .env.example to .env and set a strong secret.');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Rate limiter for auth routes (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many requests, please try again later.' }
});

// General rate limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/courses', generalLimiter, coursesRoutes);
app.use('/api/users', generalLimiter, usersRoutes);
app.use('/api/enrollments', generalLimiter, enrollmentsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'tarasekmenta backend is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`tarasekmenta backend running on http://localhost:${PORT}`);
});

module.exports = app;
