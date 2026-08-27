// backend/controllers/transportController.js
// Handles Transport Office vehicle & driver allocations and status updates
// Bennett University Campus Transport Management System

const Request = require('../models/Request');
const Allocation = require('../models/Allocation');
const VehicleDetail = require('../models/VehicleDetail');
const Employee = require('../models/Employee');
const db = require('../db');

// Format database row to frontend JSON structure
function formatRequest(row) {
  if (!row) return null;
  const currentYear = new Date().getFullYear();
  return {
    id: `${currentYear}${String(row.request_id).padStart(3, '0')}`,
    request_id: row.request_id,
    employee_id: row.employee_id,
    empId: row.employee_id,
    employee_name: row.employee_name,
    empName: row.employee_name,
    department: row.department,
    mobile: row.mobile_number,
    plantLocation: row.plant_location,
    journeyType: row.journey_type,
    purpose: row.purpose,
    pickupLoc: row.pickup_point,
    pickup_point: row.pickup_point,
    dropLoc: row.drop_point || '',
    drop_point: row.drop_point || '',
    fromLoc: row.from_location,
    from_location: row.from_location,
    toLoc: row.to_location,
    to_location: row.to_location,
    destination: `${row.from_location} to ${row.to_location}`,
    destLoc: `${row.from_location} to ${row.to_location}`,
    passengers: row.passengers,
    pickupTime: row.pickup_datetime,
    pickup_datetime: row.pickup_datetime,
    returnJourneyRequired: row.return_journey_required === 1,
    returnTime: row.return_datetime,
    return_datetime: row.return_datetime,
    travellingWithGuest: row.travelling_with_guest === 1,
    guestName: row.guest_name || '',
    guestMobile: row.guest_mobile || '',
    remarks: row.remarks || '',
    suggestedCategory: row.vehicle_category,
    vehicle_category: row.vehicle_category,
    distance: row.distance || 0,
    cost: Number(row.cost || 0),
    status: row.status,
    created_at: row.created_at,
    driverName: row.driver_name || '',
    vehicleNo: row.vehicle_number || '',
    logs: row.logs ? (typeof row.logs === 'string' ? JSON.parse(row.logs) : row.logs) : [],
    special_approval: row.special_approval,
    ded_emp_code: row.ded_emp_code,
    deduction_amount: row.deduction_amount,
    sms_sent: row.sms_sent,
    
    // New fields
    category: row.category,
    pickup_date: row.pickup_date,
    pickup_hour: row.pickup_hour,
    pickup_minute: row.pickup_minute,
    return_date: row.return_date,
    return_hour: row.return_hour,
    return_minute: row.return_minute
  };
}

