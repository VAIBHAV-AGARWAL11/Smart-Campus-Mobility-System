// backend/db.js
// Connection pool setup for MySQL database using mysql2/promise
// Bennett University Campus Transport Management System

const mysql = require('mysql2/promise');
require('dotenv').config();

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Arnold@123',
  database: process.env.DB_NAME || 'bennett_transport_portal',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
