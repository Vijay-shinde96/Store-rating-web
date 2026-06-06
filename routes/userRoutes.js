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

module.exports = router;