exports.getPendingTransport = async (req, res) => {
  try {
    const rows = await Request.findAll();
    const transportRequests = rows.filter(r => r.status !== 'Draft').map(formatRequest);

    return res.status(200).json(transportRequests);
  } catch (error) {
    console.error('Error fetching pending transport requests:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.assignVehicle = async (req, res) => {
  try {
    const { request_id, vehicle_number, driver_name, assigned_by } = req.body;
    let requestId = request_id;
    if (typeof request_id === 'string') {
      if (request_id.startsWith('REQ-')) {
        const parts = request_id.split('-');
        requestId = parseInt(parts[parts.length - 1], 10);
      } else if (/^20\d{2}\d{3,}$/.test(request_id)) {
        requestId = parseInt(request_id.substring(4), 10);
      } else if (/^\d+$/.test(request_id)) {
        requestId = parseInt(request_id, 10);
      }
    }

    if (!requestId || !vehicle_number || !driver_name) {
      return res.status(400).json({
        success: false,
        message: 'request_id, vehicle_number, and driver_name are required.'
      });
    }

    // Map alias employee ID for FK safety
    let cleanAssignedBy = (assigned_by || 'TO301').trim();
    if (cleanAssignedBy.toUpperCase() === 'TD301') cleanAssignedBy = 'TO301';
    if (cleanAssignedBy.toUpperCase() === 'EMP101') cleanAssignedBy = 'FAC101';
    if (cleanAssignedBy.toUpperCase() === 'EMP102') cleanAssignedBy = 'FAC102';

    const assigningEmployee = await Employee.findById(cleanAssignedBy);
    if (!assigningEmployee) {
      cleanAssignedBy = 'TO301'; // Default Transport Manager
    }


    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    const logs = request.logs ? (typeof request.logs === 'string' ? JSON.parse(request.logs) : request.logs) : [];
    logs.push({
      step: 'Vehicle Allocated',
      time: new Date().toISOString().replace('T', ' ').slice(0, 16)
    });

    // Update vehicle request table
    await Request.updateAllocation(requestId, 'VEHICLE ASSIGNED', vehicle_number, driver_name, cleanAssignedBy, logs);

    // Audit Trail: Log TRANSPORT_ALLOCATED and VEHICLE_ASSIGNED
    const authEmpId = req.headers['x-employee-id'] || cleanAssignedBy;
    const actualReqNo = Request.getReqNo(requestId);
    
    // Log Allocation
    await db.execute(
      'INSERT INTO request_history (REQNO, action, performed_by, performed_at) VALUES (?, ?, ?, NOW())',
      [actualReqNo, 'TRANSPORT_ALLOCATED', authEmpId]
    );
    // Log Assignment (slight delay for visual ordering if needed, but same time is fine)
    await db.execute(
      'INSERT INTO request_history (REQNO, action, performed_by, performed_at) VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 1 SECOND))',
      [actualReqNo, 'VEHICLE_ASSIGNED', authEmpId]
    );

    // Save allocation details in vehicle_allocations table
    try {
      const allocationData = {
        request_id: requestId,
        vehicle_number,
        driver_name,
        assigned_by: cleanAssignedBy,
        assigned_at: new Date()
      };
      await Allocation.create(allocationData);
    } catch (allocErr) {
      console.warn('Could not insert vehicle allocation log:', allocErr);
    }

    // Update vehicle status in database
    try {
      await VehicleDetail.updateStatusByVehicleNo(vehicle_number, 'On Trip');
    } catch (vehErr) {
      console.warn('Could not update vehicle status in DB:', vehErr);
    }

    return res.status(200).json({
      success: true,
      message: 'Vehicle and driver assigned successfully.'
    });
  } catch (error) {
    console.error('Error assigning vehicle:', error);
    return res.status(500).json({ success: false, message: 'Failed to assign vehicle: ' + error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { request_id, status } = req.body;
    let requestId = request_id;
    if (typeof request_id === 'string') {
      if (request_id.startsWith('REQ-')) {
        const parts = request_id.split('-');
        requestId = parseInt(parts[parts.length - 1], 10);
      } else if (/^20\d{2}\d{3,}$/.test(request_id)) {
        requestId = parseInt(request_id.substring(4), 10);
      } else if (/^\d+$/.test(request_id)) {
        requestId = parseInt(request_id, 10);
      }
    }

    if (!requestId || !status) {
      return res.status(400).json({ success: false, message: 'request_id and status are required.' });
    }

    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    const logs = request.logs ? (typeof request.logs === 'string' ? JSON.parse(request.logs) : request.logs) : [];
    
    let stepName = 'Updated';
    if (status === 'TRIP COMPLETED') stepName = 'Trip Completed';

    logs.push({
      step: stepName,
      time: new Date().toISOString().replace('T', ' ').slice(0, 16)
    });

    await Request.updateStatus(requestId, status, logs);

    // If trip completed, mark vehicle as Available again
    if (status === 'TRIP COMPLETED' && request.vehicle_number) {
      await VehicleDetail.updateStatusByVehicleNo(request.vehicle_number, 'Available');
    }

    return res.status(200).json({
      success: true,
      message: `Status updated to ${status}.`
    });
  } catch (error) {
    console.error('Error updating request status:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

let hasResetMockStatus = false;

exports.getVehicles = async (req, res) => {
  try {
    if (!hasResetMockStatus) {
      // One-time startup reset for test environment to ensure all mock vehicles start fresh as Available
      await db.execute("UPDATE veh_details SET status = 'Available' WHERE vehicle_no IN ('RJ-24-CD-2468', 'RJ-38-CA-8556', 'DL-1C-AA-0007')");
      hasResetMockStatus = true;
      console.log('Reset test vehicles status to Available in database.');
    }

    const list = await VehicleDetail.findAll();
    
    // Fetch all vehicle numbers currently assigned to active trips
    const [activeTrips] = await db.execute("SELECT DISTINCT VEHNO FROM vechreq WHERE GATEFLG = 'ASSIGNED'");
    const activeVehicleNos = new Set(activeTrips.map(t => t.VEHNO ? t.VEHNO.trim().toUpperCase() : ''));

    // Synchronize vehicle status with active trips in the database
    for (const vehicle of list) {
      const vNo = vehicle.vehicle_no.trim().toUpperCase();
      const isOnTrip = activeVehicleNos.has(vNo);

      if (isOnTrip && vehicle.status !== 'On Trip') {
        vehicle.status = 'On Trip';
        await VehicleDetail.updateStatusByVehicleNo(vehicle.vehicle_no, 'On Trip');
      } else if (!isOnTrip && vehicle.status === 'On Trip') {
        vehicle.status = 'Available';
        await VehicleDetail.updateStatusByVehicleNo(vehicle.vehicle_no, 'Available');
      }
    }

    return res.status(200).json(list);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.registerVehicle = async (req, res) => {
  try {
    const { driver_name, vehicle_no, driver_mob_no, vehicle_category, model_name } = req.body;
    if (!driver_name || !vehicle_no || !driver_mob_no || !vehicle_category || !model_name) {
      return res.status(400).json({
        success: false,
        message: 'All fields (driver_name, vehicle_no, driver_mob_no, vehicle_category, model_name) are required.'
      });
    }

    const newVehicle = await VehicleDetail.create({
      driver_name,
      vehicle_no,
      driver_mob_no,
      vehicle_category,
      model_name,
      status: 'Available'
    });

    return res.status(201).json({
      success: true,
      message: 'Vehicle registered successfully.',
      vehicle: newVehicle
    });
  } catch (error) {
    console.error('Error registering vehicle:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Vehicle number already registered.' });
    }
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.updateVehicleStatus = async (req, res) => {
  try {
    const { vehicle_no, status } = req.body;
    if (!vehicle_no || !status) {
      return res.status(400).json({ success: false, message: 'vehicle_no and status are required.' });
    }
    const success = await VehicleDetail.updateStatusByVehicleNo(vehicle_no, status);
    return res.status(200).json({ success: true, message: `Vehicle status updated to ${status}.` });
  } catch (error) {
    console.error('Error updating vehicle status:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.deleteVehicle = async (req, res) => {
  try {
    const { vehicle_no } = req.body;
    if (!vehicle_no) {
      return res.status(400).json({ success: false, message: 'vehicle_no is required.' });
    }

    // Check if the vehicle is currently on an active trip (GATEFLG = 'ASSIGNED')
    const [activeTrips] = await db.execute(
      "SELECT DISTINCT VEHNO FROM vechreq WHERE GATEFLG = 'ASSIGNED' AND VEHNO = ?",
      [vehicle_no]
    );
    if (activeTrips.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete a vehicle that is currently assigned to an active trip.'
      });
    }

    const success = await VehicleDetail.deleteByVehicleNo(vehicle_no);
    if (success) {
      return res.status(200).json({ success: true, message: `Vehicle ${vehicle_no} deleted successfully.` });
    } else {
      return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    }
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// =========================================================
// DRIVER-SPECIFIC ENDPOINTS
// =========================================================

exports.getDriverTrips = async (req, res) => {
  try {
    const driverId = req.headers['x-employee-id'] || req.query.driver_id;
    if (!driverId) {
      return res.status(400).json({ success: false, message: 'Driver ID is required.' });
    }

    // Find all requests where the driver name matches
    const employee = await require('../models/Employee').findById(driverId);
    if (!employee || employee.role !== 'Driver') {
      return res.status(403).json({ success: false, message: 'Unauthorized. Driver role required.' });
    }

    const rows = await Request.findAll();
    const driverTrips = rows
      .filter(r => r.driver_name === employee.employee_name && r.status !== 'Draft')
      .map(formatRequest);

    // Also fetch trip logs for this driver
    const [tripLogs] = await db.execute(
      'SELECT * FROM trip_logs WHERE driver_id = ? ORDER BY created_at DESC',
      [driverId]
    );

    return res.status(200).json({ trips: driverTrips, tripLogs: tripLogs });
  } catch (error) {
    console.error('Error fetching driver trips:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.updateDriverTripStatus = async (req, res) => {
  try {
    const { request_id, trip_status, start_odometer, end_odometer, fuel_consumed, fuel_cost, remarks } = req.body;
    
    // BACKEND SECURITY: Read driver identity securely from headers
    const authDriverId = req.headers['x-employee-id'];
    
    if (!authDriverId) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Missing authentication.' });
    }

    if (!request_id || !trip_status) {
      return res.status(400).json({ success: false, message: 'request_id and trip_status are required.' });
    }

    let requestId = request_id;
    if (typeof request_id === 'string') {
      if (request_id.startsWith('REQ-')) {
        const parts = request_id.split('-');
        requestId = parseInt(parts[parts.length - 1], 10);
      } else if (/^20\d{2}\d{3,}$/.test(request_id)) {
        requestId = parseInt(request_id.substring(4), 10);
      } else if (/^\d+$/.test(request_id)) {
        requestId = parseInt(request_id, 10);
      }
    }

    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    // Verify driver identity matches assigned driver
    const driverEmployee = await require('../models/Employee').findById(authDriverId);
    if (!driverEmployee) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Invalid driver identity.' });
    }

    if (request.driver_name !== driverEmployee.employee_name && !['TransportOffice', 'Transport Manager'].includes(driverEmployee.role)) {
      return res.status(403).json({ success: false, message: 'Unauthorized: This trip is not assigned to you.' });
    }

    // Map driver trip status to system status
    let systemStatus = trip_status;
    if (trip_status === 'Accept Trip' || trip_status === 'Driver Assigned') {
      systemStatus = 'DRIVER_ASSIGNED';
    } else if (trip_status === 'Start Trip' || trip_status === 'Trip Started') {
      systemStatus = 'TRIP STARTED';
    } else if (trip_status === 'Complete Trip' || trip_status === 'Trip Completed') {
      systemStatus = 'TRIP COMPLETED';
    }

    await Request.updateStatus(requestId, systemStatus, []);

    // Update or create trip log
    const reqNo = Request.getReqNo(requestId);
    const [existingLog] = await db.execute(
      'SELECT * FROM trip_logs WHERE REQNO = ? AND driver_id = ?',
      [reqNo, authDriverId]
    );

    if (existingLog.length > 0) {
      let updateSql = 'UPDATE trip_logs SET trip_status = ?';
      const params = [trip_status];

      if (trip_status === 'Trip Started' || trip_status === 'Start Trip') {
        updateSql += ', started_at = NOW()';
        if (start_odometer) {
          updateSql += ', start_odometer = ?';
          params.push(start_odometer);
        }
      } else if (trip_status === 'Trip Completed' || trip_status === 'Complete Trip') {
        updateSql += ', completed_at = NOW()';
        if (end_odometer) {
          updateSql += ', end_odometer = ?';
          params.push(end_odometer);
        }
        if (fuel_consumed) {
          updateSql += ', fuel_consumed = ?';
          params.push(fuel_consumed);
        }
        if (fuel_cost) {
          updateSql += ', fuel_cost = ?';
          params.push(fuel_cost);
        }
      }

      if (remarks) {
        updateSql += ', remarks = ?';
        params.push(remarks);
      }

      updateSql += ' WHERE REQNO = ? AND driver_id = ?';
      params.push(reqNo, authDriverId);

      await db.execute(updateSql, params);
    } else {
      await db.execute(
        'INSERT INTO trip_logs (REQNO, driver_id, trip_status, start_odometer, started_at) VALUES (?, ?, ?, ?, NOW())',
        [reqNo, authDriverId, trip_status, start_odometer || null]
      );
    }

    // If trip completed, mark vehicle as Available again
    if ((trip_status === 'Trip Completed' || trip_status === 'Complete Trip') && request.vehicle_number) {
      await VehicleDetail.updateStatusByVehicleNo(request.vehicle_number, 'Available');
    }

    // Audit Trail: Log the action
    let action = '';
    if (systemStatus === 'TRIP STARTED') action = 'TRIP_STARTED';
    if (systemStatus === 'TRIP COMPLETED') action = 'TRIP_COMPLETED';
    if (action) {
      await db.execute(
        'INSERT INTO request_history (REQNO, action, performed_by, performed_at, remarks) VALUES (?, ?, ?, NOW(), ?)',
        [reqNo, action, authDriverId, remarks || null]
      );
    }

    return res.status(200).json({ success: true, message: `Trip status updated to ${trip_status}.` });
  } catch (error) {
    console.error('Error updating driver trip status:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.addFuelLog = async (req, res) => {
  try {
    const { request_id, driver_id, fuel_consumed, fuel_cost, remarks } = req.body;

    if (!request_id || !driver_id) {
      return res.status(400).json({ success: false, message: 'request_id and driver_id are required.' });
    }

    const reqNo = Request.getReqNo(request_id);

    await db.execute(
      'UPDATE trip_logs SET fuel_consumed = ?, fuel_cost = ?, remarks = ? WHERE REQNO = ? AND driver_id = ?',
      [fuel_consumed || null, fuel_cost || null, remarks || null, reqNo, driver_id]
    );

    return res.status(200).json({ success: true, message: 'Fuel log updated successfully.' });
  } catch (error) {
    console.error('Error adding fuel log:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};
