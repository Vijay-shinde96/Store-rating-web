const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');
const authMiddleware = require('../authMiddleware');
const router = express.Router();

module.exports = router;