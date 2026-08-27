const Request = require('./backend/models/Request');
const db = require('./backend/db');

async function test() {
  try {
    const nextReq = await Request.getNextReqNo();
    console.log("Next Req No:", nextReq);
    
    // Simulate data from the frontend
    const requestData = {
      employee_id: 'FAC101',
      employee_name: 'Dr. Priya Sharma',
      department: 'SCSET',
      plant_location: 'BENNETT UNIVERSITY',
      journey_type: 'Official Visit',
      pickup_point: 'GATE',
      drop_point: 'MAIN ROAD',
      from_location: 'BENNETT UNIVERSITY',
      to_location: 'IGI AIRPORT',
      purpose: 'DATABASE TEST REQUEST',
      pickup_datetime: '2026-08-15 10:00:00',
      return_datetime: '2026-08-16 10:00:00',
      passengers: 1,
      vehicle_category: 'Sedan',
      category: 'Official Tour Employees',
      mobile_number: '9876501234',
      status: 'REQUEST SUBMITTED',
      return_journey_required: 1,
      cost: 360,
      remarks: 'TEST REMARK'
    };
    
    const reqNo = await Request.create(requestData);
    console.log("Inserted with Req No:", reqNo);

    // Verify
    const [rows] = await db.execute("SELECT * FROM bennett_transport_portal.vechreq ORDER BY REQNO DESC LIMIT 1");
    console.log("Verified Row:", rows[0]);
    
  } catch (err) {
    console.error("Insertion failed:", err);
  }
  process.exit();
}
test();
