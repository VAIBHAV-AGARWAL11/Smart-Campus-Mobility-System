// backend/models/Employee.js
// Data access methods for the employees table

const db = require('../db');

class Employee {
  /**
   * Find an employee by employee_id
   * @param {string} employeeId 
   * @returns {Object|null}
   */
  static async findById(employeeId) {
    const cleanId = (employeeId || '').trim();
    let aliasId = cleanId;
    if (cleanId.toUpperCase() === 'TD301') aliasId = 'TO301';
    if (cleanId.toUpperCase() === 'TO301') aliasId = 'TD301';
    if (cleanId.toUpperCase() === 'EMP101') aliasId = 'FAC101';
    if (cleanId.toUpperCase() === 'EMP102') aliasId = 'FAC102';

    const [rows] = await db.execute(
      'SELECT * FROM employees WHERE LOWER(employee_id) = LOWER(?) OR LOWER(employee_id) = LOWER(?)',
      [cleanId, aliasId]
    );
    return rows[0] || null;
  }

  /**
   * Find an employee by employee_id and password
   * @param {string} employeeId 
   * @param {string} password 
   * @returns {Object|null}
   */
  static async findByCredentials(employeeId, password) {
    const cleanId = (employeeId || '').trim();
    const cleanPass = (password || '').trim();

    let aliasId = cleanId;
    if (cleanId.toUpperCase() === 'TD301') aliasId = 'TO301';
    if (cleanId.toUpperCase() === 'TO301') aliasId = 'TD301';
    if (cleanId.toUpperCase() === 'EMP101') aliasId = 'FAC101';
    if (cleanId.toUpperCase() === 'EMP102') aliasId = 'FAC102';

    const [rows] = await db.execute(
      'SELECT * FROM employees WHERE (LOWER(employee_id) = LOWER(?) OR LOWER(employee_id) = LOWER(?)) AND password = ?',
      [cleanId, aliasId, cleanPass]
    );
    return rows[0] || null;
  }

  /**
   * Find an employee by employee_id or employee_name
   * @param {string} identifier 
   * @returns {Object|null}
   */
  static async findByNameOrId(identifier) {
    const clean = (identifier || '').trim();
    if (!clean) return null;
    let aliasId = clean;
    if (clean.toUpperCase() === 'TD301') aliasId = 'TO301';
    if (clean.toUpperCase() === 'TO301') aliasId = 'TD301';
    if (clean.toUpperCase() === 'EMP101') aliasId = 'FAC101';
    if (clean.toUpperCase() === 'EMP102') aliasId = 'FAC102';

    const [rows] = await db.execute(
      'SELECT * FROM employees WHERE LOWER(employee_id) = LOWER(?) OR LOWER(employee_id) = LOWER(?) OR LOWER(employee_name) LIKE LOWER(?)',
      [clean, aliasId, `%${clean}%`]
    );
    return rows[0] || null;
  }

  /**
   * Create a new employee record
   * @param {Object} employeeData
   * @returns {Object} result
   */
  static async create(employeeData) {
    const { employee_id, employee_name, department, designation, role, password, mobile } = employeeData;
    const [result] = await db.execute(
      `INSERT INTO employees 
        (employee_id, employee_name, department, designation, role, password, mobile) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [employee_id, employee_name, department, designation, role, password, mobile]
    );
    return result;
  }
}

module.exports = Employee;
