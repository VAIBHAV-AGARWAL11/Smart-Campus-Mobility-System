const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

async function migrate() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'Arnold@123',
      database: 'bennett_transport_portal'
    });

    const query = `
      CREATE TABLE IF NOT EXISTS request_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        REQNO VARCHAR(50) NOT NULL,
        action VARCHAR(50) NOT NULL,
        performed_by VARCHAR(50) NOT NULL,
        performed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        remarks TEXT,
        FOREIGN KEY (REQNO) REFERENCES vechreq(REQNO) ON DELETE CASCADE,
        FOREIGN KEY (performed_by) REFERENCES employees(employee_id) ON DELETE CASCADE
      )
    `;

    await connection.query(query);
    console.log("Successfully created request_history table");
    await connection.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

migrate();
