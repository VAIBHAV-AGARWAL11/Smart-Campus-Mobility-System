// backend/init_db.js
// Database initialization script for bennett_transport_portal

const path = require('path');
const fs = require('fs');

let mysql;
try {
  mysql = require('mysql2/promise');
} catch (e) {
  mysql = require(path.join(__dirname, 'node_modules/mysql2/promise'));
}

let dotenv;
try {
  dotenv = require('dotenv');
} catch (e) {
  dotenv = require(path.join(__dirname, 'node_modules/dotenv'));
}

dotenv.config({ path: path.join(__dirname, '.env') });

async function initializeDatabase() {
  try {
    console.log('Connecting to MySQL server on host:', process.env.DB_HOST || 'localhost');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'Arnold@123',
      multipleStatements: true
    });

    const sqlPath = path.join(__dirname, '../database/bennett_transport.sql');
    console.log('Reading SQL script from:', sqlPath);
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    console.log('Executing SQL to create and populate "bennett_transport" schema and "vechreq" table...');
    await connection.query(sqlContent);

    console.log('\n=======================================================');
    console.log(' SUCCESS: MySQL Schema "bennett_transport" & "vechreq" initialized!');
    console.log(' Form submission requests map to "vechreq" table.');
    console.log('=======================================================\n');
    
    await connection.end();
  } catch (error) {
    console.error('Error initializing database:', error.message);
  }
}

initializeDatabase();
