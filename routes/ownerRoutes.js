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


// Dashboard: view ratings for their store
router.get('/dashboard', authMiddleware('owner'), async (req, res) => {
  // Find store owned by this user
  const [store] = await pool.query('SELECT id, name FROM stores WHERE owner_id = ?', [req.user.id]);
  if (store.length === 0) return res.status(404).json({ message: 'No store found for this owner' });

  const storeId = store[0].id;

  // Get ratings and average
  const [ratings] = await pool.query(`
    SELECT u.name, u.email, r.rating
    FROM ratings r
    JOIN users u ON r.user_id = u.id
    WHERE r.store_id = ?
  `, [storeId]);

  const [avg] = await pool.query('SELECT AVG(rating) AS avgRating FROM ratings WHERE store_id = ?', [storeId]);

  res.json({
    storeName: store[0].name,
    averageRating: avg[0].avgRating || 'No ratings yet',
    ratings: ratings
  });
});

module.exports = router;