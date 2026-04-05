const express = require('express');
const router = express.Router();

// Sample data for courses
let courses = [];

// GET endpoint to fetch all courses
router.get('/', (req, res) => {
    res.status(200).json(courses);
});

// POST endpoint to add a new course
router.post('/', (req, res) => {
    const { title, description } = req.body;
    if (!title || !description) {
        return res.status(400).json({ message: 'Title and description are required.' });
    }
    const newCourse = { id: courses.length + 1, title, description };
    courses.push(newCourse);
    res.status(201).json(newCourse);
});

module.exports = router;