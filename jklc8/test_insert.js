const Request = require('./backend/models/Request');
const db = require('./backend/db');

async function test() {
  try {
    const nextReq = await Request.getNextReqNo();
    console.log("Next Req No:", nextReq);
    
    // Simulate data from the frontend
    const requestData = {
      employee_id: 'EMP102',
      employee_name: 'Vaibhav Agarwal',
      department: 'IT',
      plant_location: 'Uchahar Plant',
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
      mobile_number: '8000689178',
      status: 'REQUEST SUBMITTED',
      return_journey_required: 1,
      cost: 360,
      remarks: 'TEST REMARK'
    };
    
    const reqNo = await Request.create(requestData);
    console.log("Inserted with Req No:", reqNo);
  } catch (err) {
    console.error("Insertion failed:", err);
  }
  process.exit();
}
test();
