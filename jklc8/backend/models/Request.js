// backend/models/Request.js
// Data access mapping layer for the VEHREQ database structure
// Bennett University Campus Transport Management System

const db = require('../db');

// Global Distance matrix & lookup for Bennett University / NCR region routes
function getDistance(from, to) {
  if (!from || !to) return 0;
  const f = from.trim().toUpperCase();
  const t = to.trim().toUpperCase();
  
  if (f === t) return 0;
  
  // Try exact lookup first (alphabetically ordered keys)
  const key = [f, t].sort().join("-");
  
  const lookup = {
    // Bennett University Campus routes
    "BENNETT UNIVERSITY-GREATER NOIDA": 8,
    "BENNETT UNIVERSITY-NOIDA": 25,
    "BENNETT UNIVERSITY-NOIDA SECTOR 62": 30,
    "BENNETT UNIVERSITY-KNOWLEDGE PARK": 5,
    "BENNETT UNIVERSITY-PARI CHOWK": 10,
    "BENNETT UNIVERSITY-DELHI": 55,
    "BENNETT UNIVERSITY-NEW DELHI RAILWAY STATION": 50,
    "BENNETT UNIVERSITY-IGI AIRPORT": 60,
    "BENNETT UNIVERSITY-GURGAON": 70,
    "BENNETT UNIVERSITY-FARIDABAD": 45,
    "BENNETT UNIVERSITY-GHAZIABAD": 50,
    "BENNETT UNIVERSITY-AGRA": 180,
    "BENNETT UNIVERSITY-MATHURA": 140,
    "BENNETT UNIVERSITY-ALIGARH": 100,
    "BENNETT UNIVERSITY-MEERUT": 80,
    "BENNETT UNIVERSITY-BULANDSHAHR": 55,
    "BENNETT UNIVERSITY-HAPUR": 65,
    "BENNETT UNIVERSITY-JEWAR AIRPORT": 15,
    "BENNETT UNIVERSITY-KASNA": 6,
    "BENNETT UNIVERSITY-ALPHA 1": 20,
    "BENNETT UNIVERSITY-GAUR CITY": 12,
    
    // Greater Noida routes
    "DELHI-GREATER NOIDA": 45,
    "GREATER NOIDA-NOIDA": 18,
    "GREATER NOIDA-NOIDA SECTOR 62": 22,
    "GREATER NOIDA-KNOWLEDGE PARK": 4,
    "GREATER NOIDA-PARI CHOWK": 6,
    "GREATER NOIDA-NEW DELHI RAILWAY STATION": 42,
    "GREATER NOIDA-IGI AIRPORT": 52,
    "GREATER NOIDA-GURGAON": 62,
    "GREATER NOIDA-FARIDABAD": 38,
    "GREATER NOIDA-GHAZIABAD": 42,
    "GREATER NOIDA-JEWAR AIRPORT": 20,
    "GREATER NOIDA-KASNA": 3,
    
    // Delhi routes
    "DELHI-NOIDA": 20,
    "DELHI-GURGAON": 30,
    "DELHI-FARIDABAD": 25,
    "DELHI-GHAZIABAD": 15,
    "DELHI-IGI AIRPORT": 15,
    "DELHI-NEW DELHI RAILWAY STATION": 5,
    "DELHI-AGRA": 210,
    "DELHI-MATHURA": 165,
    "DELHI-ALIGARH": 130,
    "DELHI-MEERUT": 70,
    
    // Noida routes
    "NOIDA-NOIDA SECTOR 62": 8,
    "FARIDABAD-NOIDA": 28,
    "GHAZIABAD-NOIDA": 22,
    "IGI AIRPORT-NOIDA": 35,
    "GURGAON-NOIDA": 42,
    "NOIDA-PARI CHOWK": 15,
    
    // Airport routes
    "IGI AIRPORT-GURGAON": 18,
    "IGI AIRPORT-FARIDABAD": 38,
    "IGI AIRPORT-GHAZIABAD": 35,
    "IGI AIRPORT-JEWAR AIRPORT": 75,
    
    // Other cross routes
    "AGRA-MATHURA": 55,
    "AGRA-ALIGARH": 85,
    "ALIGARH-MATHURA": 60,
    "FARIDABAD-GURGAON": 35,
    "GHAZIABAD-MEERUT": 55,
    "BULANDSHAHR-HAPUR": 40
  };

  if (lookup[key] !== undefined) {
    return lookup[key];
  }

  // Fallback coordinates for NCR region
  const coords = {
    "BENNETT UNIVERSITY": [28.45, 77.58],
    "GREATER NOIDA": [28.47, 77.50],
    "NOIDA": [28.57, 77.32],
    "NOIDA SECTOR 62": [28.62, 77.36],
    "KNOWLEDGE PARK": [28.46, 77.53],
    "PARI CHOWK": [28.47, 77.52],
    "DELHI": [28.70, 77.10],
    "NEW DELHI RAILWAY STATION": [28.64, 77.22],
    "IGI AIRPORT": [28.55, 77.10],
    "GURGAON": [28.46, 77.03],
    "FARIDABAD": [28.41, 77.31],
    "GHAZIABAD": [28.67, 77.42],
    "AGRA": [27.18, 78.02],
    "MATHURA": [27.49, 77.67],
    "ALIGARH": [27.88, 78.08],
    "MEERUT": [28.98, 77.71],
    "BULANDSHAHR": [28.41, 77.85],
    "HAPUR": [28.73, 77.78],
    "JEWAR AIRPORT": [28.31, 77.61],
    "KASNA": [28.44, 77.55],
    "ALPHA 1": [28.57, 77.39],
    "GAUR CITY": [28.47, 77.54]
  };

  const c1 = coords[f];
  const c2 = coords[t];

  if (c1 && c2) {
    const [lat1, lon1] = c1;
    const [lat2, lon2] = c2;
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const straightDist = R * c;
    const factor = 1.35; // NCR road factor
    return Math.round(straightDist * factor);
  }

  if (f === "OTHER" || t === "OTHER") return 50;
  return 30;
}

