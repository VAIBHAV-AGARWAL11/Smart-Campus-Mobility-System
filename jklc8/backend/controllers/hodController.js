// backend/controllers/hodController.js
// Handles HOD action approvals and department requisition filters
// Bennett University Campus Transport Management System

const Request = require('../models/Request');
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

exports.getPendingHOD = async (req, res) => {
  try {
    const employeeId = req.headers['x-employee-id'] || req.query.employeeId || req.query.employee_id;

    if (!employeeId) {
      return res.status(400).json({ success: false, message: 'User ID is required.' });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee || employee.role !== 'HOD') {
      return res.status(403).json({ success: false, message: 'Unauthorized. HOD role required.' });
    }

    // HOD sees all requests but frontend filters by their department for action lists
    // We still return all non-draft requests so HOD dashboard analytics work correctly
    const rows = await Request.findAll();
    const departmentRequests = rows.filter(r => r.status !== 'Draft').map(formatRequest);

    return res.status(200).json(departmentRequests);
  } catch (error) {
    console.error('Error fetching pending HOD requests:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.approveRequest = async (req, res) => {
  try {
    const { request_id, hod_approved_by, remarks } = req.body;
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

    if (!requestId || !hod_approved_by) {
      return res.status(400).json({ success: false, message: 'request_id and HOD ID are required.' });
    }

    let cleanHODId = (hod_approved_by || 'HOD201').trim();
    if (cleanHODId.toUpperCase() === 'EMP101') cleanHODId = 'FAC101';
    if (cleanHODId.toUpperCase() === 'EMP102') cleanHODId = 'FAC102';

    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    const logs = request.logs ? (typeof request.logs === 'string' ? JSON.parse(request.logs) : request.logs) : [];
    logs.push({
      step: 'HOD Approved',
      time: new Date().toISOString().replace('T', ' ').slice(0, 16),
      remark: remarks || ''
    });

    await Request.updateHODApproval(requestId, 'HOD Approved', cleanHODId, logs);

    // Audit Trail: Log HOD_APPROVED
    const authEmpId = req.headers['x-employee-id'] || cleanHODId;
    const actualReqNo = Request.getReqNo(requestId);
    await db.execute(
      'INSERT INTO request_history (REQNO, action, performed_by, performed_at, remarks) VALUES (?, ?, ?, NOW(), ?)',
      [actualReqNo, 'HOD_APPROVED', authEmpId, remarks || null]
    );

    return res.status(200).json({
      success: true,
      message: 'Request approved by HOD.'
    });
  } catch (error) {
    console.error('Error approving request:', error);
    return res.status(500).json({ success: false, message: 'Internal server error: ' + error.message });
  }
};

exports.rejectRequest = async (req, res) => {
  try {
    const { request_id, hod_approved_by, remarks } = req.body;
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

    if (!requestId || !hod_approved_by) {
      return res.status(400).json({ success: false, message: 'request_id and HOD ID are required.' });
    }

    let cleanHODId = (hod_approved_by || 'HOD201').trim();
    if (cleanHODId.toUpperCase() === 'EMP101') cleanHODId = 'FAC101';
    if (cleanHODId.toUpperCase() === 'EMP102') cleanHODId = 'FAC102';

    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    const logs = request.logs ? (typeof request.logs === 'string' ? JSON.parse(request.logs) : request.logs) : [];
    logs.push({
      step: 'HOD Rejected',
      time: new Date().toISOString().replace('T', ' ').slice(0, 16),
      remark: remarks || ''
    });

    await Request.updateHODApproval(requestId, 'REJECTED', cleanHODId, logs);

    // Audit Trail: Log HOD_REJECTED
    const authEmpId = req.headers['x-employee-id'] || cleanHODId;
    const actualReqNo = Request.getReqNo(requestId);
    await db.execute(
      'INSERT INTO request_history (REQNO, action, performed_by, performed_at, remarks) VALUES (?, ?, ?, NOW(), ?)',
      [actualReqNo, 'HOD_REJECTED', authEmpId, remarks || null]
    );

    return res.status(200).json({
      success: true,
      message: 'Request rejected by HOD.'
    });
  } catch (error) {
    console.error('Error rejecting request:', error);
    return res.status(500).json({ success: false, message: 'Internal server error: ' + error.message });
  }
};
