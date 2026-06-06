const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('./db');
const authMiddleware = require('./authMiddleware');
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