class Request {
  /**
   * Helper to format request ID / requisition number for database lookups
   * @param {string|number} id 
   * @returns {string}
   */
  static getReqNo(id) {
    if (!id) return id;
    const strId = String(id);
    
    // If it already looks like a REQNO (starts with year), return it directly
    if (/^20\d{2}\d+$/.test(strId)) {
      return strId;
    }
    
    if (/^\d{7,}$/.test(strId)) {
      return strId;
    }
    if (!isNaN(id)) {
      const currentYear = new Date().getFullYear();
      return `${currentYear}${String(id).padStart(3, '0')}`;
    }
    return strId;
  }

  /**
   * Get the next sequence value and generate the REQNO
   * @returns {string}
   */
  static async getNextReqNo() {
    const currentYear = new Date().getFullYear();
    const [rows] = await db.execute(
      "SELECT REQNO FROM vechreq WHERE REQNO LIKE ? ORDER BY REQNO DESC LIMIT 1",
      [`${currentYear}%`]
    );
    const latest = rows[0]?.REQNO;
    let nextSeq = 1;
    if (latest && latest.startsWith(currentYear.toString())) {
      const seqStr = latest.substring(4);
      const parsed = parseInt(seqStr, 10);
      if (!isNaN(parsed)) {
        nextSeq = parsed + 1;
      }
    }
    return `${currentYear}${nextSeq}`;
  }

