const mysql = require('mysql2/promise');

// Create a connection pool with hardcoded values
const pool = mysql.createPool({
  host: 'localhost',        // Database host
  user: 'root',             // Your MySQL username
  password: 'manager', // Your MySQL password
  database: 'store_rating', // Database name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
