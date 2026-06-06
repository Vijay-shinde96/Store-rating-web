const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const authMiddleware = require('../authMiddleware');
const router = express.Router();


// Signup
router.post('/signup', async (req, res) => {
  const { name, email, address, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  await pool.query(
    'INSERT INTO users (name, email, address, password, role) VALUES (?, ?, ?, ?, ?)',
    [name, email, address, hashedPassword, 'user']
  );
  res.json({ message: 'User registered successfully' });
});


// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  if (rows.length === 0) return res.status(400).json({ message: 'User not found' });

  const user = rows[0];
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ id: user.id, role: user.role }, 'secretkey', { expiresIn: '1h' });
  res.json({ token });
});


// Update password
router.put('/update-password', authMiddleware('user'), async (req, res) => {
  const { newPassword } = req.body;
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);
  res.json({ message: 'Password updated successfully' });
});


// View stores with ratings
router.get('/stores', authMiddleware('user'), async (req, res) => {
  const { name, address } = req.query;
  let query = `
    SELECT s.id, s.name, s.address, AVG(r.rating) AS overallRating,
           (SELECT rating FROM ratings WHERE store_id = s.id AND user_id = ?) AS userRating
    FROM stores s
    LEFT JOIN ratings r ON s.id = r.store_id
    WHERE 1=1
  `;
  let params = [req.user.id];

  if (name) { query += ' AND s.name LIKE ?'; params.push(`%${name}%`); }
  if (address) { query += ' AND s.address LIKE ?'; params.push(`%${address}%`); }

  query += ' GROUP BY s.id';
  const [rows] = await pool.query(query, params);
  res.json(rows);
});


// Submit or update rating
router.post('/rate', authMiddleware('user'), async (req, res) => {
    const { storeId, rating } = req.body;
  const [existing] = await pool.query(
    'SELECT * FROM ratings WHERE store_id = ? AND user_id = ?',
    [storeId, req.user.id]
  );

  if (existing.length > 0) {
    await pool.query(
      'UPDATE ratings SET rating = ? WHERE store_id = ? AND user_id = ?',
      [rating, storeId, req.user.id]
    );
    res.json({ message: 'Rating updated successfully' });
  } else {
    await pool.query(
      'INSERT INTO ratings (store_id, user_id, rating) VALUES (?, ?, ?)',
      [storeId, req.user.id, rating]
    );
    res.json({ message: 'Rating submitted successfully' });
  }
});

module.exports = router;