const db = require('./backend/db');
const Employee = require('./backend/models/Employee');

async function testLogin() {
  try {
    const employeeId = 'FAC104';
    const password = 'test password';
    
    console.log(`Testing login for ${employeeId}...`);
    const employee = await Employee.findByCredentials(employeeId, password);
    
    if (employee) {
      console.log("Login successful! Employee record:");
      console.log(employee);
    } else {
      console.log("Login failed: Invalid credentials.");
    }
  } catch (err) {
    console.error("Test failed:", err);
  } finally {
    process.exit();
  }
}

testLogin();
