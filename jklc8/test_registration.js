const Employee = require('./backend/models/Employee');
const db = require('./backend/db');

async function testRegistration() {
  try {
    const employeeData = {
      employee_id: 'FAC104',
      employee_name: 'Test Employee',
      department: 'SCSET',
      designation: 'Assistant Professor',
      role: 'Faculty',
      password: 'test password',
      mobile: '9876543210'
    };

    console.log("Checking if employee already exists...");
    const existing = await Employee.findById(employeeData.employee_id);
    if (existing) {
      console.log("Employee already exists. Skipping creation.");
    } else {
      console.log("Registering test employee...");
      await Employee.create(employeeData);
      console.log("Registration successful.");
    }

    console.log("\nVerifying directly in MySQL:");
    const [rows] = await db.execute("SELECT * FROM employees WHERE employee_id = ?", ['FAC104']);
    console.log(rows[0]);
    
  } catch (err) {
    console.error("Test failed:", err);
  } finally {
    process.exit();
  }
}
testRegistration();
