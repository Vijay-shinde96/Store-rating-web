const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');
const authMiddleware = require('../authMiddleware');
const router = express.Router();


// Update password
router.put('/update-password', authMiddleware('owner'), async (req, res) => {
  const { newPassword } = req.body;
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);
  res.json({ message: 'Password updated successfully' });
});

module.exports = router;