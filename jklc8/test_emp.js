const db = require('./backend/db');
async function run() {
  const [rows] = await db.execute("SELECT * FROM employees");
  console.log("EMPLOYEES:", rows);
  process.exit();
}
run();
