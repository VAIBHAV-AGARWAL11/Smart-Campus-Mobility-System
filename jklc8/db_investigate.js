const db = require('./backend/db');

async function run() {
  try {
    const [describeRows] = await db.execute("DESCRIBE bennett_transport_portal.vechreq");
    console.log("SCHEMA:", JSON.stringify(describeRows.filter(r => r.Field === 'VRQ_CATG' || r.Field === 'REQNO' || r.Field === 'LOCATION'), null, 2));

    const [latestRows] = await db.execute("SELECT REQNO, LOCATION, VRQ_CATG, VRQ_CATG_DESC, REQTYP, DETAILS FROM bennett_transport_portal.vechreq ORDER BY REQNO DESC LIMIT 5");
    console.log("LATEST ROWS:", JSON.stringify(latestRows, null, 2));
  } catch (err) {
    console.error("DB Error:", err);
  }
  process.exit();
}
run();