  /**
   * Create a new vehicle request in the database mapped to VEHREQ columns
   * @param {Object} data 
   * @returns {string} The REQNO of the new record
   */
  static async create(data) {
    const reqNo = await Request.getNextReqNo();
    const sql = `
      INSERT INTO vechreq (
        LOCATION, REQLOCATION, REQNO, REQDT, REQTYP,
        FROMDEST, TODEST, FROMDATE, TODATE, PICKPOINT, DROPOINT,
        APPFLG, RECFLG, DETAILS, NOPER, REQBY, MOBNO, FORTHEEMP,
        VRQ_CATG, VRQ_CATG_DESC, COST_CENTER, FARE_AMOUNT, RETURNFLG,
        RECREM, GSTNM, GSTCONTMOBNO
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const fromDate = data.pickup_datetime ? new Date(data.pickup_datetime) : null;
    const toDate = data.return_datetime ? new Date(data.return_datetime) : null;

    const params = [
      (data.plant_location || '').substring(0, 100), // LOCATION
      (data.plant_location || '').substring(0, 100), // REQLOCATION
      reqNo,               // REQNO
      new Date(),          // REQDT
      (data.journey_type || '').substring(0, 50),   // REQTYP
      (data.from_location || '').substring(0, 100),  // FROMDEST
      (data.to_location || '').substring(0, 100),    // TODEST
      fromDate,            // FROMDATE
      toDate,              // TODATE
      (data.pickup_point || '').substring(0, 100),   // PICKPOINT
      data.drop_point ? String(data.drop_point).substring(0, 100) : null, // DROPOINT
      data.status === 'Draft' ? 'DRAFT' : 'PENDING', // APPFLG
      'PENDING',           // RECFLG
      (data.purpose || '').substring(0, 100),        // DETAILS
      data.passengers || 1, // NOPER
      data.employee_id,    // REQBY
      (data.mobile_number || '').substring(0, 13),  // MOBNO
      data.employee_id,    // FORTHEEMP (storing faculty ID)
      (data.vehicle_category || '').substring(0, 4), // VRQ_CATG
      (data.category || '').substring(0, 255),       // VRQ_CATG_DESC
      (data.cost_center || '100').substring(0, 20),  // COST_CENTER
      data.cost || 0.00,   // FARE_AMOUNT
      data.return_journey_required ? 1 : 0, // RETURNFLG
      (data.remarks || '').substring(0, 80), // RECREM
      (data.guest_name || '').substring(0, 45), // GSTNM
      (data.guest_mobile || '').substring(0, 13) // GSTCONTMOBNO
    ];

    await db.execute(sql, params);
    return reqNo;
  }

  /**
   * Helper to map database rows from VEHREQ columns for compatibility
   * @param {Object} row 
   * @returns {Object}
   */
  static mapRow(row) {
    if (!row) return row;

    // Parse REQNO to get numeric request_id (compat)
    let reqId = row.REQNO;
    if (row.REQNO && row.REQNO.length >= 7) {
      const parsed = parseInt(row.REQNO.substring(4), 10);
      if (!isNaN(parsed)) {
        reqId = parsed;
      }
    }

    // Workflow Status Mapping (Bennett University statuses)
    let status = 'Pending HOD Approval';
    if (row.APPFLG === 'DRAFT') {
      status = 'Draft';
    } else if (row.APPFLG === 'CANCELLED') {
      status = 'Cancelled';
    } else if (row.APPFLG === 'REJECTED') {
      status = 'HOD Rejected';
    } else if (row.GATEFLG === 'COMPLETED') {
      status = 'Trip Completed';
    } else if (row.GATEFLG === 'STARTED') {
      status = 'Trip Started';
    } else if (row.GATEFLG === 'DRIVER_ASSIGNED') {
      status = 'Driver Assigned';
    } else if (row.GATEFLG === 'ASSIGNED') {
      status = 'Vehicle Assigned';
    } else if (row.APPFLG === 'APPROVED') {
      status = 'HOD Approved';
    } else if (row.APPFLG === 'PENDING') {
      status = 'Pending HOD Approval';
    }

    // Parse times
    const fromDate = row.FROMDATE ? new Date(row.FROMDATE) : null;
    const toDate = row.TODATE ? new Date(row.TODATE) : null;

    let pickupDate = null;
    let pickupHour = null;
    let pickupMinute = null;
    if (fromDate) {
      pickupDate = fromDate.toISOString().split('T')[0];
      pickupHour = fromDate.getHours();
      pickupMinute = fromDate.getMinutes();
    }

    let returnDate = null;
    let returnHour = null;
    let returnMinute = null;
    if (toDate) {
      returnDate = toDate.toISOString().split('T')[0];
      returnHour = toDate.getHours();
      returnMinute = toDate.getMinutes();
    }

    // Reconstruct logs dynamically from history if provided, otherwise fallback gracefully
    const logs = [];
    if (row.history && row.history.length > 0) {
      // Use real database timestamps
      row.history.forEach(h => {
        let stepName = h.action;
        if (h.action === 'REQUEST_SUBMITTED') stepName = 'Request Submitted';
        else if (h.action === 'HOD_APPROVED') stepName = 'HOD Approved';
        else if (h.action === 'HOD_REJECTED') stepName = 'HOD Rejected';
        else if (h.action === 'TRANSPORT_ALLOCATED') stepName = 'Transport Allocated';
        else if (h.action === 'VEHICLE_ASSIGNED') stepName = 'Vehicle Assigned';
        else if (h.action === 'DRIVER_ASSIGNED') stepName = 'Driver Assigned';
        else if (h.action === 'TRIP_STARTED') stepName = 'Trip Started';
        else if (h.action === 'TRIP_COMPLETED') stepName = 'Trip Completed';
        
        logs.push({
          step: stepName,
          time: new Date(h.performed_at).toISOString().replace('T', ' ').slice(0, 16),
          remark: h.remarks || '',
          performed_by_name: h.employee_name || h.performed_by,
          performed_by_id: h.performed_by
        });
      });
    } else {
      // Legacy fallback logic without faking timestamps
      if (row.REQDT) {
        // We know REQDT is the real request date
        const timeStr = new Date(row.REQDT).toISOString().replace('T', ' ').slice(0, 10) + ' 00:00';
        logs.push({ step: 'Request Submitted', time: timeStr, legacy: true });
      }
      if (row.APPFLG === 'APPROVED') {
        logs.push({ step: 'HOD Approved', time: 'Not Available', remark: row.APPREM || '', legacy: true });
      } else if (row.APPFLG === 'REJECTED') {
        logs.push({ step: 'HOD Rejected', time: 'Not Available', remark: row.APPREM || '', legacy: true });
      } else if (row.APPFLG === 'CANCELLED') {
        logs.push({ step: 'Cancelled by Faculty', time: 'Not Available', legacy: true });
      }
      
      if (row.GATEFLG === 'ASSIGNED' || row.GATEFLG === 'DRIVER_ASSIGNED' || row.GATEFLG === 'STARTED' || row.GATEFLG === 'COMPLETED') {
        logs.push({ step: 'Vehicle Assigned', time: 'Not Available', legacy: true });
      }
      if (row.GATEFLG === 'DRIVER_ASSIGNED' || row.GATEFLG === 'STARTED' || row.GATEFLG === 'COMPLETED') {
        logs.push({ step: 'Driver Assigned', time: 'Not Available', legacy: true });
      }
      if (row.GATEFLG === 'STARTED' || row.GATEFLG === 'COMPLETED') {
        logs.push({ step: 'Trip Started', time: 'Not Available', legacy: true });
      }
      if (row.GATEFLG === 'COMPLETED') {
        logs.push({ step: 'Trip Completed', time: 'Not Available', legacy: true });
      }
    }

    const isReturn = row.RETURNFLG === 1 || row.RETURNFLG === '1' || row.RETURNFLG === true || row.RETURNFLG === 'Y' || row.RETURNFLG === 'true';

    return {
      request_id: reqId,
      id: row.REQNO,
      requisition_no: row.REQNO,
      employee_id: row.REQBY,
      employee_name: row.employee_name || row.FORTHEEMP,
      department: row.department || '',
      mobile_number: row.MOBNO,
      plant_location: row.LOCATION,
      journey_type: row.REQTYP,
      pickup_point: row.PICKPOINT,
      drop_point: row.DROPOINT || '',
      from_location: row.FROMDEST,
      to_location: row.TODEST,
      purpose: row.DETAILS,
      passengers: row.NOPER,
      pickup_datetime: fromDate,
      return_datetime: toDate,
      return_journey_required: isReturn ? 1 : 0,
      travelling_with_guest: row.GSTNM ? 1 : 0,
      guest_name: row.GSTNM || '',
      guest_mobile: row.GSTCONTMOBNO || '',
      remarks: row.RECREM || row.APPREM || '',
      vehicle_category: row.VRQ_CATG,
      category: row.VRQ_CATG_DESC,
      status: status,
      created_at: row.REQDT,
      driver_name: row.DRINAME || '',
      vehicle_number: row.VEHNO || '',
      logs: logs,
      special_approval: row.SPAPPFLG === 'Y' || row.SPAPP === 'Y' ? 'Y' : 'N',
      ded_emp_code: row.DEDEMPCD || '',
      deduction_amount: row.DEDAMT !== null && row.DEDAMT !== undefined ? Number(row.DEDAMT) : null,
      sms_sent: row.SMSFLG === 'Y' || row.SENDSMSFLG === 'Y' ? 'Yes' : 'No',

      pickup_date: pickupDate,
      pickup_hour: pickupHour,
      pickup_minute: pickupMinute,
      return_date: returnDate,
      return_hour: returnHour,
      return_minute: returnMinute,
      distance: isReturn ? getDistance(row.FROMDEST, row.TODEST) * 2 : getDistance(row.FROMDEST, row.TODEST),
      cost: row.FARE_AMOUNT !== null && row.FARE_AMOUNT !== undefined ? Number(row.FARE_AMOUNT) : 0
    };
  }

  static async fetchHistoryMap(reqNos) {
    if (!reqNos || reqNos.length === 0) return {};
    const placeholders = reqNos.map(() => '?').join(',');
    const [historyRows] = await db.execute(`
      SELECT h.*, e.employee_name 
      FROM request_history h
      LEFT JOIN employees e ON h.performed_by = e.employee_id
      WHERE h.REQNO IN (${placeholders})
      ORDER BY h.performed_at ASC
    `, reqNos);
    
    const historyMap = {};
    for (const h of historyRows) {
       if (!historyMap[h.REQNO]) historyMap[h.REQNO] = [];
       historyMap[h.REQNO].push(h);
    }
    return historyMap;
  }

  /**
   * Get all vehicle requests sorted by latest first
   * @returns {Array}
   */
  static async findAll() {
    const [rows] = await db.execute(`
      SELECT r.*, e.employee_name, e.department 
      FROM vechreq r 
      LEFT JOIN employees e ON r.REQBY = e.employee_id 
      ORDER BY r.REQNO DESC
    `);
    const historyMap = await Request.fetchHistoryMap(rows.map(r => r.REQNO));
    return rows.map(r => {
      r.history = historyMap[r.REQNO] || [];
      return Request.mapRow(r);
    });
  }

  /**
   * Get a request by its ID
   * @param {string|number} id 
   * @returns {Object|null}
   */
  static async findById(id) {
    const reqNo = Request.getReqNo(id);
    const [rows] = await db.execute(`
      SELECT r.*, e.employee_name, e.department 
      FROM vechreq r 
      LEFT JOIN employees e ON r.REQBY = e.employee_id 
      WHERE r.REQNO = ?
    `, [reqNo]);
    
    if (rows[0]) {
      const historyMap = await Request.fetchHistoryMap([reqNo]);
      rows[0].history = historyMap[reqNo] || [];
      return Request.mapRow(rows[0]);
    }
    return null;
  }

  /**
   * Get requests for a specific faculty member
   * @param {string} empId 
   * @returns {Array}
   */
  static async findByEmployeeId(empId) {
    const [rows] = await db.execute(`
      SELECT r.*, e.employee_name, e.department 
      FROM vechreq r 
      LEFT JOIN employees e ON r.REQBY = e.employee_id 
      WHERE r.REQBY = ? 
      ORDER BY r.REQNO DESC
    `, [empId]);
    const historyMap = await Request.fetchHistoryMap(rows.map(r => r.REQNO));
    return rows.map(r => {
      r.history = historyMap[r.REQNO] || [];
      return Request.mapRow(r);
    });
  }

  /**
   * Get requests for a specific department
   * @param {string} dept 
   * @returns {Array}
   */
  static async findByDepartment(dept) {
    const [rows] = await db.execute(`
      SELECT r.*, e.employee_name, e.department 
      FROM vechreq r 
      LEFT JOIN employees e ON r.REQBY = e.employee_id 
      WHERE e.department = ? 
      ORDER BY r.REQNO DESC
    `, [dept]);
    const historyMap = await Request.fetchHistoryMap(rows.map(r => r.REQNO));
    return rows.map(r => {
      r.history = historyMap[r.REQNO] || [];
      return Request.mapRow(r);
    });
  }

  /**
   * Get the next sequence value
   * @returns {number}
   */
  static async getNextId() {
    const [rows] = await db.execute("SELECT REQNO FROM vechreq ORDER BY REQNO DESC LIMIT 1");
    const latest = rows[0]?.REQNO;
    const currentYear = new Date().getFullYear();
    let nextSeq = 1;
    if (latest && latest.startsWith(currentYear.toString())) {
      const seqStr = latest.substring(4);
      const parsed = parseInt(seqStr, 10);
      if (!isNaN(parsed)) {
        nextSeq = parsed + 1;
      }
    }
    return nextSeq;
  }

  /**
   * Update the status of a request (such as complete status or cancel status)
   * @param {string|number} id 
   * @param {string} status 
   * @param {Array} logs 
   * @returns {boolean}
   */
  static async updateStatus(id, status, logs) {
    const reqNo = Request.getReqNo(id);
    let gateFlg = null;
    let appFlg = null;

    if (status === 'Trip Completed' || status === 'TRIP COMPLETED') {
      gateFlg = 'COMPLETED';
    } else if (status === 'Trip Started' || status === 'TRIP STARTED') {
      gateFlg = 'STARTED';
    } else if (status === 'Driver Assigned' || status === 'DRIVER_ASSIGNED') {
      gateFlg = 'DRIVER_ASSIGNED';
    } else if (status === 'Vehicle Assigned' || status === 'VEHICLE ASSIGNED') {
      gateFlg = 'ASSIGNED';
    } else if (status === 'HOD Rejected' || status === 'REJECTED') {
      appFlg = 'REJECTED';
    } else if (status === 'Cancelled' || status === 'CANCELLED') {
      appFlg = 'CANCELLED';
    }

    let sql = 'UPDATE vechreq SET ';
    const params = [];
    if (gateFlg) {
      sql += 'GATEFLG = ?';
      params.push(gateFlg);
    }
    if (appFlg) {
      if (params.length > 0) sql += ', ';
      sql += 'APPFLG = ?';
      params.push(appFlg);
    }

    if (params.length === 0) return true;

    sql += ' WHERE REQNO = ?';
    params.push(reqNo);

    const [result] = await db.execute(sql, params);
    return result.affectedRows > 0;
  }

  /**
   * Cancel a request (only if it is still pending HOD approval)
   * @param {string|number} id 
   * @returns {boolean}
   */
  static async cancelRequest(id) {
    const reqNo = Request.getReqNo(id);
    const [result] = await db.execute(
      "UPDATE vechreq SET APPFLG = 'CANCELLED' WHERE REQNO = ? AND APPFLG IN ('PENDING', 'DRAFT')",
      [reqNo]
    );
    return result.affectedRows > 0;
  }

  /**
   * Update HOD Approval details
   * @param {string|number} id 
   * @param {string} status 
   * @param {string} HODEmployeeId 
   * @param {Array} logs 
   * @returns {boolean}
   */
  static async updateHODApproval(id, status, HODEmployeeId, logs) {
    const reqNo = Request.getReqNo(id);
    const appFlg = (status === 'APPROVED BY HOD' || status === 'HOD APPROVED' || status === 'HOD Approved' || status === 'APPROVED') ? 'APPROVED' : 'REJECTED';

    let appRem = '';
    if (logs && logs.length > 0) {
      const latestLog = logs[logs.length - 1];
      if (latestLog && latestLog.remark) {
        appRem = String(latestLog.remark || '');
      }
    }

    const cleanHOD = String(HODEmployeeId || 'HOD201').trim().substring(0, 6);

    const [result] = await db.execute(
      'UPDATE vechreq SET APPFLG = ?, APPBY = ?, APPREM = ? WHERE REQNO = ?',
      [appFlg, cleanHOD, appRem.substring(0, 80), reqNo]
    );
    return result.affectedRows > 0;
  }

  /**
   * Update allocation details for vehicle and driver
   * @param {string|number} id 
   * @param {string} status 
   * @param {string} vehicleNo 
   * @param {string} driverName 
   * @param {string} assignedBy 
   * @param {Array} logs 
   * @returns {boolean}
   */
  static async updateAllocation(id, status, vehicleNo, driverName, assignedBy, logs) {
    const reqNo = Request.getReqNo(id);
    const driMobNo = '9876545432'; // default driver contact

    const [result] = await db.execute(
      'UPDATE vechreq SET VEHNO = ?, DRINAME = ?, DRIMOBNO = ?, GATEFLG = ? WHERE REQNO = ?',
      [
        (vehicleNo || '').substring(0, 20),
        (driverName || '').substring(0, 50),
        driMobNo,
        'ASSIGNED',
        reqNo
      ]
    );
    return result.affectedRows > 0;
  }

  /**
   * Find a draft request for a specific faculty member
   * @param {string} empId 
   * @returns {Object|null}
   */
  static async findDraftByEmployeeId(empId) {
    const [rows] = await db.execute(`
      SELECT r.*, e.employee_name, e.department 
      FROM vechreq r 
      LEFT JOIN employees e ON r.REQBY = e.employee_id 
      WHERE r.REQBY = ? AND r.APPFLG = 'DRAFT'
      LIMIT 1
    `, [empId]);
    return rows[0] ? Request.mapRow(rows[0]) : null;
  }

  /**
   * Update an existing draft request in the database
   * @param {string} reqNo 
   * @param {Object} data 
   * @returns {boolean}
   */
  static async update(reqNo, data) {
    const sql = `
      UPDATE vechreq SET
        LOCATION = ?, REQLOCATION = ?, REQDT = ?, REQTYP = ?,
        FROMDEST = ?, TODEST = ?, FROMDATE = ?, TODATE = ?,
        PICKPOINT = ?, DROPOINT = ?, APPFLG = ?, DETAILS = ?,
        NOPER = ?, MOBNO = ?, FORTHEEMP = ?, VRQ_CATG = ?,
        VRQ_CATG_DESC = ?, COST_CENTER = ?, FARE_AMOUNT = ?, RETURNFLG = ?,
        RECREM = ?, GSTNM = ?, GSTCONTMOBNO = ?
      WHERE REQNO = ?
    `;

    const fromDate = data.pickup_datetime ? new Date(data.pickup_datetime) : null;
    const toDate = data.return_datetime ? new Date(data.return_datetime) : null;

    const params = [
      data.plant_location, // LOCATION
      data.plant_location, // REQLOCATION
      new Date(),          // REQDT
      data.journey_type,   // REQTYP
      data.from_location,  // FROMDEST
      data.to_location,    // TODEST
      fromDate,            // FROMDATE
      toDate,              // TODATE
      data.pickup_point,   // PICKPOINT
      data.drop_point || null, // DROPOINT
      data.status === 'Draft' ? 'DRAFT' : 'PENDING', // APPFLG
      data.purpose,        // DETAILS
      data.passengers,     // NOPER
      data.mobile_number,  // MOBNO
      data.employee_id,    // FORTHEEMP
      (data.vehicle_category || '').substring(0, 4), // VRQ_CATG
      (data.category || '').substring(0, 255),       // VRQ_CATG_DESC
      data.cost_center || '100', // COST_CENTER
      data.cost || 0.00,   // FARE_AMOUNT
      data.return_journey_required ? 1 : 0, // RETURNFLG
      (data.remarks || '').substring(0, 80), // RECREM
      (data.guest_name || '').substring(0, 45), // GSTNM
      (data.guest_mobile || '').substring(0, 13), // GSTCONTMOBNO
      reqNo
    ];

    const [result] = await db.execute(sql, params);
    return result.affectedRows > 0;
  }

  /**
   * Find vehicle requests matching filters
   * @param {Object} filters 
   * @returns {Array}
   */
  static async findByFilters(filters) {
    let sql = `
      SELECT r.*, e.employee_name, e.department, a.assigned_by, a.assigned_at
      FROM vechreq r 
      LEFT JOIN employees e ON r.REQBY = e.employee_id 
      LEFT JOIN vehicle_allocations a ON r.REQNO = a.REQNO
      WHERE 1=1
    `;
    const params = [];

    if (filters.from_date) {
      sql += ' AND r.REQDT >= ?';
      params.push(filters.from_date + ' 00:00:00');
    }
    if (filters.to_date) {
      sql += ' AND r.REQDT <= ?';
      params.push(filters.to_date + ' 23:59:59');
    }
    if (filters.department) {
      sql += ' AND e.department LIKE ?';
      params.push(`%${filters.department}%`);
    }
    if (filters.journey_type) {
      sql += ' AND r.REQTYP = ?';
      params.push(filters.journey_type);
    }
    if (filters.vehicle_category) {
      sql += ' AND r.VRQ_CATG_DESC = ?';
      params.push(filters.vehicle_category);
    }
    if (filters.employee_id) {
      sql += ' AND r.REQBY = ?';
      params.push(filters.employee_id);
    }
    if (filters.status) {
      if (filters.status === 'Draft') {
        sql += " AND r.APPFLG = 'DRAFT'";
      } else if (filters.status === 'REJECTED' || filters.status === 'HOD Rejected') {
        sql += " AND r.APPFLG = 'REJECTED'";
      } else if (filters.status === 'Cancelled') {
        sql += " AND r.APPFLG = 'CANCELLED'";
      } else if (filters.status === 'TRIP COMPLETED' || filters.status === 'Trip Completed') {
        sql += " AND r.GATEFLG = 'COMPLETED'";
      } else if (filters.status === 'VEHICLE ASSIGNED' || filters.status === 'Vehicle Assigned') {
        sql += " AND r.GATEFLG = 'ASSIGNED'";
      } else if (filters.status === 'Driver Assigned') {
        sql += " AND r.GATEFLG = 'DRIVER_ASSIGNED'";
      } else if (filters.status === 'Trip Started') {
        sql += " AND r.GATEFLG = 'STARTED'";
      } else if (filters.status === 'HOD APPROVED' || filters.status === 'HOD Approved') {
        sql += " AND r.APPFLG = 'APPROVED' AND (r.GATEFLG IS NULL OR (r.GATEFLG != 'ASSIGNED' AND r.GATEFLG != 'DRIVER_ASSIGNED' AND r.GATEFLG != 'STARTED' AND r.GATEFLG != 'COMPLETED'))";
      } else if (filters.status === 'REQUEST SUBMITTED' || filters.status === 'Pending HOD Approval') {
        sql += " AND r.APPFLG = 'PENDING'";
      }
    }

    sql += ' ORDER BY r.REQNO DESC';

    const [rows] = await db.execute(sql, params);
    
    return rows.map(row => {
      const mapped = Request.mapRow(row);
      if (row.assigned_by) mapped.assigned_by = row.assigned_by;
      if (row.assigned_at) mapped.assigned_at = row.assigned_at;
      return mapped;
    });
  }
}

module.exports = Request;
