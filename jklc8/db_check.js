const db = require('./backend/db');
async function check() {
  try {
    const [rows] = await db.execute("DESCRIBE vechreq");
    console.log(rows.filter(r => r.Field === 'VRQ_CATG' || r.Field === 'VRQ_CATG_DESC'));
  } catch (e) {
    console.error(e);
  }
  process.exit();
}
check();
