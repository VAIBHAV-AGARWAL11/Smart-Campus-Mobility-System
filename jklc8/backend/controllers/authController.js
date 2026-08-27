// backend/controllers/authController.js
// Handles login and validation of user credentials against database records
// Bennett University Campus Transport Management System

const Employee = require('../models/Employee');

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'User ID and password are required.'
      });
    }

    // Find user by credentials
    const employee = await Employee.findByCredentials(username.trim(), password.trim());

    if (employee) {
      // Exclude password from session data
      const userSession = {
        employee_id: employee.employee_id,
        employee_name: employee.employee_name,
        department: employee.department,
        designation: employee.designation,
        role: employee.role,
        mobile: employee.mobile
      };

      return res.status(200).json({
        success: true,
        employee: userSession
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid User ID or Password.'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
};

exports.register = async (req, res) => {
  try {
    const { employee_id, employee_name, department, designation, role, password, mobile } = req.body;

    // Validate required fields
    if (!employee_id || !employee_name || !department || !designation || !role || !password || !mobile) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required.'
      });
    }

    // Validate mobile number (10 digits)
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number must be a valid 10-digit number.'
      });
    }

    // Role validation: Restrict administrative roles
    const restrictedRoles = ['HOD', 'TransportOffice', 'Transport Manager'];
    if (restrictedRoles.includes(role)) {
      return res.status(403).json({
        success: false,
        message: 'Registration for administrative roles is not permitted.'
      });
    }

    // Check if employee_id already exists
    const existingEmployee = await Employee.findById(employee_id);
    if (existingEmployee) {
      return res.status(409).json({
        success: false,
        message: 'An employee with this Employee ID already exists.'
      });
    }

    // Create the employee
    await Employee.create({
      employee_id: employee_id.trim(),
      employee_name: employee_name.trim(),
      department: department.trim(),
      designation: designation.trim(),
      role: role.trim(),
      password: password, // Note: The system currently uses plaintext passwords
      mobile: mobile.trim()
    });

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Your employee account has been created. You can now log in.'
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during registration.'
    });
  }
};
