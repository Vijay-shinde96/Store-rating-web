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

module.exports = router;