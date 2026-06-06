const express = require('express');
const authMiddleware = require('../authMiddleware');
const router = express.Router();

// User routes
router.get('/profile', authMiddleware('user'), (req, res) => {
  res.json({ message: 'User profile', user: req.user });
});

router.post('/ratings', authMiddleware('user'), (req, res) => {
  res.json({ message: 'Rating submitted', rating: req.body });
});

module.exports = router;
