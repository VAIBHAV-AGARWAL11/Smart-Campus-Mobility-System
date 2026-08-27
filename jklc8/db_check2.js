const db = require('./backend/db');
async function check() {
  try {
    const [rows] = await db.execute("SHOW TRIGGERS LIKE 'vechreq'");
    console.log("Triggers:", rows);
  } catch (e) {
    console.error(e);
  }
  process.exit();
}
check();
