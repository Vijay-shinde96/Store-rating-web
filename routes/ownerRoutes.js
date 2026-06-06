const express = require('express');
const authMiddleware = require('../authMiddleware');
const router = express.Router();

// Owner routes
router.get('/dashboard', authMiddleware('owner'), (req, res) => {
  res.json({ message: 'Owner dashboard', owner: req.user });
});

router.get('/stores', authMiddleware('owner'), (req, res) => {
  res.json({ message: 'Owner stores', stores: [] });
});

module.exports = router;
