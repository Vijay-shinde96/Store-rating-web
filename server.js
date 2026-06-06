const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Import route files
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const ownerRoutes = require('./routes/ownerRoutes');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/admin', adminRoutes);
app.use('/user', userRoutes);
app.use('/owner', ownerRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.send('Store Rating Platform API is running...');
});