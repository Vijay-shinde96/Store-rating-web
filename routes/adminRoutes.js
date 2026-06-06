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

// List stores with ratings
router.get('/stores', authMiddleware('admin'), async (req, res) => {
  const [rows] = await pool.query(`
    SELECT s.name, u.email, u.address, AVG(r.rating) AS avgRating
    FROM stores s
    JOIN users u ON s.owner_id = u.id
    LEFT JOIN ratings r ON s.id = r.store_id
    GROUP BY s.id
  `);
  res.json(rows);
});


// List users with filters
router.get('/users', authMiddleware('admin'), async (req, res) => {
  const { name, email, address, role } = req.query;
  let query = 'SELECT name, email, address, role FROM users WHERE 1=1';
  let params = [];

  if (name) { query += ' AND name LIKE ?'; params.push(`%${name}%`); }
  if (email) { query += ' AND email LIKE ?'; params.push(`%${email}%`); }
  if (address) { query += ' AND address LIKE ?'; params.push(`%${address}%`); }
  if (role) { query += ' AND role = ?'; params.push(role); }

  const [rows] = await pool.query(query, params);
  res.json(rows);
});

module.exports = router;
