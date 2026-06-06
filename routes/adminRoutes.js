const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');
const authMiddleware = require('../authMiddleware');
const router = express.Router();


// Add new user (admin or normal)
router.post('/users', authMiddleware('admin'), async (req, res) => {
  const { name, email, password, address, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  await pool.query(
    'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
    [name, email, hashedPassword, address, role]
  );
  res.json({ message: 'User created successfully' });
});

// Dashboard stats
router.get('/dashboard', authMiddleware('admin'), async (req, res) => {
  const [users] = await pool.query('SELECT COUNT(*) AS totalUsers FROM users');
  const [stores] = await pool.query('SELECT COUNT(*) AS totalStores FROM stores');
  const [ratings] = await pool.query('SELECT COUNT(*) AS totalRatings FROM ratings');
  res.json({
    totalUsers: users[0].totalUsers,
    totalStores: stores[0].totalStores,
    totalRatings: ratings[0].totalRatings
  });
});

module.exports = router;
