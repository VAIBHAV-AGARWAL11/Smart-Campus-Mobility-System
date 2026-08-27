const Request = require('./models/Request');
const db = require('./db');

async function test() {
  try {
    const dataNDLS = {
      employee_id: 'FAC101',
      employee_name: 'Dr. Priya Sharma',
      department: 'SCSET',
      plant_location: null,
      journey_type: 'Official Visit',
      pickup_point: 'Bennett University',
      drop_point: 'New Delhi Railway Station',
      from_location: 'BENNETT UNIVERSITY',
      to_location: 'NEW DELHI RAILWAY STATION',
      purpose: 'Official Meeting',
      pickup_datetime: '2026-08-20 09:00:00',
      return_datetime: '2026-08-20 18:00:00',
      passengers: 1,
      vehicle_category: 'Sedan',
      mobile_number: '9876501234',
      remarks: 'None',
      status: 'TRIP COMPLETED',
      return_journey_required: 1,
      travelling_with_guest: 0,
      guest_name: '',
      guest_mobile: '',
      distance: 60,
      cost: 500,
      logs: [{ step: 'Requested', time: new Date().toISOString().replace('T', ' ').slice(0, 16) }],
      created_at: new Date(),
      category: 'Official Meeting',
      pickup_date: '2026-08-20',
      pickup_hour: 9,
      pickup_minute: 0,
      return_date: '2026-08-20',
      return_hour: 18,
      return_minute: 0
    };

    const dataIGI = { ...dataNDLS, to_location: 'IGI AIRPORT', drop_point: 'IGI Airport' };

    console.log('Inserting request data...');
    const reqNo1 = await Request.create(dataNDLS);
    const reqNo2 = await Request.create(dataIGI);
    console.log('Inserted successfully into vechreq!', reqNo1, reqNo2);
  } catch (error) {
    console.error('CRITICAL ERROR:', error);
  } finally {
    process.exit(0);
  }
}

test();
