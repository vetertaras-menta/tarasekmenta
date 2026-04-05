const express = require('express');
const router = express.Router();

// Mock data for users
const users = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' },
    { id: 3, name: 'Alice Johnson' }
];

// GET endpoint to list all users
router.get('/', (req, res) => {
    res.json(users);
});

module.exports = router;