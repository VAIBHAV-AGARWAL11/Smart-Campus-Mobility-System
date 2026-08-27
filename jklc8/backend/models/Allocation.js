// backend/models/Allocation.js
// Data access methods for the vehicle_allocations table

const db = require('../db');
const Request = require('./Request');

class Allocation {
  /**
   * Create a new vehicle allocation log
   * @param {Object} data 
   * @returns {number} The insertId of the allocation
   */
  static async create(data) {
    const reqNo = Request.getReqNo(data.request_id || data.req_no);
    let assignedBy = (data.assigned_by || 'TO301').trim();
    if (assignedBy.toUpperCase() === 'TD301') assignedBy = 'TO301';
    if (assignedBy.toUpperCase() === 'EMP101') assignedBy = 'FAC101';
    if (assignedBy.toUpperCase() === 'EMP102') assignedBy = 'FAC102';

    const sql = `
      INSERT INTO vehicle_allocations (
        REQNO, vehicle_number, driver_name, assigned_by, assigned_at
      ) VALUES (?, ?, ?, ?, ?)
    `;
    const params = [
      reqNo,
      data.vehicle_number,
      data.driver_name,
      assignedBy,
      data.assigned_at || new Date()
    ];
    const [result] = await db.execute(sql, params);
    return result.insertId;
  }

  /**
   * Find allocation details by vehicle request ID (req_no)
   * @param {number|string} requestId 
   * @returns {Object|null}
   */
  static async findByRequestId(requestId) {
    const reqNo = Request.getReqNo(requestId);
    const [rows] = await db.execute('SELECT * FROM vehicle_allocations WHERE REQNO = ?', [reqNo]);
    return rows[0] || null;
  }
}

module.exports = Allocation;
