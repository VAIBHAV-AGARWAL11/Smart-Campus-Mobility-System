const Request = require('./models/Request');
const Employee = require('./models/Employee');
const db = require('./db');

async function test() {
  try {
    const employee = await Employee.findById('FAC101');
    console.log('Found employee:', employee);

    const data = {
      employee_id: 'FAC101',
      plantLocation: 'Bennett University',
      journeyType: 'Official Visit',
      category: 'Research Visit',
      purpose: 'AI Conference & Research Presentation',
      pickupLoc: 'Academic Block B',
      dropLoc: 'Delhi IIT Gate',
      fromLoc: 'BENNETT UNIVERSITY',
      toLoc: 'DELHI',
      passengers: 2,
      pickup_date: '2026-08-20',
      pickup_hour: 9,
      pickup_minute: 0,
      returnJourneyRequired: true,
      return_date: '2026-08-20',
      return_hour: 18,
      return_minute: 0,
      travellingWithGuest: false,
      mobile: '9876501234',
      suggestedCategory: 'Sedan',
      distance: 55,
      cost: 440,
      status: 'REQUEST SUBMITTED'
    };

    const pickupDateStr = data.pickup_date;
    const pickupHourInt = data.pickup_hour;
    const pickupMinInt = data.pickup_minute;
    const pickup_datetime = `${pickupDateStr} ${String(pickupHourInt).padStart(2, '0')}:${String(pickupMinInt).padStart(2, '0')}:00`;

    const returnJourney = data.returnJourneyRequired;
    const returnDateStr = data.return_date;
    const returnHourInt = data.return_hour;
    const returnMinInt = data.return_minute;
    const return_datetime = `${returnDateStr} ${String(returnHourInt).padStart(2, '0')}:${String(returnMinInt).padStart(2, '0')}:00`;

    const requestData = {
      employee_id: data.employee_id || null,
      employee_name: employee ? employee.employee_name : 'Dr. Priya Sharma',
      department: employee ? employee.department : 'SCSET',
      plant_location: data.plantLocation || null,
      journey_type: data.journeyType || null,
      pickup_point: data.pickupLoc || null,
      drop_point: data.dropLoc || null,
      from_location: data.fromLoc || null,
      to_location: data.toLoc || null,
      purpose: data.purpose || null,
      pickup_datetime: pickup_datetime || null,
      return_datetime: return_datetime || null,
      passengers: data.passengers || 1,
      vehicle_category: data.suggestedCategory || null,
      mobile_number: data.mobile || null,
      remarks: 'Conference presentation luggage',
      status: data.status || 'REQUEST SUBMITTED',
      return_journey_required: returnJourney ? 1 : 0,
      travelling_with_guest: 0,
      guest_name: '',
      guest_mobile: '',
      distance: data.distance || 0,
      cost: data.cost || 0.00,
      logs: [{ step: 'Requested', time: new Date().toISOString().replace('T', ' ').slice(0, 16) }],
      created_at: new Date(),
      
      category: data.category || null,
      pickup_date: data.pickup_date || null,
      pickup_hour: data.pickup_hour,
      pickup_minute: data.pickup_minute,
      return_date: data.return_date || null,
      return_hour: data.return_hour,
      return_minute: data.return_minute
    };

    console.log('Inserting request data...');
    const reqNo = await Request.create(requestData);
    console.log('Inserted successfully into vechreq! REQNO:', reqNo);
  } catch (error) {
    console.error('CRITICAL ERROR:', error);
  } finally {
    process.exit(0);
  }
}

test();
