// Bennett University - Campus Transport Management System State & Logic

// Database Table 1: Users Table (Mock representation)
let employeesTable = [
  {
    employee_id: "FAC101",
    employee_name: "Dr. Priya Sharma",
    department: "SCSET",
    designation: "Associate Professor",
    role: "Faculty",
    password: "fac123",
    mobile: "9876501234"
  },
  {
    employee_id: "FAC102",
    employee_name: "Dr. Amit Verma",
    department: "School of Management",
    designation: "Assistant Professor",
    role: "Faculty",
    password: "fac456",
    mobile: "9876502345"
  },
  {
    employee_id: "FAC103",
    employee_name: "Prof. Neha Gupta",
    department: "School of Law",
    designation: "Professor",
    role: "Faculty",
    password: "fac789",
    mobile: "9876503456"
  },
  {
    employee_id: "HOD201",
    employee_name: "Prof. Deepak Garg",
    department: "SCSET",
    designation: "Dean & HOD - SCSET",
    role: "HOD",
    password: "hod123",
    mobile: "9876543210"
  },
  {
    employee_id: "HOD202",
    employee_name: "Prof. Sunita Jain",
    department: "School of Management",
    designation: "HOD - School of Management",
    role: "HOD",
    password: "hod456",
    mobile: "9876543211"
  },
  {
    employee_id: "TO301",
    employee_name: "Suresh Yadav",
    department: "Transport Office",
    designation: "Transport Manager",
    role: "TransportOffice",
    password: "transport123",
    mobile: "9876544321"
  },
  {
    employee_id: "DRV401",
    employee_name: "Rajendra Kumar",
    department: "Transport Office",
    designation: "Senior Driver",
    role: "Driver",
    password: "drv123",
    mobile: "9876545432"
  },
  // Legacy alias support
  {
    employee_id: "EMP101",
    employee_name: "Dr. Priya Sharma",
    department: "SCSET",
    designation: "Associate Professor",
    role: "Faculty",
    password: "emp123",
    mobile: "9876501234"
  },
  {
    employee_id: "EMP102",
    employee_name: "Dr. Amit Verma",
    department: "School of Management",
    designation: "Assistant Professor",
    role: "Faculty",
    password: "emp456",
    mobile: "9876502345"
  },
  {
    employee_id: "TD301",
    employee_name: "Suresh Yadav",
    department: "Transport Office",
    designation: "Transport Manager",
    role: "TransportOffice",
    password: "transport123",
    mobile: "9876544321"
  }
];

// Database Table 2: Vehicle Requests Table
let requisitions = [];

// Database Table 3: Vehicle Allocation Table
let vehicleAllocations = [];

// Initial Fleet Data (Bennett University NCR Region Vehicles)
let fleet = [
  { id: "V01", vehicleNo: "UP-14-BU-1001", modelName: "Toyota Etios", category: "Sedan", driverName: "Rajendra Kumar", status: "Available", rate: 8 },
  { id: "V02", vehicleNo: "UP-14-BU-1002", modelName: "Toyota Innova Crysta", category: "SUV", driverName: "Mohan Singh", status: "Available", rate: 10 },
  { id: "V03", vehicleNo: "DL-4C-BU-2001", modelName: "Honda City", category: "Premium Sedan", driverName: "Sunil Chauhan", status: "Available", rate: 10 },
  { id: "V04", vehicleNo: "UP-14-BU-1003", modelName: "Force Traveller 26 Seater", category: "Bus", driverName: "Rajendra Kumar", status: "Available", rate: 15 },
  { id: "V05", vehicleNo: "UP-14-BU-1004", modelName: "Mahindra XUV700", category: "SUV", driverName: "Mohan Singh", status: "Available", rate: 10 },
  { id: "V06", vehicleNo: "DL-4C-BU-2002", modelName: "Maruti Suzuki Swift", category: "Hatchback", driverName: "Sunil Chauhan", status: "Available", rate: 8 }
];

// Systems Notifications Center
let notifications = [];

// Chart Instances Global
let charts = {};

// Driver Details Directory
const DRIVER_DETAILS = {
  "Rajendra Kumar": { phone: "+91 98765 45432", license: "Heavy Commercial", rating: "4.8 ★" },
  "Mohan Singh": { phone: "+91 98765 46543", license: "Heavy Commercial", rating: "4.6 ★" },
  "Sunil Chauhan": { phone: "+91 98765 47654", license: "Light Commercial", rating: "4.7 ★" }
};

// Global Distance matrix & lookup for Bennett University / NCR region routes
function getDistance(from, to) {
  if (!from || !to) return 0;
  const f = from.trim().toUpperCase();
  const t = to.trim().toUpperCase();

  if (f === t) return 0;

  const key = [f, t].sort().join("-");

  const lookup = {
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
    "BENNETT UNIVERSITY-JEWAR AIRPORT": 15,
    "BENNETT UNIVERSITY-KASNA": 6,
    "BENNETT UNIVERSITY-GAUR CITY": 12,
    "DELHI-GREATER NOIDA": 45,
    "GREATER NOIDA-NOIDA": 18,
    "GREATER NOIDA-KNOWLEDGE PARK": 4,
    "GREATER NOIDA-PARI CHOWK": 6,
    "GREATER NOIDA-IGI AIRPORT": 52,
    "DELHI-NOIDA": 20,
    "DELHI-GURGAON": 30,
    "DELHI-IGI AIRPORT": 15,
    "DELHI-NEW DELHI RAILWAY STATION": 5
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
    "JEWAR AIRPORT": [28.31, 77.61],
    "KASNA": [28.44, 77.55],
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
    const factor = 1.3;
    return Math.round(straightDist * factor);
  }

  if (f === "OTHER" || t === "OTHER") return 50;
  return 30;
}

// Simulated SMS dispatch notifications helper
function sendSMSNotification(req, driverName, vehicleNo, modelName) {
  const driverInfo = DRIVER_DETAILS[driverName] || { phone: "+91 98765 45432", license: "Commercial", rating: "4.7 ★" };

  const timeFormatted = new Date(req.pickupTime).toLocaleString("en-IN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  const smsMessage = `BENNETT UNIVERSITY TRANSPORT ALERT: Requisition ${req.id} confirmed.\n\nVehicle: ${modelName} (${vehicleNo})\nDriver: ${driverName}\nMobile: ${driverInfo.phone}\nPickup: ${req.pickupLoc}\nTime: ${timeFormatted}\nDest: ${req.destLoc}\n\nHave a safe journey!`;

  const container = document.getElementById("toast-notification-holder");
  if (!container) return;

  const smsToast = document.createElement("div");
  smsToast.className = "toast-message sms-notification-mock glass-card";
  smsToast.style.cssText = "border-left: 4px solid var(--secondary-color); background: rgba(15, 23, 42, 0.95); color: #ffffff; width: 340px; padding: 16px; border-radius: 12px; margin-bottom: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); font-family: sans-serif;";

  smsToast.innerHTML = `
    <div class="sms-header" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; font-size: 11px; opacity: 0.8; text-transform: uppercase; letter-spacing: 1px;">
      <span><i class="fa-solid fa-comment-sms" style="color: var(--secondary-color); margin-right: 6px;"></i> SMS GATEWAY SIMULATION</span>
      <span>JUST NOW</span>
    </div>
    <div class="sms-body" style="background: rgba(255, 255, 255, 0.06); border-radius: 8px; padding: 12px; font-size: 12.5px; line-height: 1.5; border-left: 3px solid var(--secondary-color); font-family: monospace; white-space: pre-wrap; color: #f1f5f9;">${smsMessage}</div>
    <div class="sms-footer" style="display: flex; justify-content: space-between; align-items: center; font-size: 10px; opacity: 0.6; margin-top: 8px;">
      <span>Delivered via Bennett Campus Transport Service</span>
      <button class="sms-close-btn" style="background: transparent; border: none; color: #ffffff; cursor: pointer; font-weight: bold; font-size: 11px;" onclick="this.closest('.sms-notification-mock').remove()">Dismiss</button>
    </div>
  `;

  container.appendChild(smsToast);

  setTimeout(() => {
    if (smsToast && smsToast.parentNode) {
      smsToast.remove();
    }
  }, 10000);
}


// ====================================================
// AUTHENTICATION MODULE STATE & LOGIC
// ====================================================
const AUTH_KEY = "bennett_auth_session";
const API_BASE = (window.location.protocol.startsWith('http') && window.location.port !== '3000')
  ? `${window.location.protocol}//${window.location.hostname}:3000`
  : (window.location.protocol === 'file:' ? 'http://localhost:3000' : '');

function isSameDepartment(dept1, dept2) {
  if (!dept1 || !dept2) return false;
  const d1 = String(dept1).trim().toLowerCase();
  const d2 = String(dept2).trim().toLowerCase();
  if (d1 === d2) return true;

  if (d1.includes(d2) || d2.includes(d1)) return true;

  const groups = [
    ['scset', 'computer science', 'cse', 'cs'],
    ['school of management', 'management', 'som', 'dept of management'],
    ['school of law', 'law', 'sol', 'dept of law'],
    ['school of media', 'media', 'somc', 'journalism'],
    ['school of liberal arts', 'liberal arts', 'sola', 'humanities']
  ];

  for (const group of groups) {
    const m1 = group.some(alias => d1.includes(alias));
    const m2 = group.some(alias => d2.includes(alias));
    if (m1 && m2) return true;
  }

  return false;
}

function initDatabase() {
  if (!localStorage.getItem("bennett_fleet")) {
    localStorage.setItem("bennett_fleet", JSON.stringify(fleet));
  } else {
    fleet = JSON.parse(localStorage.getItem("bennett_fleet"));
  }
  requisitions = [];
  vehicleAllocations = [];
}

function saveDatabase() {
  localStorage.setItem("bennett_fleet", JSON.stringify(fleet));
}

function fetchRequisitionsAndInit() {
  const session = localStorage.getItem(AUTH_KEY);
  if (!session) return;
  const user = JSON.parse(session);

  let url = '/myrequests';
  if (user.role === 'HOD') {
    url = '/pending-hod';
  } else if (user.role === 'TransportOffice' || user.role === 'TransportDesk') {
    url = '/transport/pending';
  } else if (user.role === 'Driver') {
    url = '/driver/trips';
  }

  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timeoutId = controller ? setTimeout(() => controller.abort(), 2000) : null;

  fetch(API_BASE + url, {
    headers: {
      'x-employee-id': user.employee_id
    },
    ...(controller ? { signal: controller.signal } : {})
  })
    .then(res => {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(data => {
      if (timeoutId) clearTimeout(timeoutId);
      if (Array.isArray(data)) {
        requisitions = data;
      } else if (data && Array.isArray(data.trips)) {
        requisitions = data.trips;
      }
      updateNextRequisitionNumber();
      loadVehicles(); // Sync fleet with DB
      initDashboard();
    })
    .catch(err => {
      if (timeoutId) clearTimeout(timeoutId);
      console.warn('Could not sync with server, loading dashboard with local state:', err);
      updateNextRequisitionNumber();
      loadVehicles();
      initDashboard();
    });
}

function initAuth() {
  const session = localStorage.getItem(AUTH_KEY);

  if (session) {
    try {
      const user = JSON.parse(session);
      document.body.classList.add("authenticated");

      const loginWrapper = document.getElementById("login-wrapper");
      if (loginWrapper) {
        loginWrapper.style.setProperty("display", "none", "important");
      }

      const appContainer = document.querySelector(".app-container");
      if (appContainer) {
        appContainer.style.setProperty("display", "flex", "important");
      }

      updateLoggedUserUI(user);
      fetchRequisitionsAndInit();
    } catch (e) {
      localStorage.removeItem(AUTH_KEY);
      showLoginPage();
    }
  } else {
    showLoginPage();
  }
}

function showLoginPage(event) {
  if (event) event.preventDefault();
  document.body.classList.remove("authenticated");

  const loginWrapper = document.getElementById("login-wrapper");
  if (loginWrapper) {
    loginWrapper.style.setProperty("display", "flex", "important");
  }

  const registerWrapper = document.getElementById("register-wrapper");
  if (registerWrapper) {
    registerWrapper.style.setProperty("display", "none", "important");
  }

  const appContainer = document.querySelector(".app-container");
  if (appContainer) {
    appContainer.style.setProperty("display", "none", "important");
  }
}

function showRegisterPage(event) {
  if (event) event.preventDefault();
  document.body.classList.remove("authenticated");

  const loginWrapper = document.getElementById("login-wrapper");
  if (loginWrapper) {
    loginWrapper.style.setProperty("display", "none", "important");
  }

  const registerWrapper = document.getElementById("register-wrapper");
  if (registerWrapper) {
    registerWrapper.style.setProperty("display", "flex", "important");
  }

  const appContainer = document.querySelector(".app-container");
  if (appContainer) {
    appContainer.style.setProperty("display", "none", "important");
  }
}

function handleRegisterSubmit(event) {
  try {
    if (event) event.preventDefault();
    
    const employeeId = document.getElementById("reg-employee-id").value.trim();
    const employeeName = document.getElementById("reg-employee-name").value.trim();
    const department = document.getElementById("reg-department").value.trim();
    const designation = document.getElementById("reg-designation").value.trim();
    const role = document.getElementById("reg-role").value;
    const password = document.getElementById("reg-password").value;
    const mobile = document.getElementById("reg-mobile").value.trim();
    
    const errorMsg = document.getElementById("register-error-msg");
    const submitBtn = document.getElementById("register-btn-main");

    if (errorMsg) errorMsg.style.display = "none";

    // Basic frontend validation
    if (!employeeId || !employeeName || !department || !designation || !role || !password || !mobile) {
      errorMsg.innerText = "All fields are required.";
      errorMsg.style.display = "flex";
      return;
    }

    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(mobile)) {
      errorMsg.innerText = "Mobile number must be a valid 10-digit number.";
      errorMsg.style.display = "flex";
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Registering...';
    }

    fetch(API_BASE + '/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        employee_id: employeeId, 
        employee_name: employeeName, 
        department: department, 
        designation: designation, 
        role: role, 
        password: password, 
        mobile: mobile 
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showToast("toast-success", data.message || "Registration successful!");
        document.getElementById("register-form").reset();
        showLoginPage();
      } else {
        if (errorMsg) {
          errorMsg.innerText = data.message || 'Registration failed.';
          errorMsg.style.display = 'flex';
        }
      }
    })
    .catch(err => {
      console.error('Registration failed:', err);
      if (errorMsg) {
        errorMsg.innerText = 'Server error. Please try again later.';
        errorMsg.style.display = 'flex';
      }
    })
    .finally(() => {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-user-plus"></i> Register';
      }
    });

  } catch (e) {
    alert("Error in handleRegisterSubmit: " + e.message + "\n" + e.stack);
  }
}

function handleLoginSubmit(event) {
  try {
    if (event) event.preventDefault();
    const usernameInput = document.getElementById("login-username");
    const passwordInput = document.getElementById("login-password");
    const errorMsg = document.getElementById("login-error-msg");

    const username = usernameInput ? usernameInput.value.trim() : "";
    const password = passwordInput ? passwordInput.value.trim() : "";

    if (errorMsg) errorMsg.style.display = "none";

    if (!username || !password) {
      if (errorMsg) {
        errorMsg.innerText = !username ? "Please enter your User ID." : "Please enter your password.";
        errorMsg.style.display = "flex";
      }
      return;
    }

    performLogin(username, password);
  } catch (e) {
    alert("Error in handleLoginSubmit: " + e.message + "\n" + e.stack);
  }
}

function completeLoginSuccess(sessionData) {
  try {
    localStorage.setItem(AUTH_KEY, JSON.stringify(sessionData));
  } catch (e) {
    console.warn("Could not save session to localStorage:", e);
  }
  document.body.classList.add("authenticated");

  const loginWrapper = document.getElementById("login-wrapper");
  if (loginWrapper) {
    loginWrapper.style.setProperty("display", "none", "important");
  }

  const appContainer = document.querySelector(".app-container");
  if (appContainer) {
    appContainer.style.setProperty("display", "flex", "important");
  }

  updateLoggedUserUI(sessionData);
  showToast("toast-success", `Welcome back, ${sessionData.employee_name}!`);

  fetchRequisitionsAndInit();

  if (sessionData.role === "Faculty" || sessionData.role === "Employee") {
    switchView("dashboard");
  } else if (sessionData.role === "HOD") {
    switchView("workflow");
  } else if (sessionData.role === "TransportOffice" || sessionData.role === "TransportDesk") {
    switchView("workflow");
  } else if (sessionData.role === "Driver") {
    switchView("workflow");
  }
}

function performLogin(username, password) {
  const errorMsg = document.getElementById("login-error-msg");
  const submitBtn = document.querySelector(".login-btn-main");

  // Disable button during API call
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Signing In...';
  }

  // Try backend API first
  fetch(API_BASE + '/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: username.trim(), password: password.trim() })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success && data.employee) {
        completeLoginSuccess(data.employee);
      } else {
        // Show error
        if (errorMsg) {
          errorMsg.innerText = data.message || 'Invalid User ID or Password.';
          errorMsg.style.display = 'flex';
        }
      }
    })
    .catch(err => {
      console.warn('Backend login failed, trying local fallback:', err);
      // Fallback to local employeesTable lookup if server is unreachable
      const cleanUser = (username || '').trim().toLowerCase();
      const cleanPass = (password || '').trim();

      let matchedUser = employeesTable.find(u => {
        const idLower = u.employee_id.toLowerCase();
        if (idLower === cleanUser && u.password === cleanPass) return true;
        // Alias support
        if (cleanUser === 'td301' && (idLower === 'to301') && u.password === cleanPass) return true;
        if (cleanUser === 'to301' && (idLower === 'td301') && u.password === cleanPass) return true;
        if (cleanUser === 'emp101' && (idLower === 'fac101') && u.password === cleanPass) return true;
        if (cleanUser === 'fac101' && (idLower === 'emp101') && u.password === cleanPass) return true;
        if (cleanUser === 'emp102' && (idLower === 'fac102') && u.password === cleanPass) return true;
        if (cleanUser === 'fac102' && (idLower === 'emp102') && u.password === cleanPass) return true;
        return false;
      });

      if (matchedUser) {
        // Create session without password
        const sessionData = {
          employee_id: matchedUser.employee_id,
          employee_name: matchedUser.employee_name,
          department: matchedUser.department,
          designation: matchedUser.designation,
          role: matchedUser.role,
          mobile: matchedUser.mobile
        };
        completeLoginSuccess(sessionData);
      } else {
        if (errorMsg) {
          errorMsg.innerText = 'Invalid User ID or Password.';
          errorMsg.style.display = 'flex';
        }
      }
    })
    .finally(() => {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Sign In';
      }
    });
}

function getInitialsAvatar(name) {
  const initials = name ? name.split(' ').filter(n => n).map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'UI';
  const colors = ["#D22630", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#EC4899"];
  const colorIndex = initials.charCodeAt(0) % colors.length;
  const bgColor = colors[colorIndex];

  // Generate SVG data URI
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <rect width="100" height="100" fill="${bgColor}"/>
    <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="'Outfit', 'Inter', sans-serif" font-size="40" font-weight="bold">${initials}</text>
  </svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

function updateLoggedUserUI(user) {
  if (!user) return;

  // Update avatars using user initials
  const navAvatar = document.querySelector(".user-avatar-nav");
  const sbAvatar = document.querySelector(".user-avatar-small");
  const avatarUrl = getInitialsAvatar(user.employee_name);
  if (navAvatar) navAvatar.src = avatarUrl;
  if (sbAvatar) sbAvatar.src = avatarUrl;

  // Update top nav user badge
  const navName = document.querySelector(".user-details-nav .name");
  const navRole = document.querySelector(".user-details-nav .role");
  if (navName) navName.innerText = user.employee_name;
  if (navRole) {
    if (user.role === "TransportOffice" || user.role === "TransportDesk") navRole.innerText = "Transport Office";
    else if (user.role === "HOD") navRole.innerText = "HOD";
    else if (user.role === "Driver") navRole.innerText = "Campus Driver";
    else navRole.innerText = "Faculty";
  }

  // Update sidebar footer
  const sbName = document.querySelector(".user-name-sb");
  const sbRole = document.querySelector(".user-role-sb");
  if (sbName) sbName.innerText = user.employee_name;
  if (sbRole) sbRole.innerText = `${user.designation} (${user.department})`;

  // Populate Requisition Form fields if active
  const reqEmpId = document.getElementById("req-emp-id");
  const reqEmpName = document.getElementById("req-emp-name");
  const reqDept = document.getElementById("req-dept");
  const reqEmpMobile = document.getElementById("req-emp-mobile");
  if (reqEmpId && user.employee_id) reqEmpId.value = user.employee_id;
  if (reqEmpName && user.employee_name) reqEmpName.value = user.employee_name;
  if (reqDept && user.department) reqDept.value = user.department;
  if (reqEmpMobile && user.mobile) reqEmpMobile.value = user.mobile;

  // Render sidebar menu items based on role
  renderSidebarForRole(user.role);
}

function renderSidebarForRole(role) {
  const menuContainer = document.querySelector(".sidebar-menu");
  if (!menuContainer) return;

  let menuHTML = "";
  if (role === "Faculty" || role === "Employee") {
    menuHTML = `
      <li class="menu-item active" id="menu-item-dashboard">
        <a class="menu-link" onclick="switchView('dashboard')">
          <i class="fa-solid fa-chart-line"></i>
          <span>Dashboard</span>
        </a>
      </li>
      <li class="menu-item" id="menu-item-requisition">
        <a class="menu-link" onclick="switchView('requisition')">
          <i class="fa-solid fa-file-signature"></i>
          <span>New Request</span>
        </a>
      </li>
      <li class="menu-item" id="menu-item-workflow">
        <a class="menu-link" onclick="switchView('workflow')">
          <i class="fa-solid fa-timeline"></i>
          <span>Track Requests</span>
        </a>
      </li>
    `;
  } else if (role === "HOD") {
    menuHTML = `
      <li class="menu-item active" id="menu-item-workflow">
        <a class="menu-link" onclick="switchView('workflow')">
          <i class="fa-solid fa-list-check"></i>
          <span>Approval Portal</span>
        </a>
      </li>
      <li class="menu-item" id="menu-item-requisition">
        <a class="menu-link" onclick="switchView('requisition')">
          <i class="fa-solid fa-file-signature"></i>
          <span>New Request</span>
        </a>
      </li>
      <li class="menu-item" id="menu-item-analytics">
        <a class="menu-link" onclick="switchView('analytics')">
          <i class="fa-solid fa-chart-pie"></i>
          <span>Analytics & Reports</span>
        </a>
      </li>
    `;
  } else if (role === "TransportOffice" || role === "TransportDesk") {
    menuHTML = `
      <li class="menu-item active" id="menu-item-workflow">
        <a class="menu-link" onclick="switchView('workflow')">
          <i class="fa-solid fa-truck-ramp-box"></i>
          <span>Allocation Portal</span>
        </a>
      </li>
      <li class="menu-item" id="menu-item-vehicles">
        <a class="menu-link" onclick="switchView('vehicles')">
          <i class="fa-solid fa-car"></i>
          <span>Register Vehicle</span>
        </a>
      </li>
      <li class="menu-item" id="menu-item-analytics">
        <a class="menu-link" onclick="switchView('analytics')">
          <i class="fa-solid fa-chart-pie"></i>
          <span>Analytics & Reports</span>
        </a>
      </li>
    `;
  } else if (role === "Driver") {
    menuHTML = `
      <li class="menu-item active" id="menu-item-workflow">
        <a class="menu-link" onclick="switchView('workflow')">
          <i class="fa-solid fa-route"></i>
          <span>My Assigned Trips</span>
        </a>
      </li>
    `;
  }

  menuContainer.innerHTML = menuHTML;
}

function handleLogout(event) {
  if (event) event.preventDefault();

  localStorage.removeItem(AUTH_KEY);
  document.body.classList.remove("authenticated");

  // Explicitly show login, hide dashboard
  const loginWrapper = document.getElementById("login-wrapper");
  if (loginWrapper) {
    loginWrapper.style.setProperty("display", "flex", "important");
  }

  const registerWrapper = document.getElementById("register-wrapper");
  if (registerWrapper) {
    registerWrapper.style.setProperty("display", "none", "important");
  }

  const appContainer = document.querySelector(".app-container");
  if (appContainer) {
    appContainer.style.setProperty("display", "none", "important");
  }

  // Reset form fields
  const pwdInput = document.getElementById("login-password");
  if (pwdInput) pwdInput.value = "";

  const usernameInput = document.getElementById("login-username");
  if (usernameInput) usernameInput.value = "";

  // Clear any login error messages
  const errorMsg = document.getElementById("login-error-msg");
  if (errorMsg) errorMsg.style.display = "none";

  showToast("toast-info", "Logged out successfully.");
}

function toggleProfileDropdown(event) {
  event.stopPropagation();
  const dropdown = document.getElementById("profile-dropdown-menu");
  if (dropdown) {
    dropdown.classList.toggle("active");
  }
}

// Click anywhere to close profile dropdown
window.addEventListener("click", () => {
  const dropdown = document.getElementById("profile-dropdown-menu");
  if (dropdown && dropdown.classList.contains("active")) {
    dropdown.classList.remove("active");
  }
});



/*
JK Lakshmi Vehicle Requisition Portal
Developed by Akshat Kumar, Vaibhav Agarwal and Rishita Bothra [2026]
All Rights Reserved
*/


// ON APP INITIALIZE
window.addEventListener("DOMContentLoaded", () => {
  // Bind Sidebar Logout Event Listener
  const sidebarLogout = document.getElementById("btn-logout");
  if (sidebarLogout) {
    sidebarLogout.addEventListener("click", (e) => {
      e.preventDefault();
      handleLogout();
    });
  }

  // Sync return date minimum with pickup date selection
  const pickupDateInput = document.getElementById("req-pickup-date");
  const returnDateInput = document.getElementById("req-return-date");
  if (pickupDateInput && returnDateInput) {
    pickupDateInput.addEventListener("change", () => {
      returnDateInput.min = pickupDateInput.value;
      if (returnDateInput.value && returnDateInput.value < pickupDateInput.value) {
        returnDateInput.value = pickupDateInput.value;
      }
    });
  }

  // Auto-populate driver name when selecting a vehicle in modal
  const modalSelectVehicle = document.getElementById("modal-select-vehicle");
  if (modalSelectVehicle) {
    modalSelectVehicle.addEventListener("change", () => {
      const vehicleId = modalSelectVehicle.value;
      const v = fleet.find(veh => veh.id === vehicleId);
      const driverInput = document.getElementById("modal-driver-name");
      if (v && driverInput) {
        driverInput.value = v.driverName;
      }
    });
  }

  // Initialize database
  initDatabase();

  // Check session
  initAuth();
});

function initDashboard() {
  // Update UI components
  updateDashboardStats();
  renderRecentRequests();
  renderNotificationsFeed();
  populateTimeDropdowns();
  loadCategoryOptions();
  populateFormFieldsDefaults();

  // Set default smart parameters
  calculateSmartMetrics();

  // New Visibility Toggles and Number Initializations
  toggleReturnJourney();
  toggleGuestSection();
  updateNextRequisitionNumber();
}

// View switching Router
function switchView(viewName) {
  // Close sidebar on mobile if open
  const sidebar = document.getElementById("app-sidebar");
  const overlay = document.getElementById("sidebar-overlay");
  if (sidebar && sidebar.classList.contains("open")) {
    sidebar.classList.remove("open");
    if (overlay) overlay.classList.remove("active");
  }

  // Toggle Side Menu highlight
  document.querySelectorAll(".sidebar-menu .menu-item").forEach(item => {
    item.classList.remove("active");
  });
  const activeMenuItem = document.getElementById(`menu-item-${viewName}`);
  if (activeMenuItem) activeMenuItem.classList.add("active");

  // Toggle View Container display
  document.querySelectorAll(".view-section").forEach(sec => {
    sec.classList.remove("active");
  });
  const targetSection = document.getElementById(`view-${viewName}`);
  if (targetSection) targetSection.classList.add("active");

  // Update body class for page-specific styling
  document.body.classList.remove("page-dashboard", "page-requisition", "page-workflow", "page-analytics", "page-vehicles");
  document.body.classList.add(`page-${viewName}`);

  // Fetch current role
  const session = localStorage.getItem(AUTH_KEY);
  let role = "Employee";
  let user = null;
  if (session) {
    try {
      user = JSON.parse(session);
      role = user.role;
    } catch (e) { }
  }

  // Set top navigation title dynamically based on role and view
  const titles = {
    dashboard: (role === "Faculty" || role === "Employee") ? "Faculty Dashboard" : "Dashboard Overview",
    requisition: "Create Vehicle Requisition",
    workflow: role === "HOD" ? "Approval Dashboard" : ((role === "TransportOffice" || role === "TransportDesk") ? "Vehicle Allocation Dashboard" : (role === "Driver" ? "Driver Trip Portal" : "Track Requests")),
    vehicles: "Register & Manage Vehicles",
    analytics: "Reports & Analytics Dashboard"
  };
  const titleElem = document.getElementById("current-view-title");
  if (titleElem) titleElem.innerText = titles[viewName] || "Bennett University Transport Management System";

  // Enforce role-based button visibility for Download Report
  const downloadBtn = document.getElementById("btn-download-report");
  if (downloadBtn) {
    if (viewName === "analytics" && (role === "TransportOffice" || role === "TransportDesk" || role === "HOD")) {
      downloadBtn.style.display = "inline-flex";
    } else {
      downloadBtn.style.display = "none";
    }
  }

  // Re-fetch requisitions to ensure real-time updates!
  if (user) {
    let url = '/myrequests';
    if (user.role === 'HOD') {
      url = '/pending-hod';
    } else if (user.role === 'TransportOffice' || user.role === 'TransportDesk') {
      url = '/transport/pending';
    } else if (user.role === 'Driver') {
      url = '/driver/trips';
    }

    fetch(API_BASE + url, {
      headers: {
        'x-employee-id': user.employee_id
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          requisitions = data;
        } else if (data && Array.isArray(data.trips)) {
          requisitions = data.trips;
        }
        if (viewName === "requisition") {
          loadDraftIfExists();
        }

        // Trigger charts init / redraw if analytics
        if (viewName === "analytics") {
          setTimeout(initAnalyticsCharts, 50);
        } else {
          destroyCharts();
        }

        // Refresh pages
        if (viewName === "workflow") {
          renderWorkflowTimeline("all");
        }

        if (viewName === "dashboard") {
          updateDashboardStats();
          renderRecentRequests();
        }
      })
      .catch(err => {
        console.warn('Sync on view switch failed, rendering local state:', err);
        if (viewName === "requisition") loadDraftIfExists();
        if (viewName === "analytics") setTimeout(initAnalyticsCharts, 50);
        else destroyCharts();
        if (viewName === "workflow") renderWorkflowTimeline("all");
        if (viewName === "dashboard") {
          updateDashboardStats();
          renderRecentRequests();
        }
      });
  } else {
    if (viewName === "analytics") {
      setTimeout(initAnalyticsCharts, 50);
    } else {
      destroyCharts();
    }
    if (viewName === "workflow") {
      renderWorkflowTimeline("all");
    }
  }
}

// ----------------------------------------------------
// DASHBOARD LOGIC
// ----------------------------------------------------
function updateDashboardStats() {
  const session = localStorage.getItem(AUTH_KEY);
  if (!session) return;
  const user = JSON.parse(session);

  const isFaculty = user.role === "Faculty" || user.role === "Employee";
  const isHOD = user.role === "HOD";
  const isTransport = user.role === "TransportOffice" || user.role === "TransportDesk";

  let visibleReqs = [];
  if (isFaculty) {
    visibleReqs = requisitions.filter(r => r.employee_id === user.employee_id || r.empId === user.employee_id);
  } else if (isHOD) {
    visibleReqs = requisitions.filter(r => isSameDepartment(r.department, user.department));
  } else {
    visibleReqs = requisitions; // Transport Desk
  }

  document.getElementById("stat-total-requests").innerText = visibleReqs.length;
  document.getElementById("stat-active-vehicles").innerText = fleet.filter(v => v.status === "On Trip").length;

  // Pending Approval/Allocation counts
  let pendingCount = 0;
  if (isHOD) {
    pendingCount = visibleReqs.filter(r => r.status === "REQUEST SUBMITTED").length;
  } else if (isTransport) {
    pendingCount = visibleReqs.filter(r => r.status === "HOD APPROVED").length;
  } else {
    pendingCount = visibleReqs.filter(r => r.status === "REQUEST SUBMITTED" || r.status === "HOD APPROVED").length;
  }
  document.getElementById("stat-pending-approvals").innerText = pendingCount;

  // Completed trips
  const completedCount = visibleReqs.filter(r => r.status === "TRIP COMPLETED").length;
  document.getElementById("stat-completed-trips").innerText = completedCount;

  // Redraw charts if currently viewing analytics page
  if (document.body.classList.contains("page-analytics")) {
    initAnalyticsCharts();
  }
}

function renderRecentRequests() {
  const tbody = document.querySelector("#dashboard-recent-requests-table tbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  const session = localStorage.getItem(AUTH_KEY);
  if (!session) return;
  const user = JSON.parse(session);

  const isFaculty = user.role === "Faculty" || user.role === "Employee";
  const isHOD = user.role === "HOD";

  let visibleReqs = [];
  if (isFaculty) {
    visibleReqs = requisitions.filter(r => r.employee_id === user.employee_id || r.empId === user.employee_id);
  } else if (isHOD) {
    visibleReqs = requisitions.filter(r => isSameDepartment(r.department, user.department));
  } else {
    visibleReqs = requisitions;
  }

  // Sort requisitions by latest ID
  const sorted = [...visibleReqs].sort((a, b) => {
    const idA = parseInt(String(a.id || a.requisition_no || "").replace(/\\D/g, '')) || 0;
    const idB = parseInt(String(b.id || b.requisition_no || "").replace(/\\D/g, '')) || 0;
    return idB - idA;
  }).slice(0, 5);

  if (sorted.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 20px;">
          No active or recent requisitions.
        </td>
      </tr>
    `;
    tbody.appendChild(tr);
    return;
  }

  sorted.forEach(req => {
    const tr = document.createElement("tr");

    // Status Badge Builder
    let statusClass = "badge-pending";
    let displayStatus = req.status;

    if (req.status === "TRIP COMPLETED") {
      statusClass = "badge-completed";
      displayStatus = "Trip Completed";
    } else if (req.status === "VEHICLE ASSIGNED") {
      statusClass = "badge-progress";
      displayStatus = "Vehicle Assigned";
    } else if (req.status === "HOD APPROVED") {
      statusClass = "badge-approved";
      displayStatus = "HOD Approved";
    } else if (req.status === "REJECTED") {
      statusClass = "badge-rejected";
      displayStatus = "Rejected";
    } else if (req.status === "REQUEST SUBMITTED") {
      statusClass = "badge-pending";
      displayStatus = "Pending HOD Approval";
    } else if (req.status === "Draft") {
      statusClass = "badge-pending";
      displayStatus = "Draft";
    }

    tr.innerHTML = `
      <td data-label="Req ID"><strong>${req.id}</strong></td>
      <td data-label="Requester">
        <div style="font-weight: 600;">${req.employee_name || req.empName}</div>
        <div style="font-size: 11px; color: var(--text-muted);">${req.department}</div>
      </td>
      <td data-label="Destination">${req.destination || req.destLoc}</td>
      <td data-label="Vehicle Category"><span style="font-weight: 500;"><i class="fa-solid fa-car" style="margin-right:6px; font-size:12px;"></i>${req.vehicle_category || req.suggestedCategory}</span></td>
      <td data-label="Status">
        <span class="badge ${statusClass}">
          <span class="badge-dot"></span>
          ${displayStatus}
        </span>
      </td>
      <td data-label="Actions">
        <button class="btn btn-secondary" style="padding: 6px 12px; font-size:11px;" onclick="viewWorkflowDetails('${req.id}')">
          <i class="fa-solid fa-timeline"></i> Track
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function viewWorkflowDetails(reqId) {
  switchView("workflow");
  // Highlight/scroll to specific request details inside workflow screen
  setTimeout(() => {
    const el = document.getElementById(`workflow-card-${reqId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.style.boxShadow = "0 12px 40px 0 rgba(210, 38, 48, 0.25)";
      el.style.borderColor = "var(--primary-color)";
    }
  }, 100);
}

function renderNotificationsFeed() {
  const container = document.getElementById("dashboard-notifications-feed");
  if (!container) return;
  container.innerHTML = "";

  const badge = document.getElementById("badge-notification-count");
  if (badge) {
    if (notifications.length === 0) {
      badge.style.display = "none";
    } else {
      badge.style.display = "flex";
      badge.innerText = notifications.length;
    }
  }

  if (notifications.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); padding: 20px; font-size: 13px;">
        No new system notifications.
      </div>
    `;
    return;
  }

  notifications.slice(0, 4).forEach(n => {
    const div = document.createElement("div");
    div.className = "notification-item";

    let iconClass = "notif-info";
    let icon = "fa-bell";
    if (n.type === "success") { iconClass = "notif-success"; icon = "fa-circle-check"; }
    else if (n.type === "warning") { iconClass = "notif-warning"; icon = "fa-triangle-exclamation"; }
    else if (n.type === "danger") { iconClass = "notif-danger"; icon = "fa-circle-xmark"; }

    div.innerHTML = `
      <div class="notif-icon-box ${iconClass}">
        <i class="fa-solid ${icon}"></i>
      </div>
      <div class="notif-content">
        <div class="notif-title">${n.title}</div>
        <div class="notif-desc">${n.desc}</div>
        <div class="notif-time">${n.time}</div>
      </div>
    `;
    container.appendChild(div);
  });
}

function toggleNotificationCenter() {
  showToast("toast-info", "Notification Hub Synchronized: 0 new messages.");
  // Decrement notification count mock
  const badge = document.getElementById("badge-notification-count");
  if (badge) badge.style.display = "none";
}

// ----------------------------------------------------
// SMART REQUISITION FORM LOGIC
// ----------------------------------------------------
function populateTimeDropdowns() {
  const pickupHour = document.getElementById("req-pickup-hour");
  const pickupMin = document.getElementById("req-pickup-minute");
  const returnHour = document.getElementById("req-return-hour");
  const returnMin = document.getElementById("req-return-minute");

  if (!pickupHour) return;

  let hoursHTML = "";
  for (let i = 0; i < 24; i++) {
    const val = String(i).padStart(2, '0');
    hoursHTML += `<option value="${i}">${val}</option>`;
  }
  pickupHour.innerHTML = hoursHTML;
  returnHour.innerHTML = hoursHTML;

  let minsHTML = "";
  for (let i = 0; i < 60; i++) {
    const val = String(i).padStart(2, '0');
    minsHTML += `<option value="${i}">${val}</option>`;
  }
  pickupMin.innerHTML = minsHTML;
  returnMin.innerHTML = minsHTML;
}

function loadCategoryOptions() {
  const select = document.getElementById("req-category");
  if (!select) return;

  const renderCategories = (catList) => {
    select.innerHTML = '<option value="" disabled selected>Select Category</option>';
    catList.forEach(catName => {
      const option = document.createElement("option");
      option.value = catName;
      option.innerText = catName;
      select.appendChild(option);
    });
  };

  // 1. Render Bennett categories immediately
  renderCategories(BENNETT_CATEGORIES);

  // 2. Non-blocking optional sync with 1.5s timeout
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timeoutId = controller ? setTimeout(() => controller.abort(), 1500) : null;

  fetch(API_BASE + '/api/vehicle-categories', controller ? { signal: controller.signal } : {})
    .then(res => res.json())
    .then(categories => {
      if (timeoutId) clearTimeout(timeoutId);
      if (Array.isArray(categories) && categories.length > 0) {
        const catNames = categories
          .map(cat => (typeof cat === 'object' ? cat.descr : cat))
          .filter(name => typeof name === 'string' && !name.includes('Govt') && !name.includes('Ladies') && !name.includes('CSR') && !name.includes('Banas') && !name.includes('HO Employees') && !name.includes('Auditor') && !name.includes('Health Check-up'));
        
        if (catNames.length > 0) {
          renderCategories(catNames);
        }
      }
    })
    .catch(err => {
      if (timeoutId) clearTimeout(timeoutId);
    });
}

function populateFormFieldsDefaults() {
  // Set placeholder pickup times to 4 hours in the future
  const now = new Date();
  now.setHours(now.getHours() + 4);
  now.setMinutes(0);

  const pickupDateInput = document.getElementById("req-pickup-date");
  const pickupHourSelect = document.getElementById("req-pickup-hour");
  const pickupMinSelect = document.getElementById("req-pickup-minute");

  const today = new Date();
  const yyyyToday = today.getFullYear();
  const mmToday = String(today.getMonth() + 1).padStart(2, '0');
  const ddToday = String(today.getDate()).padStart(2, '0');
  const todayStr = `${yyyyToday}-${mmToday}-${ddToday}`;

  if (pickupDateInput) {
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    pickupDateInput.value = `${yyyy}-${mm}-${dd}`;
    pickupDateInput.min = todayStr;
  }
  if (pickupHourSelect) pickupHourSelect.value = String(now.getHours());
  if (pickupMinSelect) pickupMinSelect.value = String(now.getMinutes());

  now.setHours(now.getHours() + 8);
  const returnDateInput = document.getElementById("req-return-date");
  const returnHourSelect = document.getElementById("req-return-hour");
  const returnMinSelect = document.getElementById("req-return-minute");

  if (returnDateInput) {
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    returnDateInput.value = `${yyyy}-${mm}-${dd}`;
    returnDateInput.min = pickupDateInput ? pickupDateInput.value : todayStr;
  }
  if (returnHourSelect) returnHourSelect.value = String(now.getHours());
  if (returnMinSelect) returnMinSelect.value = String(now.getMinutes());

  const categorySelect = document.getElementById("req-category");
  if (categorySelect) categorySelect.value = "";
}

function calculateSmartMetrics() {
  const categorySelect = document.getElementById("req-category").value;
  const fromSelect = document.getElementById("req-from-loc").value;
  const toSelect = document.getElementById("req-to-loc").value;

  // 1. Vehicle Category based vehicle allocation mapping
  let suggested = "Select Category First";
  let rate = 0;

  if (categorySelect) {
    if (categorySelect.includes("Govt Officials")) {
      suggested = "Executive Vehicle";
      rate = 12;
    } else if (categorySelect.includes("Ladies Club") || categorySelect.includes("CSR")) {
      suggested = "SUV";
      rate = 10;
    } else if (categorySelect.includes("HO Employees")) {
      suggested = "Premium Sedan";
      rate = 10;
    } else if (categorySelect.includes("pers.") || categorySelect.includes("Banas")) {
      suggested = "Hatchback";
      rate = 8;
    } else {
      suggested = "Sedan";
      rate = 8;
    }
  }

  const categoryEl = document.getElementById("smart-suggested-category");
  if (categoryEl) categoryEl.innerText = suggested;

  // 2. Resolve distance based on from/to location selection using getDistance() helper
  let distance = getDistance(fromSelect, toSelect);
  const returnJourneyCheckbox = document.getElementById("req-return-journey-checkbox");
  const isReturn = returnJourneyCheckbox ? returnJourneyCheckbox.checked : false;

  let totalDistance = distance;
  if (isReturn && distance > 0) {
    totalDistance = distance * 2;
  }

  const distanceEl = document.getElementById("smart-distance");
  if (distanceEl) {
    if (distance > 0) {
      if (isReturn) {
        distanceEl.innerHTML = `${totalDistance} km <span style="font-size: 14px; font-weight: 500; color: var(--text-muted); display: block; margin-top: 4px;">(${distance} km going & ${distance} km coming)</span>`;
      } else {
        distanceEl.innerText = `${distance} km`;
      }
    } else {
      distanceEl.innerText = "-- km";
    }
  }

  // 3. Trip Cost calculation (Distance * Mileage Rate)
  const costEl = document.getElementById("smart-cost");
  if (costEl) {
    if (totalDistance > 0 && rate > 0) {
      const estimatedCost = totalDistance * rate;
      costEl.innerText = `₹${estimatedCost.toLocaleString("en-IN")}.00`;
    } else {
      costEl.innerText = "₹0.00";
    }
  }

  // 4. Vehicle Availability indicator
  const availabilityEl = document.getElementById("smart-availability");
  const availabilityBox = document.querySelector(".smart-icon-box.availability");
  if (availabilityEl) {
    if (!categorySelect) {
      availabilityEl.innerText = "Awaiting Category";
      availabilityBox.style.color = "var(--text-muted)";
      availabilityBox.style.background = "rgba(0, 0, 0, 0.05)";
    } else {
      // Find count of available vehicles in suggested category
      const count = fleet.filter(v => v.category === suggested && v.status === "Available").length;
      if (count > 0) {
        availabilityEl.innerText = `${count} Available Now`;
        availabilityBox.style.color = "var(--text-white)";
        availabilityBox.style.background = "linear-gradient(135deg, var(--success) 0%, #34D399 100%)";
        availabilityBox.querySelector("i").className = "fa-solid fa-circle-check";
      } else {
        availabilityEl.innerText = "Fully Allocated (Waitlist)";
        availabilityBox.style.color = "var(--text-white)";
        availabilityBox.style.background = "linear-gradient(135deg, var(--danger) 0%, #F87171 100%)";
        availabilityBox.querySelector("i").className = "fa-solid fa-circle-xmark";
      }
    }
  }
}

function handleRequestSubmit(event) {
  event.preventDefault();

  try {
    // Gather fields
    const plant = document.getElementById("req-plant-location").value;
    const journey = document.getElementById("req-journey-type").value;
    const category = document.getElementById("req-category").value;
    const passengersVal = document.getElementById("req-passengers").value;
    const passengers = parseInt(passengersVal, 10);
    const pickupLoc = document.getElementById("req-pickup-loc").value;
    const dropLoc = document.getElementById("req-drop-loc").value;
    const fromLoc = document.getElementById("req-from-loc").value;
    const toLoc = document.getElementById("req-to-loc").value;
    const purpose = document.getElementById("req-purpose").value;

    const pickupDate = document.getElementById("req-pickup-date").value;
    const pickupHour = parseInt(document.getElementById("req-pickup-hour").value, 10);
    const pickupMinute = parseInt(document.getElementById("req-pickup-minute").value, 10);

    const returnJourneyRequired = document.getElementById("req-return-journey-checkbox").checked;
    const returnDate = returnJourneyRequired ? document.getElementById("req-return-date").value : "";
    const returnHour = returnJourneyRequired ? parseInt(document.getElementById("req-return-hour").value, 10) : null;
    const returnMinute = returnJourneyRequired ? parseInt(document.getElementById("req-return-minute").value, 10) : null;

    const travellingWithGuest = document.getElementById("req-guest-checkbox").checked;
    const guestName = travellingWithGuest ? document.getElementById("req-guest-name").value : "";
    const guestMobile = travellingWithGuest ? document.getElementById("req-guest-mobile").value : "";

    const empId = document.getElementById("req-emp-id").value;
    const empName = document.getElementById("req-emp-name").value;
    const dept = document.getElementById("req-dept").value;
    const mobile = document.getElementById("req-emp-mobile").value;
    const remarks = document.getElementById("req-remarks").value;

    const suggestedCategory = document.getElementById("smart-suggested-category").innerText;

    // Manual Validation
    if (!plant) { showToast("toast-danger", "Please select Plant / Office Location."); return; }
    if (!journey) { showToast("toast-danger", "Please select Journey Type."); return; }
    if (!category) { showToast("toast-danger", "Please select Category."); return; }
    if (!pickupLoc.trim()) { showToast("toast-danger", "Please enter Pickup Point."); return; }
    if (!dropLoc.trim()) { showToast("toast-danger", "Please enter Drop Point."); return; }
    if (!fromLoc) { showToast("toast-danger", "Please select From Location."); return; }
    if (!toLoc) { showToast("toast-danger", "Please select To Location."); return; }
    if (!passengersVal || isNaN(passengers) || passengers <= 0) { showToast("toast-danger", "Please enter a valid Number of Passengers."); return; }
    if (!purpose.trim()) { showToast("toast-danger", "Please enter Purpose of Request."); return; }
    if (!pickupDate) { showToast("toast-danger", "Please enter Pickup Date."); return; }
    if (isNaN(pickupHour) || isNaN(pickupMinute)) { showToast("toast-danger", "Please select valid Pickup Time."); return; }
    if (returnJourneyRequired && !returnDate) { showToast("toast-danger", "Please enter Return Date."); return; }
    if (returnJourneyRequired && (isNaN(returnHour) || isNaN(returnMinute))) { showToast("toast-danger", "Please select valid Return Time."); return; }

    // Validate date and time are not in the past
    const now = new Date();
    const pickupDateTime = new Date(`${pickupDate}T${String(pickupHour).padStart(2, '0')}:${String(pickupMinute).padStart(2, '0')}:00`);
    const pastLimit = new Date(now.getTime() - 5 * 60 * 1000); // 5-minute buffer

    if (pickupDateTime < pastLimit) {
      showToast("toast-danger", "Pickup date and time cannot be in the past.");
      return;
    }

    if (returnJourneyRequired) {
      const returnDateTime = new Date(`${returnDate}T${String(returnHour).padStart(2, '0')}:${String(returnMinute).padStart(2, '0')}:00`);
      if (returnDateTime < pastLimit) {
        showToast("toast-danger", "Return date and time cannot be in the past.");
        return;
      }
      if (returnDateTime <= pickupDateTime) {
        showToast("toast-danger", "Return date and time must be after the pickup date and time.");
        return;
      }
    }

    if (!empId) { showToast("toast-danger", "Employee ID is missing."); return; }
    if (!empName) { showToast("toast-danger", "Employee Name is missing."); return; }
    if (!dept) { showToast("toast-danger", "Department is missing."); return; }
    if (!mobile.trim()) { showToast("toast-danger", "Please enter Mobile Number."); return; }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(mobile.trim())) {
      showToast("toast-danger", "Employee Mobile Number must be exactly 10 digits.");
      return;
    }

    if (travellingWithGuest && guestMobile.trim()) {
      if (!phoneRegex.test(guestMobile.trim())) {
        showToast("toast-danger", "Guest Mobile Number must be exactly 10 digits.");
        return;
      }
    }

    let distance = getDistance(fromLoc, toLoc);
    if (returnJourneyRequired && distance > 0) {
      distance = distance * 2;
    }

    let rate = 8; // Sedan default
    if (suggestedCategory === "Hatchback") rate = 8;
    else if (suggestedCategory === "Premium Sedan") rate = 10;
    else if (suggestedCategory === "SUV") rate = 10;
    else if (suggestedCategory === "Executive Vehicle") rate = 12;

    const cost = distance * rate;

    const newReq = {
      employee_id: empId,
      employee_name: empName,
      department: dept,
      mobile: mobile,
      plantLocation: plant,
      journeyType: journey,
      category: category,
      purpose,
      pickupLoc,
      dropLoc,
      fromLoc,
      toLoc,
      destLoc: `${fromLoc} to ${toLoc}`,
      passengers,
      pickup_date: pickupDate,
      pickup_hour: pickupHour,
      pickup_minute: pickupMinute,
      returnJourneyRequired,
      return_date: returnDate,
      return_hour: returnHour,
      return_minute: returnMinute,
      travellingWithGuest,
      guestName,
      guestMobile,
      remarks,
      suggestedCategory,
      distance,
      cost,
      status: "REQUEST SUBMITTED",
      logs: [
        { step: "Requested", time: new Date().toISOString().replace('T', ' ').slice(0, 16) }
      ]
    };

    fetch(API_BASE + '/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newReq)
    })
      .then(res => {
        if (!res.ok) {
          return res.json().catch(() => ({ success: false, message: `Server returned status ${res.status}` }));
        }
        return res.json();
      })
      .then(resData => {
        if (resData.success) {
          const reqObj = resData.request || newReq;
          const reqNum = resData.requestNo || reqObj.requisition_no || reqObj.id || "2026001";
          reqObj.id = reqNum;
          
          // Add to local list if not already present
          const existingIdx = requisitions.findIndex(r => r.id === reqNum || r.requisition_no === reqNum);
          if (existingIdx >= 0) {
            requisitions[existingIdx] = reqObj;
          } else {
            requisitions.unshift(reqObj);
          }

          // Add to system notifications
          notifications.unshift({
            id: notifications.length + 1,
            type: "info",
            title: "Requisition Filed",
            desc: `${empName} requested ${suggestedCategory} for ${newReq.destLoc}.`,
            time: "Just now"
          });

          // Update UI and trigger toast
          updateDashboardStats();
          renderRecentRequests();
          renderNotificationsFeed();

          showToast("toast-success", `Request Submitted Successfully (Requisition No: ${reqNum})`);
          switchView("dashboard");
          resetForm();
        } else {
          showToast("toast-danger", "Database insertion failed: " + (resData.message || "Unknown error"));
        }
      })
      .catch(err => {
        console.error("VECHREQ INSERT ERROR:", err);
        let msg = err.message;
        if (msg === "Load failed" || msg === "Failed to fetch") {
          msg = "Backend server is not running on port 3000. Please run 'npm start' in the project directory.";
        }
        showToast("toast-danger", "Request submission failed: " + msg);
      });
  } catch (err) {
    console.error("Javascript Error in handleRequestSubmit:", err);
    showToast("toast-danger", "Application error: " + err.message);
  }
}

function resetForm() {
  document.getElementById("vehicle-request-form").reset();
  populateFormFieldsDefaults();
  calculateSmartMetrics();
  toggleReturnJourney();
  toggleGuestSection();
  updateNextRequisitionNumber();

  // Reset status card
  const badge = document.getElementById("req-status-badge");
  if (badge) {
    badge.className = "badge badge-pending";
    badge.style.background = "";
    badge.style.color = "";
    badge.innerHTML = '<span class="badge-dot"></span>Pending Approval';
  }
  const updatedTime = document.getElementById("req-status-updated-time");
  if (updatedTime) {
    updatedTime.innerText = "Just Now";
  }
}

function loadDraftIfExists() {
  const session = localStorage.getItem(AUTH_KEY);
  if (!session) return;
  const user = JSON.parse(session);

  const draft = requisitions.find(r => r.status === "Draft" && r.employee_id === user.employee_id);
  if (!draft) {
    resetForm();
    return;
  }

  // Populate fields
  const empIdEl = document.getElementById("req-emp-id");
  if (empIdEl && draft.employee_id) empIdEl.value = draft.employee_id;

  const empNameEl = document.getElementById("req-emp-name");
  if (empNameEl && draft.employee_name) empNameEl.value = draft.employee_name;

  const deptEl = document.getElementById("req-dept");
  if (deptEl && draft.department) deptEl.value = draft.department;

  const mobileEl = document.getElementById("req-emp-mobile");
  if (mobileEl && draft.mobile) mobileEl.value = draft.mobile;

  const plantEl = document.getElementById("req-plant-location");
  if (plantEl && draft.plantLocation) plantEl.value = draft.plantLocation;

  const journeyEl = document.getElementById("req-journey-type");
  if (journeyEl && draft.journeyType) journeyEl.value = draft.journeyType;

  const categoryEl = document.getElementById("req-category");
  if (categoryEl && draft.category) {
    categoryEl.value = draft.category;
  }

  const passengersEl = document.getElementById("req-passengers");
  if (passengersEl) passengersEl.value = draft.passengers || "";

  const pickupLocEl = document.getElementById("req-pickup-loc");
  if (pickupLocEl) pickupLocEl.value = draft.pickupLoc || "";

  const dropLocEl = document.getElementById("req-drop-loc");
  if (dropLocEl) dropLocEl.value = draft.dropLoc || "";

  const fromLocEl = document.getElementById("req-from-loc");
  if (fromLocEl && draft.fromLoc) fromLocEl.value = draft.fromLoc;

  const toLocEl = document.getElementById("req-to-loc");
  if (toLocEl && draft.toLoc) toLocEl.value = draft.toLoc;

  const purposeEl = document.getElementById("req-purpose");
  if (purposeEl) purposeEl.value = draft.purpose || "";

  const pickupDateEl = document.getElementById("req-pickup-date");
  if (pickupDateEl && draft.pickup_date) {
    pickupDateEl.value = draft.pickup_date;
  }

  const pickupHourEl = document.getElementById("req-pickup-hour");
  if (pickupHourEl && draft.pickup_hour !== undefined && draft.pickup_hour !== null) {
    pickupHourEl.value = String(draft.pickup_hour);
  }

  const pickupMinEl = document.getElementById("req-pickup-minute");
  if (pickupMinEl && draft.pickup_minute !== undefined && draft.pickup_minute !== null) {
    pickupMinEl.value = String(draft.pickup_minute);
  }

  const returnJourneyCheckbox = document.getElementById("req-return-journey-checkbox");
  if (returnJourneyCheckbox) {
    returnJourneyCheckbox.checked = !!draft.returnJourneyRequired;
    toggleReturnJourney();
  }

  const returnDateEl = document.getElementById("req-return-date");
  if (returnDateEl && draft.return_date) {
    returnDateEl.value = draft.return_date;
  }

  const returnHourEl = document.getElementById("req-return-hour");
  if (returnHourEl && draft.return_hour !== undefined && draft.return_hour !== null) {
    returnHourEl.value = String(draft.return_hour);
  }

  const returnMinEl = document.getElementById("req-return-minute");
  if (returnMinEl && draft.return_minute !== undefined && draft.return_minute !== null) {
    returnMinEl.value = String(draft.return_minute);
  }

  const guestCheckbox = document.getElementById("req-guest-checkbox");
  if (guestCheckbox) {
    guestCheckbox.checked = !!draft.travellingWithGuest;
    toggleGuestSection();
  }

  const guestNameEl = document.getElementById("req-guest-name");
  if (guestNameEl) guestNameEl.value = draft.guestName || "";

  const guestMobileEl = document.getElementById("req-guest-mobile");
  if (guestMobileEl) guestMobileEl.value = draft.guestMobile || "";

  const remarksEl = document.getElementById("req-remarks");
  if (remarksEl) remarksEl.value = draft.remarks || "";

  // Set visual elements
  const reqNumDisplay = document.getElementById("req-number-display");
  if (reqNumDisplay && draft.id) {
    reqNumDisplay.innerText = draft.id;
  }

  // Update smart metrics
  calculateSmartMetrics();

  // Update status badge
  const badge = document.getElementById("req-status-badge");
  if (badge) {
    badge.className = "badge badge-pending";
    badge.style.background = "rgba(255, 193, 7, 0.15)";
    badge.style.color = "#FFC107";
    badge.innerHTML = '<span class="badge-dot" style="background-color: #FFC107"></span>Draft';
  }

  const updatedTime = document.getElementById("req-status-updated-time");
  if (updatedTime) {
    updatedTime.innerText = "Loaded Draft";
  }
}

function updateNextRequisitionNumber() {
  const reqNumDisplay = document.getElementById("req-number-display");
  if (reqNumDisplay) {
    fetch(API_BASE + '/requests/next-id')
      .then(res => res.json())
      .then(data => {
        if (data.formattedNum) {
          reqNumDisplay.innerText = data.formattedNum;
        }
      })
      .catch(err => {
        console.error("Error fetching next requisition ID:", err);
        const nextNum = requisitions.length + 1;
        const currentYear = new Date().getFullYear();
        const formattedNum = `${currentYear}${nextNum}`;
        reqNumDisplay.innerText = formattedNum;
      });
  }
}

function toggleReturnJourney() {
  const isChecked = document.getElementById("req-return-journey-checkbox").checked;
  const returnTimeGroup = document.getElementById("req-return-time-group");
  const returnDate = document.getElementById("req-return-date");
  const returnHour = document.getElementById("req-return-hour");
  const returnMin = document.getElementById("req-return-minute");
  if (returnTimeGroup) {
    if (isChecked) {
      returnTimeGroup.style.display = "flex";
      if (returnDate) returnDate.required = true;
      if (returnHour) returnHour.required = true;
      if (returnMin) returnMin.required = true;
    } else {
      returnTimeGroup.style.display = "none";
      if (returnDate) {
        returnDate.required = false;
        returnDate.value = "";
      }
      if (returnHour) {
        returnHour.required = false;
        returnHour.value = "18";
      }
      if (returnMin) {
        returnMin.required = false;
        returnMin.value = "0";
      }
    }
  }
  calculateSmartMetrics();
}

function toggleGuestSection() {
  const isChecked = document.getElementById("req-guest-checkbox").checked;
  const guestSection = document.getElementById("guest-details-section");
  const guestName = document.getElementById("req-guest-name");
  const guestMobile = document.getElementById("req-guest-mobile");
  if (guestSection) {
    guestSection.style.display = isChecked ? "flex" : "none";
    if (guestName && guestMobile) {
      guestName.required = isChecked;
      guestMobile.required = isChecked;
      if (!isChecked) {
        guestName.value = "";
        guestMobile.value = "";
      }
    }
  }
}

function saveDraftRequest(event) {
  if (event) event.preventDefault();

  // Gather fields
  const plant = document.getElementById("req-plant-location").value;
  const journey = document.getElementById("req-journey-type").value;
  const category = document.getElementById("req-category").value;
  const passengers = parseInt(document.getElementById("req-passengers").value || "0");
  const pickupLoc = document.getElementById("req-pickup-loc").value;
  const dropLoc = document.getElementById("req-drop-loc").value;
  const fromLoc = document.getElementById("req-from-loc").value;
  const toLoc = document.getElementById("req-to-loc").value;
  const purpose = document.getElementById("req-purpose").value;

  const pickupDate = document.getElementById("req-pickup-date").value;
  const pickupHour = document.getElementById("req-pickup-hour").value;
  const pickupMinute = document.getElementById("req-pickup-minute").value;

  const returnJourneyRequired = document.getElementById("req-return-journey-checkbox").checked;
  const returnDate = returnJourneyRequired ? document.getElementById("req-return-date").value : "";
  const returnHour = returnJourneyRequired ? document.getElementById("req-return-hour").value : null;
  const returnMinute = returnJourneyRequired ? document.getElementById("req-return-minute").value : null;

  const travellingWithGuest = document.getElementById("req-guest-checkbox").checked;
  const guestName = travellingWithGuest ? document.getElementById("req-guest-name").value : "";
  const guestMobile = travellingWithGuest ? document.getElementById("req-guest-mobile").value : "";

  const empId = document.getElementById("req-emp-id").value;
  const empName = document.getElementById("req-emp-name").value;
  const dept = document.getElementById("req-dept").value;
  const mobile = document.getElementById("req-emp-mobile").value;
  const remarks = document.getElementById("req-remarks").value;

  const suggestedCategory = document.getElementById("smart-suggested-category").innerText;

  let distance = getDistance(fromLoc, toLoc);
  if (returnJourneyRequired && distance > 0) {
    distance = distance * 2;
  }

  let rate = 8; // Sedan default
  if (suggestedCategory === "Hatchback") rate = 8;
  else if (suggestedCategory === "Premium Sedan") rate = 10;
  else if (suggestedCategory === "SUV") rate = 10;
  else if (suggestedCategory === "Executive Vehicle") rate = 12;

  const cost = distance * rate;

  const draftReq = {
    employee_id: empId,
    employee_name: empName,
    department: dept,
    mobile: mobile,
    plantLocation: plant,
    journeyType: journey,
    category: category,
    purpose: purpose,
    pickupLoc: pickupLoc,
    dropLoc: dropLoc,
    fromLoc: fromLoc,
    toLoc: toLoc,
    destLoc: `${fromLoc} to ${toLoc}`,
    passengers: passengers,
    pickup_date: pickupDate,
    pickup_hour: pickupHour ? parseInt(pickupHour, 10) : null,
    pickup_minute: pickupMinute ? parseInt(pickupMinute, 10) : null,
    returnJourneyRequired: returnJourneyRequired,
    return_date: returnDate,
    return_hour: returnHour ? parseInt(returnHour, 10) : null,
    return_minute: returnMinute ? parseInt(returnMinute, 10) : null,
    travellingWithGuest: travellingWithGuest,
    guestName: guestName,
    guestMobile: guestMobile,
    remarks: remarks,
    suggestedCategory: suggestedCategory,
    distance: distance,
    cost: cost,
    status: "Draft",
    logs: [
      { step: "Requested", time: new Date().toISOString().replace('T', ' ').slice(0, 16) }
    ]
  };

  fetch(API_BASE + '/request', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(draftReq)
  })
    .then(res => res.json())
    .then(resData => {
      if (resData.success) {
        // Find if we already loaded it
        const existingIdx = requisitions.findIndex(r => r.id === resData.request.id);
        if (existingIdx !== -1) {
          requisitions[existingIdx] = resData.request;
        } else {
          requisitions.push(resData.request);
        }

        // Visual Feedback: Set status to Draft
        const badge = document.getElementById("req-status-badge");
        if (badge) {
          badge.className = "badge badge-pending";
          badge.style.background = "rgba(255, 193, 7, 0.15)";
          badge.style.color = "#FFC107";
          badge.innerHTML = '<span class="badge-dot" style="background-color: #FFC107"></span>Draft';
        }
        const updatedTime = document.getElementById("req-status-updated-time");
        if (updatedTime) {
          updatedTime.innerText = new Date().toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' });
        }

        showToast("toast-info", "Draft requisition saved successfully!");
        updateDashboardStats();
        renderRecentRequests();
        updateNextRequisitionNumber();
      } else {
        showToast("toast-danger", "Failed to save draft: " + resData.message);
      }
    })
    .catch(err => {
      console.error(err);
      showToast("toast-danger", "Failed to save draft due to server error.");
    });
}

function previewRequestDetails(event) {
  if (event) event.preventDefault();

  const plant = document.getElementById("req-plant-location").value || "Not selected";
  const journey = document.getElementById("req-journey-type").value || "Not selected";
  const userCategory = document.getElementById("req-category").value || "Not selected";
  const passengers = document.getElementById("req-passengers").value || "0";
  const pickupLoc = document.getElementById("req-pickup-loc").value || "Not entered";
  const dropLoc = document.getElementById("req-drop-loc").value || "Not entered";
  const fromLoc = document.getElementById("req-from-loc").value || "Not selected";
  const toLoc = document.getElementById("req-to-loc").value || "Not selected";
  const destLoc = (fromLoc !== "Not selected" && toLoc !== "Not selected") ? `${fromLoc} to ${toLoc}` : "Not selected";
  const purpose = document.getElementById("req-purpose").value || "Not entered";

  const isReturnRequired = document.getElementById("req-return-journey-checkbox").checked;

  const pickupDate = document.getElementById("req-pickup-date").value || "Not selected";
  const pickupHour = document.getElementById("req-pickup-hour").value || "00";
  const pickupMin = document.getElementById("req-pickup-minute").value || "00";
  const pickupTimeStr = pickupDate !== "Not selected" ? `${pickupDate} ${String(pickupHour).padStart(2, '0')}:${String(pickupMin).padStart(2, '0')}` : "Not selected";

  const returnDate = document.getElementById("req-return-date").value || "Not selected";
  const returnHour = document.getElementById("req-return-hour").value || "00";
  const returnMin = document.getElementById("req-return-minute").value || "00";
  const returnTimeStr = isReturnRequired ? (returnDate !== "Not selected" ? `${returnDate} ${String(returnHour).padStart(2, '0')}:${String(returnMin).padStart(2, '0')}` : "Not selected") : "No Return Journey";

  const isGuest = document.getElementById("req-guest-checkbox").checked;
  const guestName = isGuest ? (document.getElementById("req-guest-name").value || "Not entered") : "None";
  const guestMobile = isGuest ? (document.getElementById("req-guest-mobile").value || "Not entered") : "None";

  const empId = document.getElementById("req-emp-id").value;
  const empName = document.getElementById("req-emp-name").value;
  const dept = document.getElementById("req-dept").value;
  const mobile = document.getElementById("req-emp-mobile").value;

  const category = document.getElementById("smart-suggested-category").innerText || "Not selected";
  const remarks = document.getElementById("req-remarks").value || "None";
  const reqNum = document.getElementById("req-number-display").innerText;

  const body = document.getElementById("preview-modal-body");
  body.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 20px;">
      <div style="background: rgba(255,255,255,0.05); padding: 12px 16px; border-radius: 10px; border-left: 4px solid var(--primary-color);">
        <div style="font-size: 11px; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.5px;">Requisition ID</div>
        <div style="font-size: 16px; font-weight: 700; color: var(--primary-color);">${reqNum}</div>
      </div>
      
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
        <div>
          <span style="font-size: 12px; color: var(--text-muted);">Plant / Office Location:</span>
          <div style="font-weight: 600; margin-top: 2px; color: #fff;">${plant}</div>
        </div>
        <div>
          <span style="font-size: 12px; color: var(--text-muted);">Journey Type & Category:</span>
          <div style="font-weight: 600; margin-top: 2px; color: #fff;">${journey} (${userCategory})</div>
        </div>
        <div>
          <span style="font-size: 12px; color: var(--text-muted);">Pickup Point:</span>
          <div style="font-weight: 600; margin-top: 2px; color: #fff;">${pickupLoc}</div>
        </div>
        <div>
          <span style="font-size: 12px; color: var(--text-muted);">Drop Point:</span>
          <div style="font-weight: 600; margin-top: 2px; color: #fff;">${dropLoc}</div>
        </div>
        <div>
          <span style="font-size: 12px; color: var(--text-muted);">Route:</span>
          <div style="font-weight: 600; margin-top: 2px; color: #fff;">${destLoc}</div>
        </div>
        <div>
          <span style="font-size: 12px; color: var(--text-muted);">Passengers & Purpose:</span>
          <div style="font-weight: 600; margin-top: 2px; color: #fff;">${passengers} pass. (${purpose})</div>
        </div>
      </div>
      
      <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px;">
        <h4 style="margin: 0 0 12px 0; font-size: 13px; text-transform: uppercase; color: var(--primary-color); letter-spacing: 0.5px;">Schedule Details</h4>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
          <div>
            <span style="font-size: 12px; color: var(--text-muted);">Pickup Time:</span>
            <div style="font-weight: 600; margin-top: 2px; color: #fff;">${pickupTimeStr}</div>
          </div>
          <div>
            <span style="font-size: 12px; color: var(--text-muted);">Return Time:</span>
            <div style="font-weight: 600; margin-top: 2px; color: #fff;">${returnTimeStr}</div>
          </div>
        </div>
      </div>

      ${isGuest ? `
      <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px;">
        <h4 style="margin: 0 0 12px 0; font-size: 13px; text-transform: uppercase; color: var(--primary-color); letter-spacing: 0.5px;">Guest Info</h4>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
          <div>
            <span style="font-size: 12px; color: var(--text-muted);">Guest Name:</span>
            <div style="font-weight: 600; margin-top: 2px; color: #fff;">${guestName}</div>
          </div>
          <div>
            <span style="font-size: 12px; color: var(--text-muted);">Guest Mobile:</span>
            <div style="font-weight: 600; margin-top: 2px; color: #fff;">${guestMobile}</div>
          </div>
        </div>
      </div>
      ` : ''}

      <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px;">
        <h4 style="margin: 0 0 12px 0; font-size: 13px; text-transform: uppercase; color: var(--primary-color); letter-spacing: 0.5px;">Employee Info</h4>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
          <div>
            <span style="font-size: 12px; color: var(--text-muted);">Employee ID:</span>
            <div style="font-weight: 600; margin-top: 2px; color: #fff;">${empId}</div>
          </div>
          <div>
            <span style="font-size: 12px; color: var(--text-muted);">Employee Name:</span>
            <div style="font-weight: 600; margin-top: 2px; color: #fff;">${empName}</div>
          </div>
          <div>
            <span style="font-size: 12px; color: var(--text-muted);">Department:</span>
            <div style="font-weight: 600; margin-top: 2px; color: #fff;">${dept}</div>
          </div>
          <div>
            <span style="font-size: 12px; color: var(--text-muted);">Mobile:</span>
            <div style="font-weight: 600; margin-top: 2px; color: #fff;">${mobile}</div>
          </div>
          <div>
            <span style="font-size: 12px; color: var(--text-muted);">Vehicle Category:</span>
            <div style="font-weight: 600; margin-top: 2px; color: var(--accent-color);">${category}</div>
          </div>
        </div>
      </div>

      ${remarks ? `
      <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px;">
        <span style="font-size: 12px; color: var(--text-muted);">Remarks:</span>
        <div style="font-weight: 500; font-style: italic; margin-top: 2px; color: #fff;">${remarks}</div>
      </div>
      ` : ''}
    </div>
  `;

  document.getElementById("requisition-preview-modal").classList.add("active");
}

function closePreviewModal() {
  document.getElementById("requisition-preview-modal").classList.remove("active");
}

function submitFromPreview() {
  closePreviewModal();
  document.getElementById("btn-submit-requisition").click();
}

// ----------------------------------------------------
// APPROVAL WORKFLOW LOGIC
// ----------------------------------------------------
let workflowFilter = "all";

function filterWorkflow(filter) {
  workflowFilter = filter;
  // Style tabs
  document.querySelectorAll("#view-workflow .filter-btn").forEach(btn => {
    btn.classList.remove("active");
    if (btn.innerText.toLowerCase().includes(filter)) btn.classList.add("active");
    if (filter === "all" && btn.innerText.toLowerCase().includes("all")) btn.classList.add("active");
  });
  renderWorkflowTimeline(filter);
}

function renderWorkflowTimeline(filter = "all") {
  const container = document.getElementById("workflow-list-container");
  if (!container) return;
  container.innerHTML = "";

  const session = localStorage.getItem(AUTH_KEY);
  if (!session) return;
  const user = JSON.parse(session);
  const role = user.role;
  const isFaculty = role === "Faculty" || role === "Employee";
  const isHOD = role === "HOD";
  const isTransport = role === "TransportOffice" || role === "TransportDesk";
  const isDriver = role === "Driver";

  // Filter items by role visibility
  let visibleReqs = [];
  if (isFaculty) {
    visibleReqs = requisitions.filter(r => r.employee_id === user.employee_id || r.empId === user.employee_id);
  } else if (isHOD) {
    visibleReqs = requisitions.filter(r => isSameDepartment(r.department, user.department));
  } else if (isDriver) {
    visibleReqs = requisitions.filter(r => r.driverName === user.employee_name);
  } else {
    visibleReqs = requisitions; // Transport Desk sees all allocations / requisitions
  }

  // Filter by tab selection
  let filtered = [];
  if (filter === "all") {
    filtered = visibleReqs;
  } else if (filter === "pending") {
    if (isHOD) {
      filtered = visibleReqs.filter(r => {
        const s = String(r.status || '').toUpperCase();
        return s.includes("SUBMITTED") || s.includes("PENDING HOD") || s === "PENDING";
      });
    } else if (isTransport) {
      filtered = visibleReqs.filter(r => {
        const s = String(r.status || '').toUpperCase();
        return s.includes("HOD APPROVED") || s === "APPROVED";
      });
    } else if (isDriver) {
      filtered = visibleReqs.filter(r => {
        const s = String(r.status || '').toUpperCase();
        return s.includes("ASSIGNED") || s.includes("STARTED");
      });
    } else {
      filtered = visibleReqs.filter(r => {
        const s = String(r.status || '').toUpperCase();
        return s.includes("SUBMITTED") || s.includes("PENDING HOD") || s === "PENDING" || s.includes("HOD APPROVED") || s === "APPROVED";
      });
    }
  } else if (filter === "approved") {
    if (isDriver) {
      filtered = visibleReqs.filter(r => {
        const s = String(r.status || '').toUpperCase();
        return s.includes("ASSIGNED") || s.includes("STARTED");
      });
    } else {
      filtered = visibleReqs.filter(r => {
        const s = String(r.status || '').toUpperCase();
        return s.includes("APPROVED") || s.includes("ASSIGNED");
      });
    }
  } else if (filter === "completed") {
    filtered = visibleReqs.filter(r => {
      const s = String(r.status || '').toUpperCase();
      return s.includes("COMPLETED") || s.includes("REJECTED");
    });
  }

  if (filtered.length === 0) {
    let emptyTitle = "No requisitions found matching the selected filter.";
    let emptySub = "";

    if (isFaculty) {
      emptyTitle = "No vehicle requisitions found.";
      emptySub = "Create a new request to begin tracking.";
    } else if (isHOD) {
      emptyTitle = "No pending approvals available.";
    } else if (isDriver) {
      emptyTitle = "No trips assigned.";
    } else if (isTransport) {
      emptyTitle = "No vehicle allocation requests available.";
    }

    container.innerHTML = `
      <div class="glass-card" style="text-align: center; padding: 40px; color: var(--text-muted);">
        <i class="fa-solid fa-folder-open" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
        <p style="font-weight: 600; font-size: 16px; margin: 0 0 8px 0; color: var(--text-main);">${emptyTitle}</p>
        ${emptySub ? `<p style="margin: 0; font-size: 14px;">${emptySub}</p>` : ''}
      </div>
    `;
    return;
  }

  // Workflows steps array (5 milestones)
  const stepsList = [
    { label: "Request Submitted", icon: "fa-file-signature" },
    { label: "HOD Approval", icon: "fa-user-tie" },
    { label: "Transport Desk Allocation", icon: "fa-warehouse" },
    { label: "Vehicle Assigned", icon: "fa-car" },
    { label: "Trip Completed", icon: "fa-route" }
  ];

  filtered.forEach(req => {
    const card = document.createElement("div");
    card.className = "glass-card timeline-card";
    card.id = `workflow-card-${req.id}`;

    // Compute progress timeline width percentage based on status
    let progressPercent = 0;
    if (req.status === "REQUEST SUBMITTED") progressPercent = 12.5;
    else if (req.status === "HOD APPROVED") progressPercent = 37.5;
    else if (req.status === "VEHICLE ASSIGNED") progressPercent = 75;
    else if (req.status === "TRIP COMPLETED") progressPercent = 100;
    else if (req.status === "REJECTED") progressPercent = 25;
    else if (req.status === "Draft") progressPercent = 0;

    // Timeline Steps Node builders
    let stepsHTML = "";
    stepsList.forEach((s, idx) => {
      let stepClass = "";
      let stepIcon = s.icon;
      let timestampHTML = "<div class='step-time'>Pending</div>";

      // Find if we have a log for this step
      const stepLog = req.logs.find(l =>
        (idx === 0 && l.step === "Request Submitted") ||
        (idx === 1 && (l.step === "HOD Approved" || l.step === "HOD Rejected")) ||
        (idx === 2 && l.step === "Transport Allocated") ||
        (idx === 3 && l.step === "Vehicle Assigned") ||
        (idx === 4 && l.step === "Trip Completed")
      );
      
      if (stepLog) {
        let timeStr = stepLog.time === 'Not Available' ? 'Not Available' : stepLog.time;
        timestampHTML = `<div class="step-time">${timeStr}</div>`;
        if (stepLog.performed_by_name && stepLog.performed_by_id) {
          let actionVerb = 'Performed';
          if (idx === 0) actionVerb = 'Submitted';
          else if (idx === 1 && stepLog.step === 'HOD Approved') actionVerb = 'Approved';
          else if (idx === 1 && stepLog.step === 'HOD Rejected') actionVerb = 'Rejected';
          else if (idx === 2) actionVerb = 'Allocated';
          else if (idx === 3) actionVerb = 'Assigned';
          else if (idx === 4) actionVerb = 'Completed';
          
          timestampHTML += `<div style="font-size: 11px; color: var(--text-muted); margin-top: 4px; line-height: 1.2;">
            ${actionVerb} by ${stepLog.performed_by_name}<br>
            <span style="opacity: 0.7;">| ${stepLog.performed_by_id}</span>
          </div>`;
        }
      }

      if (req.status === "REJECTED" && idx === 1) {
        stepClass = "rejected";
        stepIcon = "fa-circle-xmark";
      } else {
        let currentStepTarget = 0;
        if (req.status === "REQUEST SUBMITTED") currentStepTarget = 1;
        else if (req.status === "HOD APPROVED") currentStepTarget = 2;
        else if (req.status === "VEHICLE ASSIGNED") currentStepTarget = 4;
        else if (req.status === "TRIP COMPLETED") currentStepTarget = 5;

        if (idx < currentStepTarget) {
          stepClass = "completed";
        } else if (idx === currentStepTarget) {
          stepClass = "active";
        }
      }

      stepsHTML += `
        <div class="timeline-step ${stepClass}">
          <div class="step-node">
            <i class="fa-solid ${stepIcon}"></i>
          </div>
          <div class="step-label">${s.label}</div>
          ${timestampHTML}
        </div>
      `;
    });

    // Action button rows based on status and user role
    let actionRowHTML = "";
    const sUpper = String(req.status || '').toUpperCase();
    const isPendingHOD = sUpper.includes("SUBMITTED") || sUpper.includes("PENDING HOD") || sUpper === "PENDING";
    const isHODApproved = sUpper.includes("HOD APPROVED") || sUpper === "APPROVED";
    const isAssigned = sUpper.includes("VEHICLE ASSIGNED") || sUpper.includes("DRIVER ASSIGNED");
    const isCompleted = sUpper.includes("TRIP COMPLETED") || sUpper.includes("COMPLETED");
    const isRejected = sUpper.includes("REJECTED");

    if (isPendingHOD && isHOD) {
      actionRowHTML = `
        <div class="timeline-actions-row">
          <span class="description"><strong>HOD Review Pending:</strong> Review the vehicle request from your department.</span>
          <div class="btn-group">
            <button class="btn btn-secondary btn-reject" onclick="processWorkflowAction('${req.id}', 'reject')">Reject</button>
            <button class="btn btn-primary btn-approve" onclick="processWorkflowAction('${req.id}', 'approve')">Approve</button>
          </div>
        </div>
      `;
    } else if (isHODApproved && isTransport) {
      actionRowHTML = `
        <div class="timeline-actions-row" style="background-color: var(--secondary-alpha-10);">
          <span class="description"><strong>Transport Desk Allocation:</strong> Assign a vehicle and driver for this request.</span>
          <button class="btn btn-primary" onclick="openDriverAllocationForReq('${req.id}')">
            <i class="fa-solid fa-key"></i> Assign Vehicle & Driver
          </button>
        </div>
      `;
    } else if (isAssigned && (isTransport || isDriver)) {
      actionRowHTML = `
        <div class="timeline-actions-row" style="background-color: var(--primary-alpha-05);">
          <span class="description"><strong>Trip in Progress:</strong> Vehicle ${req.vehicleNo} with driver ${req.driverName} is assigned. Click below to complete trip.</span>
          <button class="btn btn-primary btn-approve" onclick="openDriverCompleteModal('${req.id}')">
            <i class="fa-solid fa-circle-check"></i> Complete Trip
          </button>
        </div>
      `;
    } else if (isCompleted) {
      actionRowHTML = `
        <div class="timeline-actions-row" style="background-color: var(--success-light); color: var(--success);">
          <span><i class="fa-solid fa-circle-check"></i> Trip completed. Vehicle: ${req.vehicleNo} | Driver: ${req.driverName}</span>
          <span style="font-weight:700;">₹${req.cost ? req.cost.toLocaleString("en-IN") : '0'}.00</span>
        </div>
      `;
    } else if (isRejected) {
      actionRowHTML = `
        <div class="timeline-actions-row" style="background-color: var(--danger-light); color: var(--danger);">
          <span><i class="fa-solid fa-circle-xmark"></i> Requisition rejected by HOD.</span>
        </div>
      `;
    } else if (isPendingHOD && isFaculty) {
      actionRowHTML = `
        <div class="timeline-actions-row" style="background-color: var(--warning-light); color: var(--accent-dark);">
          <span><i class="fa-solid fa-clock"></i> Awaiting HOD Approval.</span>
        </div>
      `;
    } else if (req.status === "HOD APPROVED" && isFaculty) {
      actionRowHTML = `
        <div class="timeline-actions-row" style="background-color: var(--info-light); color: var(--info);">
          <span><i class="fa-solid fa-clock"></i> Approved by HOD. Awaiting Transport Desk vehicle allocation.</span>
        </div>
      `;
    } else if (req.status === "VEHICLE ASSIGNED" && isFaculty) {
      actionRowHTML = `
        <div class="timeline-actions-row" style="background-color: var(--success-light); color: var(--success);">
          <span><i class="fa-solid fa-car"></i> Vehicle Assigned: <strong>${req.vehicleNo}</strong> | Driver: <strong>${req.driverName}</strong></span>
        </div>
      `;
    }

    // Status label colors
    let statusClass = "badge-pending";
    let displayStatus = req.status;
    if (req.status === "TRIP COMPLETED") { statusClass = "badge-completed"; displayStatus = "Trip Completed"; }
    else if (req.status === "VEHICLE ASSIGNED") { statusClass = "badge-progress"; displayStatus = "Vehicle Assigned"; }
    else if (req.status === "HOD APPROVED") { statusClass = "badge-approved"; displayStatus = "HOD Approved"; }
    else if (req.status === "REJECTED") { statusClass = "badge-rejected"; displayStatus = "Rejected"; }
    else if (req.status === "REQUEST SUBMITTED") { statusClass = "badge-pending"; displayStatus = "Pending HOD Approval"; }

    card.innerHTML = `
      <div class="timeline-card-header">
        <div class="timeline-meta">
          <h3>Req ID: ${req.id} — Route: ${req.destLoc || req.destination}</h3>
          <p>Passenger: <strong>${req.employee_name || req.empName}</strong> | Mobile: ${req.mobile} | Dept: ${req.department}</p>
        </div>
        <span class="badge ${statusClass}">
          <span class="badge-dot"></span>
          ${displayStatus}
        </span>
      </div>

      <div class="timeline-steps">
        <div class="timeline-progress-line" style="--progress: ${progressPercent}%;"></div>
        ${stepsHTML}
      </div>

      ${actionRowHTML}
    `;

    container.appendChild(card);
  });
}

function processWorkflowAction(reqId, action) {
  const req = requisitions.find(r => r.id === reqId);
  if (!req) return;

  const session = localStorage.getItem(AUTH_KEY);
  if (!session) return;
  const user = JSON.parse(session);

  const url = action === "approve" ? "/hod/approve" : "/hod/reject";

  fetch(API_BASE + url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      request_id: req.request_id || req.id,
      hod_approved_by: user.employee_id || "HOD201"
    })
  })
    .then(res => {
      if (!res.ok) {
        return res.json().catch(() => ({ success: false, message: `Server status ${res.status}` }));
      }
      return res.json();
    })
    .then(data => {
      if (data.success) {
        const nowTime = new Date().toTimeString().slice(0, 5);
        if (action === "reject") {
          req.status = "REJECTED";
          req.logs.push({ step: "HOD Rejected", time: nowTime });
          showToast("toast-danger", `Requisition ${reqId} has been rejected.`);
        } else {
          req.status = "HOD APPROVED";
          req.logs.push({ step: "HOD Approved", time: nowTime });
          showToast("toast-success", `Requisition ${reqId} approved by HOD.`);
        }

        updateDashboardStats();
        renderRecentRequests();
        renderWorkflowTimeline(workflowFilter);
      } else {
        showToast("toast-danger", "Failed to update request: " + data.message);
      }
    })
    .catch(err => {
      console.warn("Server unreachable for approval, updating locally:", err);
      const nowTime = new Date().toTimeString().slice(0, 5);
      if (action === "reject") {
        req.status = "REJECTED";
        req.logs.push({ step: "HOD Rejected", time: nowTime });
        showToast("toast-danger", `Requisition ${reqId} has been rejected.`);
      } else {
        req.status = "HOD APPROVED";
        req.logs.push({ step: "HOD Approved", time: nowTime });
        showToast("toast-success", `Requisition ${reqId} approved by HOD.`);
      }

      updateDashboardStats();
      renderRecentRequests();
      renderWorkflowTimeline(workflowFilter);
    });
}

// Open Allocations modal pre-populated
let activeAllocationReqId = null;
function openDriverAllocationForReq(reqId) {
  activeAllocationReqId = reqId;
  const req = requisitions.find(r => r.id === reqId);
  if (!req) return;

  // Reset driver name input display
  document.getElementById("modal-driver-name").value = "";

  // Fetch the latest vehicles list to ensure we have the correct DB status
  const populateAssignOptions = () => {
    const select = document.getElementById("modal-select-vehicle");
    if (!select) return;
    select.innerHTML = "";

    const busyVehicles = requisitions
      .filter(r => r.status === "VEHICLE ASSIGNED")
      .map(r => r.vehicleNo);

    const availableVehicles = fleet.filter(v =>
      v.status === "Available" &&
      !busyVehicles.includes(v.vehicleNo)
    );

    if (availableVehicles.length === 0) {
      select.innerHTML = `<option value="" disabled selected>No Vehicles Available</option>`;
    } else {
      select.innerHTML = `<option value="" disabled selected>Select Fleet Vehicle:</option>`;
      availableVehicles.forEach(v => {
        const isSuggested = v.category === req.suggestedCategory ? " (Suggested)" : "";
        select.innerHTML += `<option value="${v.id}">${v.modelName} (${v.vehicleNo}) - ${v.category}${isSuggested} [Driver: ${v.driverName}]</option>`;
      });
    }



    document.getElementById("driver-assignment-modal").classList.add("active");
  };

  fetch(API_BASE + '/vehicles')
    .then(res => {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(data => {
      if (Array.isArray(data)) {
        fleet = data.map(v => ({
          id: String(v.id),
          vehicleNo: v.vehicle_no,
          modelName: v.model_name,
          category: v.vehicle_category,
          driverName: v.driver_name,
          driverMobNo: v.driver_mob_no,
          status: v.status,
          rate: v.vehicle_category === 'Hatchback' ? 8 : (v.vehicle_category === 'Sedan' ? 12 : (v.vehicle_category === 'Premium Sedan' ? 18 : (v.vehicle_category === 'SUV' ? 18 : 35)))
        }));
      }
      populateAssignOptions();
    })
    .catch(err => {
      console.warn("Could not load vehicles from server, using local fleet:", err);
      populateAssignOptions();
    });
}

function closeDriverModal() {
  document.getElementById("driver-assignment-modal").classList.remove("active");
  activeAllocationReqId = null;
}

function handleDriverAssignment(event) {
  event.preventDefault();
  const vehicleId = document.getElementById("modal-select-vehicle").value;
  const driverName = document.getElementById("modal-driver-name").value;


  if (!vehicleId || !driverName) {
    showToast("toast-danger", "Please select a vehicle and a driver.");
    return;
  }

  const v = fleet.find(veh => veh.id === vehicleId);
  const req = requisitions.find(r => r.id === activeAllocationReqId);
  const session = localStorage.getItem(AUTH_KEY);
  const user = session ? JSON.parse(session) : { employee_id: "TD301" };

  if (v && req) {
    fetch(API_BASE + '/transport/assign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        request_id: req.request_id || req.id,
        vehicle_number: v.vehicleNo,
        driver_name: driverName,
        assigned_by: user.employee_id || 'TO301'
      })
    })
      .then(res => {
        if (!res.ok) {
          return res.json().catch(() => ({ success: false, message: `Server status ${res.status}` }));
        }
        return res.json();
      })
      .then(data => {
        if (data.success) {
          // Update vehicle
          v.status = "On Trip";
          v.driverName = driverName;

          // Update Requisition
          req.status = "VEHICLE ASSIGNED";
          req.driverName = driverName;
          req.logs.push({ step: "Vehicle Allocated", time: new Date().toTimeString().slice(0, 5) });

          showToast("toast-success", `Vehicle ${v.vehicleNo} and driver ${driverName} assigned to Requisition ${req.id}.`);

          // Close modal & update lists
          closeDriverModal();
          updateDashboardStats();
          renderRecentRequests();
          renderWorkflowTimeline(workflowFilter);
        } else {
          showToast("toast-danger", "Failed to assign vehicle: " + (data.message || "Unknown error"));
        }
      })
      .catch(err => {
        console.warn("Backend unreachable for vehicle assignment, updating locally:", err);
        v.status = "On Trip";
        v.driverName = driverName;

        req.status = "VEHICLE ASSIGNED";
        req.driverName = driverName;
        req.vehicleNo = v.vehicleNo;
        req.logs.push({ step: "Vehicle Allocated", time: new Date().toTimeString().slice(0, 5) });

        showToast("toast-success", `Vehicle ${v.vehicleNo} and driver ${driverName} assigned to Requisition ${req.id}.`);

        closeDriverModal();
        updateDashboardStats();
        renderRecentRequests();
        renderWorkflowTimeline(workflowFilter);
      });
  }
}

function completeTrip(reqId) {
  const req = requisitions.find(r => r.id === reqId);
  if (!req) return;

  fetch(API_BASE + '/transport/update-status', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      request_id: req.request_id || req.id,
      status: 'TRIP COMPLETED'
    })
  })
    .then(res => {
      if (!res.ok) {
        return res.json().catch(() => ({ success: false, message: `Server status ${res.status}` }));
      }
      return res.json();
    })
    .then(data => {
      if (data.success) {
        // Release vehicle
        const v = fleet.find(veh => veh.vehicleNo === req.vehicleNo);
        if (v) {
          v.status = "Available";
          v.driverName = v.driverName.replace(" (Assigned)", "");
        }

        // Update Requisition
        req.status = "TRIP COMPLETED";
        req.logs.push({ step: "Trip Completed", time: new Date().toTimeString().slice(0, 5) });

        showToast("toast-success", `Trip for ${reqId} completed safely. Invoice generated.`);

        updateDashboardStats();
        renderRecentRequests();
        renderWorkflowTimeline(workflowFilter);
      } else {
        showToast("toast-danger", "Failed to complete trip: " + (data.message || "Unknown error"));
      }
    })
    .catch(err => {
      console.warn("Backend unreachable for completing trip, updating locally:", err);
      const v = fleet.find(veh => veh.vehicleNo === req.vehicleNo);
      if (v) {
        v.status = "Available";
        v.driverName = v.driverName.replace(" (Assigned)", "");
      }

      req.status = "TRIP COMPLETED";
      req.logs.push({ step: "Trip Completed", time: new Date().toTimeString().slice(0, 5) });

      showToast("toast-success", `Trip for ${reqId} completed safely.`);

      updateDashboardStats();
      renderRecentRequests();
      renderWorkflowTimeline(workflowFilter);
    });
}

// ----------------------------------------------------
// ANALYTICS & REPORTS (Chart.js implementation)
// ----------------------------------------------------
function destroyCharts() {
  Object.keys(charts).forEach(key => {
    if (charts[key]) {
      charts[key].destroy();
      charts[key] = null;
    }
  });
}

function initAnalyticsCharts() {
  destroyCharts();

  const isMobile = window.innerWidth <= 768;
  const legendPosition = isMobile ? 'bottom' : 'right';
  const legendBoxWidth = isMobile ? 8 : 12;
  const legendFontSize = isMobile ? 10 : 11;

  // Palette: Brand Red, Brand Yellow, Amber, Emerald, Dark Gray, Purple
  const palette = ["#D22630", "#FFCD00", "#F59E0B", "#10B981", "#4B5563", "#8B5CF6"];

  // 1. Monthly Vehicle Usage
  const ctxUsage = document.getElementById("chart-monthly-usage")?.getContext("2d");
  if (ctxUsage) {
    const labels = [];
    const data = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(d.toLocaleString('en-US', { month: 'short', year: 'numeric' }));

      const count = requisitions.filter(r => {
        if (r.status !== "TRIP COMPLETED" || !r.pickupTime) return false;
        const rDate = new Date(r.pickupTime);
        return rDate.getMonth() === d.getMonth() && rDate.getFullYear() === d.getFullYear();
      }).length;
      data.push(count);
    }

    charts.usage = new Chart(ctxUsage, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Total Trips Completed',
          data: data,
          backgroundColor: palette[0],
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: true, ticks: { precision: 0 } }
        }
      }
    });
  }

  // 2. Department-wise Requests
  const ctxDept = document.getElementById("chart-dept-requests")?.getContext("2d");
  if (ctxDept) {
    const deptLabels = ['Operations', 'Logistics', 'Quality Control', 'Human Resources', 'Finance', 'Others'];
    const deptData = deptLabels.map(dept => {
      if (dept === 'Others') {
        return requisitions.filter(r => !['Operations', 'Logistics', 'Quality Control', 'Human Resources', 'Finance'].includes(r.department || r.dept)).length;
      }
      return requisitions.filter(r => (r.department || r.dept) === dept).length;
    });

    charts.dept = new Chart(ctxDept, {
      type: 'doughnut',
      data: {
        labels: deptLabels,
        datasets: [{
          data: deptData,
          backgroundColor: palette,
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: legendPosition,
            labels: { boxWidth: legendBoxWidth, font: { family: 'Inter', size: legendFontSize } }
          }
        }
      }
    });
  }

  // 3. Vehicle Utilization Rates
  const ctxUtil = document.getElementById("chart-vehicle-utilization")?.getContext("2d");
  if (ctxUtil) {
    const categoryLabels = ['Hatchback', 'Sedan', 'Premium Sedan', 'SUV', 'Executive Vehicle'];
    const categoryData = categoryLabels.map(cat => {
      return requisitions.filter(r => (r.vehicle_category || r.suggestedCategory) === cat).length;
    });

    charts.util = new Chart(ctxUtil, {
      type: 'polarArea',
      data: {
        labels: categoryLabels,
        datasets: [{
          data: categoryData,
          backgroundColor: palette.map(color => color + 'cc')
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: legendPosition,
            labels: { boxWidth: legendBoxWidth, font: { family: 'Inter', size: legendFontSize } }
          }
        }
      }
    });
  }

  // 4. Top Destinations
  const ctxDest = document.getElementById("chart-destinations")?.getContext("2d");
  if (ctxDest) {
    const destCounts = {};
    requisitions.forEach(r => {
      const dLoc = (r.destination || r.destLoc || "").toUpperCase().trim();
      if (!dLoc) return;
      
      let norm = dLoc.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      
      if (dLoc.includes('PARI CHOWK')) norm = 'Pari Chowk';
      else if (dLoc.includes('KNOWLEDGE PARK')) norm = 'Knowledge Park';
      else if (dLoc.includes('NEW DELHI RAILWAY') || dLoc === 'NDLS') norm = 'New Delhi Railway Station';
      else if (dLoc.includes('SECTOR 62') || dLoc.includes('SEC 62') || dLoc.includes('SECTOR-62')) norm = 'Noida Sector 62';
      else if (dLoc.includes('SECTOR 18') || dLoc.includes('SEC 18') || dLoc.includes('SECTOR-18')) norm = 'Noida Sector 18';
      else if (dLoc.includes('IGI AIRPORT') || dLoc.includes('DELHI AIRPORT') || dLoc.includes('INDIRA GANDHI')) norm = 'IGI Airport';
      else if (dLoc.includes('GREATER NOIDA')) norm = 'Greater Noida';
      else if (dLoc.includes('NOIDA')) norm = 'Noida';
      else if (dLoc.includes('FARIDABAD')) norm = 'Faridabad';
      else if (dLoc.includes('GHAZIABAD')) norm = 'Ghaziabad';
      else if (dLoc.includes('ANAND VIHAR')) norm = 'Anand Vihar';
      else if (dLoc.includes('KASHMERE GATE') || dLoc.includes('ISBT')) norm = 'Kashmere Gate ISBT';
      else if (dLoc.includes('BENNETT') || dLoc === 'BU') norm = 'Bennett University';
      else if (dLoc.includes('NEW DELHI') || dLoc === 'DELHI') norm = 'New Delhi';
      
      destCounts[norm] = (destCounts[norm] || 0) + 1;
    });

    const sortedDests = Object.entries(destCounts).sort((a, b) => b[1] - a[1]);
    const destLabels = sortedDests.map(d => d[0]);
    const destData = sortedDests.map(d => d[1]);

    const containerDynamic = document.getElementById("dest-chart-container");
    if (containerDynamic) {
      const minHeight = Math.max(250, sortedDests.length * 35);
      containerDynamic.style.minHeight = `${minHeight}px`;
    }

    charts.dest = new Chart(ctxDest, {
      type: 'bar',
      data: {
        labels: destLabels,
        datasets: [{
          label: 'Number of Bookings',
          data: destData,
          backgroundColor: palette[1],
          borderRadius: 8
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { beginAtZero: true, ticks: { precision: 0 } }
        }
      }
    });
  }
}

// ----------------------------------------------------
// NOTIFICATION TOAST SYSTEM
// ----------------------------------------------------
function showToast(typeClass, message) {
  const holder = document.getElementById("toast-notification-holder");
  if (!holder) return;

  const toast = document.createElement("div");
  toast.className = `toast ${typeClass}`;

  let icon = "fa-bell";
  if (typeClass === "toast-success") icon = "fa-circle-check";
  else if (typeClass === "toast-danger") icon = "fa-circle-xmark";
  else if (typeClass === "toast-warning") icon = "fa-triangle-exclamation";
  else if (typeClass === "toast-info") icon = "fa-circle-info";

  toast.innerHTML = `
    <i class="fa-solid ${icon} toast-icon"></i>
    <div class="toast-message">${message}</div>
  `;

  holder.appendChild(toast);

  // Trigger Slide-in
  setTimeout(() => {
    toast.classList.add("active");
  }, 10);

  // Slide-out and remove
  setTimeout(() => {
    toast.classList.remove("active");
    setTimeout(() => {
      toast.remove();
    }, 400);
  }, 4000);
}

// ----------------------------------------------------
// EMERGENCY REQUEST BUTTON
// ----------------------------------------------------
function triggerEmergencyRequest() {
  const confirmEmergency = confirm("CRITICAL WARNING:\n\nAre you sure you want to trigger an Emergency Vehicle Requisition?\n\nThis will bypass HOD, Security, and Plant Head clearance pipelines and instantly allocate the first available dispatch vehicle.");

  if (confirmEmergency) {
    // Find first available vehicle
    const avVeh = fleet.find(v => v.status === "Available");
    if (!avVeh) {
      showToast("toast-danger", "Emergency Allocation Error: No vehicles available in active fleet! Dispatching standby vehicles manually.");
      return;
    }

    const newReq = {
      employee_id: "EMP101",
      employee_name: "Anoop Kumar",
      department: "Operations",
      mobile: "9829012345",
      plantLocation: "Sirohi Plant",
      journeyType: "Emergency Booking",
      purpose: "CRITICAL PLANT PIPELINE LEAK - EMERGENCY REPAIR",
      pickupLoc: "Sirohi Guest House",
      fromLoc: "JAYKAYPURAM",
      toLoc: "ABU ROAD",
      destLoc: "JAYKAYPURAM to ABU ROAD",
      passengers: 1,
      pickupTime: new Date().toISOString().slice(0, 16),
      returnTime: new Date(Date.now() + 14400000).toISOString().slice(0, 16), // 4 hours from now
      remarks: "EMERGENCY BYPASS TRIGGERED.",
      suggestedCategory: avVeh.category,
      distance: 25,
      cost: 25 * avVeh.rate,
      status: "VEHICLE ASSIGNED",
      driverName: "Vijay Yadav",
      vehicleNo: avVeh.vehicleNo,
      logs: [
        { step: "Emergency Triggered", time: new Date().toTimeString().slice(0, 5) },
        { step: "Bypassed Approvals", time: new Date().toTimeString().slice(0, 5) },
        { step: "Vehicle Allocated", time: new Date().toTimeString().slice(0, 5) }
      ]
    };

    fetch(API_BASE + '/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newReq)
    })
      .then(res => res.json())
      .then(resData => {
        if (resData.success) {
          // Update fleet vehicle status
          avVeh.status = "On Trip";
          avVeh.driverName = "Vijay Yadav";

          requisitions.push(resData.request);

          notifications.unshift({
            id: notifications.length + 1,
            type: "danger",
            title: "EMERGENCY BYPASS",
            desc: `Req ${resData.request.id} bypassed workflow. SUV dispatched to Abu Road.`,
            time: "Just now"
          });

          updateDashboardStats();
          renderRecentRequests();
          renderNotificationsFeed();

          showToast("toast-danger", `EMERGENCY REQUEST FILED: Dispatching ${avVeh.modelName} (${avVeh.vehicleNo}) immediately.`);
          sendSMSNotification(resData.request, "Vijay Yadav", avVeh.vehicleNo, avVeh.modelName);

          switchView("workflow");
        } else {
          showToast("toast-danger", "Failed to trigger emergency request: " + resData.message);
        }
      })
      .catch(err => {
        console.error(err);
        showToast("toast-danger", "Server error triggering emergency request.");
      });
  }
}

// ----------------------------------------------------
// EXPORT REPORTS MODULE (Excel & Preview handlers)
// ----------------------------------------------------
function openDownloadReportModal() {
  document.getElementById("download-report-form").reset();
  document.getElementById("report-preview-section").style.display = "none";
  document.getElementById("report-preview-table-body").innerHTML = "";

  // Set default date range to current month
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

  document.getElementById("report-from-date").value = firstDay;
  document.getElementById("report-to-date").value = lastDay;

  document.getElementById("download-report-modal").classList.add("active");
}

function closeDownloadReportModal() {
  document.getElementById("download-report-modal").classList.remove("active");
}

function generateReportPreview() {
  const fromDate = document.getElementById("report-from-date").value;
  const toDate = document.getElementById("report-to-date").value;
  const dept = document.getElementById("report-dept").value;
  const category = document.getElementById("report-category").value;
  const empId = document.getElementById("report-employee-id").value;

  if (!fromDate || !toDate) {
    showToast("toast-warning", "From Date and To Date are required for preview.");
    return;
  }

  const params = new URLSearchParams({
    from_date: fromDate,
    to_date: toDate
  });
  if (dept) params.append("department", dept);
  if (category) params.append("vehicle_category", category);
  if (empId) params.append("employee_id", empId);

  const statusMsgEl = document.getElementById("report-preview-status");
  const tableBodyEl = document.getElementById("report-preview-table-body");
  const sectionEl = document.getElementById("report-preview-section");

  statusMsgEl.innerText = "Fetching report preview...";
  tableBodyEl.innerHTML = "";
  sectionEl.style.display = "block";

  fetch(`${API_BASE}/reports/preview?${params.toString()}`)
    .then(res => res.json())
    .then(records => {
      if (records && records.length > 0) {
        statusMsgEl.innerHTML = `<span style="color: #28a745; font-weight: 700;">${records.length} matching requests found.</span>`;
        records.slice(0, 5).forEach(r => {
          const destStr = r.destination || r.destLoc || '';
          tableBodyEl.innerHTML += `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
              <td style="padding: 8px;">${r.requisition_no || r.id}</td>
              <td style="padding: 8px;">${r.employee_name} (${r.employee_id})</td>
              <td style="padding: 8px;">${destStr}</td>
              <td style="padding: 8px;"><span style="font-weight:600;">${r.status}</span></td>
            </tr>
          `;
        });
        if (records.length > 5) {
          tableBodyEl.innerHTML += `
            <tr>
              <td colspan="4" style="text-align: center; padding: 8px; color: var(--text-muted); font-style: italic;">
                ... and ${records.length - 5} more records
              </td>
            </tr>
          `;
        }
      } else {
        statusMsgEl.innerHTML = `<span style="color: var(--accent-color); font-weight: 700;">No matching records found.</span>`;
      }
    })
    .catch(err => {
      console.error(err);
      statusMsgEl.innerHTML = `<span style="color: var(--danger); font-weight: 700;">Error fetching preview.</span>`;
    });
}

function handleDownloadReport(event) {
  event.preventDefault();

  const fromDate = document.getElementById("report-from-date").value;
  const toDate = document.getElementById("report-to-date").value;
  const dept = document.getElementById("report-dept").value;
  const category = document.getElementById("report-category").value;
  const empId = document.getElementById("report-employee-id").value;

  if (!fromDate || !toDate) {
    showToast("toast-warning", "From Date and To Date are required.");
    return;
  }

  const params = new URLSearchParams({
    from_date: fromDate,
    to_date: toDate
  });
  if (dept) params.append("department", dept);
  if (category) params.append("vehicle_category", category);
  if (empId) params.append("employee_id", empId);

  const downloadUrl = `${API_BASE}/reports/export?${params.toString()}`;
  window.location.href = downloadUrl;

  closeDownloadReportModal();
  showToast("toast-success", "Excel report download initiated.");
}

function handleDownloadPDF(event) {
  event.preventDefault();

  const fromDate = document.getElementById("report-from-date").value;
  const toDate = document.getElementById("report-to-date").value;
  const dept = document.getElementById("report-dept").value;
  const category = document.getElementById("report-category").value;
  const empId = document.getElementById("report-employee-id").value;

  if (!fromDate || !toDate) {
    showToast("toast-warning", "From Date and To Date are required.");
    return;
  }

  const params = new URLSearchParams({
    from_date: fromDate,
    to_date: toDate
  });
  if (dept) params.append("department", dept);
  if (category) params.append("vehicle_category", category);
  if (empId) params.append("employee_id", empId);

  showToast("toast-info", "Generating PDF report...");

  fetch(`${API_BASE}/reports/preview?${params.toString()}`)
    .then(res => res.json())
    .then(records => {
      if (!records || records.length === 0) {
        showToast("toast-warning", "No records found to download in PDF.");
        return;
      }

      // Initialize jsPDF
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF('l', 'mm', 'a4');

      // Escaping helper
      const cleanText = (str) => {
        if (!str) return '';
        return String(str);
      };

      // Calculate Metrics
      const generatedDate = new Date().toLocaleDateString('en-IN') + ' ' + new Date().toLocaleTimeString('en-IN');
      const approved = records.filter(r => r.status === 'HOD APPROVED' || r.status === 'APPROVED').length;
      const pending = records.filter(r => r.status === 'REQUEST SUBMITTED' || r.status === 'PENDING').length;
      const rejected = records.filter(r => r.status === 'REJECTED').length;
      const allocated = records.filter(r => r.status === 'VEHICLE ASSIGNED' || r.status === 'TRIP COMPLETED').length;
      const uniqueEmps = new Set(records.map(r => r.employee_id).filter(Boolean)).size;

      // Draw Title & Header Banner
      doc.setFillColor(31, 78, 121);
      doc.rect(0, 0, 297, 24, 'F');

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text("Bennett University - Campus Transport Report", 14, 16);

      // Draw Summary Box (Two columns layout)
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.text("Report Summary", 14, 34);
      doc.setDrawColor(220, 220, 220);
      doc.line(14, 36, 283, 36);

      doc.setFont("helvetica", "normal");
      doc.text(`Report Period: ${fromDate} to ${toDate}`, 14, 43);
      doc.text(`Report Generated Date: ${generatedDate}`, 14, 49);
      doc.text(`Total Requests: ${records.length}`, 14, 55);
      doc.text(`Total Employees Served: ${uniqueEmps}`, 14, 61);

      doc.text(`Approved Requests: ${approved}`, 150, 43);
      doc.text(`Pending Requests: ${pending}`, 150, 49);
      doc.text(`Rejected Requests: ${rejected}`, 150, 55);
      doc.text(`Allocated Requests: ${allocated}`, 150, 61);

      // Map rows data for AutoTable
      const tableRows = records.map(r => {
        const formatDate = (date) => {
          if (!date) return '';
          try {
            return new Date(date).toISOString().split('T')[0];
          } catch (e) { return ''; }
        };
        const formatTime = (date) => {
          if (!date) return '';
          try {
            const d = new Date(date);
            return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
          } catch (e) { return ''; }
        };

        let reqStatus = r.status;
        let allocStatus = 'Pending';
        if (r.status === 'VEHICLE ASSIGNED') {
          allocStatus = 'Allocated';
          reqStatus = 'Approved';
        } else if (r.status === 'TRIP COMPLETED') {
          allocStatus = 'Completed';
          reqStatus = 'Approved';
        } else if (r.status === 'HOD APPROVED' || r.status === 'APPROVED') {
          reqStatus = 'Approved';
        } else if (r.status === 'REJECTED') {
          allocStatus = 'Cancelled';
        } else if (r.status === 'REQUEST SUBMITTED') {
          reqStatus = 'Pending';
        }

        return [
          cleanText(r.requisition_no || r.id || ''),
          cleanText(formatDate(r.created_at)),
          cleanText(r.employee_id || ''),
          cleanText(r.employee_name || ''),
          cleanText(r.department || ''),
          cleanText(r.mobile_number || ''),
          cleanText(r.journey_type || ''),
          cleanText(r.category || ''),
          cleanText(r.purpose || ''),
          cleanText(r.pickup_point || ''),
          cleanText(r.drop_point || ''),
          cleanText(formatDate(r.pickup_datetime)),
          cleanText(formatTime(r.pickup_datetime)),
          cleanText(formatDate(r.return_datetime)),
          cleanText(formatTime(r.return_datetime)),
          cleanText(r.passengers !== null && r.passengers !== undefined ? r.passengers : 0),
          cleanText(r.guest_name || ''),
          cleanText(r.guest_mobile || ''),
          cleanText(r.remarks || ''),
          cleanText(reqStatus),
          cleanText(allocStatus),
          cleanText(r.vehicle_number || ''),
          cleanText(r.driver_name || ''),
          cleanText(r.DRIMOBNO || r.driver_mobile || ''),
          cleanText(formatDate(r.assigned_at)),
          cleanText(r.employee_id || ''),
          cleanText(formatDate(r.assigned_at || r.created_at))
        ];
      });

      const headers = [
        "Requisition Number (REQ No.)", "Request Date (REQ Date)", "Employee ID", "Employee Name", "Department",
        "Mobile Number", "Journey Type", "Vehicle Category", "Purpose of Request",
        "Pickup Location", "Drop Location", "Pickup Date", "Pickup Time", "Return Date",
        "Return Time", "Passenger Count", "Guest Name", "Guest Mobile", "Request Remarks",
        "Request Status", "Allocation Status", "Assigned Vehicle Number", "Assigned Driver",
        "Driver Mobile", "Allocation Date", "Created By", "Last Updated Date"
      ];

      // Render Table
      doc.autoTable({
        startY: 68,
        head: [headers],
        body: tableRows,
        theme: 'grid',
        styles: { fontSize: 4, font: 'helvetica', cellPadding: 0.5, overflow: 'linebreak' },
        headStyles: { fillColor: [31, 78, 121], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 4, cellPadding: 0.5 },
        didParseCell: function (data) {
          if (data.section === 'body') {
            if (data.column.index === 20) {
              const val = data.cell.raw;
              if (val === 'Approved') {
                data.cell.styles.textColor = [0, 97, 0];
                data.cell.styles.fillColor = [198, 239, 206];
              } else if (val === 'Pending') {
                data.cell.styles.textColor = [156, 101, 0];
                data.cell.styles.fillColor = [255, 235, 156];
              } else if (val === 'Rejected') {
                data.cell.styles.textColor = [156, 0, 6];
                data.cell.styles.fillColor = [255, 199, 206];
              }
            }
            if (data.column.index === 21) {
              const val = data.cell.raw;
              if (val === 'Allocated' || val === 'Completed') {
                data.cell.styles.textColor = [0, 32, 96];
                data.cell.styles.fillColor = [221, 235, 247];
              } else if (val === 'Pending') {
                data.cell.styles.textColor = [156, 101, 0];
                data.cell.styles.fillColor = [255, 235, 156];
              } else if (val === 'Cancelled') {
                data.cell.styles.textColor = [156, 0, 6];
                data.cell.styles.fillColor = [255, 199, 206];
              }
            }
          }
        }
      });

      doc.save(`Vehicle_Requisition_Report_${fromDate}_to_${toDate}.pdf`);
      closeDownloadReportModal();
      showToast("toast-success", "PDF report downloaded successfully.");
    })
    .catch(err => {
      console.error(err);
      showToast("toast-danger", "Server error preparing PDF download.");
    });
}

function renderFleetTable() {
  const countBadge = document.getElementById("fleet-count-badge");
  if (countBadge) countBadge.innerText = `Total: ${fleet.length} vehicles`;

  const session = localStorage.getItem(AUTH_KEY);
  let userRole = "";
  if (session) {
    try {
      userRole = JSON.parse(session).role;
    } catch (e) { }
  }

  const tbody = document.querySelector("#registered-vehicles-table tbody");
  if (tbody) {
    tbody.innerHTML = "";
    if (!fleet || fleet.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-muted); padding:20px;">No vehicles registered.</td></tr>`;
    } else {
      fleet.forEach(v => {
        let badgeClass = "badge-pending";
        if (v.status === "Available") badgeClass = "badge-approved";
        else if (v.status === "On Trip") badgeClass = "badge-progress";
        else if (v.status === "Maintenance") badgeClass = "badge-rejected";

        let maintSelectHTML = "";
        if (v.status !== "On Trip" && (userRole === "TransportDesk" || userRole === "TransportOffice")) {
          maintSelectHTML = `
            <div class="status-checkbox-wrapper" data-status="${v.status}">
              <select class="status-checkbox-select" onchange="handleStatusOrDelete('${v.vehicleNo}', this)">
                <option value="Available" ${v.status === 'Available' ? 'selected' : ''}>Available</option>
                <option value="Maintenance" ${v.status === 'Maintenance' ? 'selected' : ''}>Maintenance</option>
                <option value="Delete" style="color: #ef4444 !important; font-weight: 600;">Delete Vehicle</option>
              </select>
            </div>
          `;
        }

        tbody.innerHTML += `
          <tr>
            <td data-label="Vehicle No"><strong>${v.vehicleNo}</strong></td>
            <td data-label="Model & Category">
              <div style="font-weight:600;">${v.modelName}</div>
              <div style="font-size:11px; color:var(--text-muted);">${v.category}</div>
            </td>
            <td data-label="Driver Info">
              <div style="font-weight:600;">${v.driverName}</div>
              <div style="font-size:11px; color:var(--text-muted);">${v.driverMobNo || ''}</div>
            </td>
            <td data-label="Status">
              <div style="display: flex; align-items: center; justify-content: flex-end;">
                <span class="badge ${badgeClass}">
                  <span class="badge-dot"></span>
                  ${v.status}
                </span>
              </div>
            </td>
            <td data-label="Actions" style="text-align: center; display: flex; justify-content: flex-end; align-items: center;">
              ${maintSelectHTML || '—'}
            </td>
          </tr>
        `;
      });
    }
  }
}

function loadVehicles() {
  fetch(API_BASE + '/vehicles')
    .then(res => {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(data => {
      if (Array.isArray(data)) {
        fleet = data.map(v => ({
          id: String(v.id),
          vehicleNo: v.vehicle_no,
          modelName: v.model_name,
          category: v.vehicle_category,
          driverName: v.driver_name,
          driverMobNo: v.driver_mob_no,
          status: v.status,
          rate: v.vehicle_category === 'Hatchback' ? 8 : (v.vehicle_category === 'Sedan' ? 12 : (v.vehicle_category === 'Premium Sedan' ? 18 : (v.vehicle_category === 'SUV' ? 18 : 35)))
        }));
      }
      renderFleetTable();
    })
    .catch(err => {
      console.warn("Could not load vehicles from server, using local fleet state:", err);
      renderFleetTable();
    });
}

function toggleVehicleMaintenance(vehicleNo, isMaintenance) {
  const status = isMaintenance ? 'Maintenance' : 'Available';

  fetch(API_BASE + '/vehicles/update-status', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      vehicle_no: vehicleNo,
      status: status
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showToast("toast-success", `Vehicle ${vehicleNo} status updated to ${status}.`);
        loadVehicles(); // Reload vehicle fleet to update table and statuses
      } else {
        showToast("toast-danger", "Failed to update vehicle status: " + data.message);
      }
    })
    .catch(err => {
      console.error(err);
      showToast("toast-danger", "Server error updating vehicle status.");
    });
}

function handleStatusOrDelete(vehicleNo, selectEl) {
  const val = selectEl.value;
  if (val === 'Delete') {
    // Revert visually to the previous state temporarily in case deletion is cancelled
    const currentStatus = selectEl.closest('.status-checkbox-wrapper').getAttribute('data-status');
    selectEl.value = currentStatus;

    if (confirm(`Are you sure you want to delete/remove vehicle ${vehicleNo} from the registered fleet?`)) {
      deleteVehicleFromFleet(vehicleNo);
    }
  } else {
    toggleVehicleMaintenance(vehicleNo, val === 'Maintenance');
  }
}

function deleteVehicleFromFleet(vehicleNo) {
  fetch(API_BASE + '/vehicles/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      vehicle_no: vehicleNo
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showToast("toast-success", `Vehicle ${vehicleNo} deleted successfully.`);
        loadVehicles(); // Refresh the list
      } else {
        showToast("toast-danger", "Failed to delete vehicle: " + data.message);
      }
    })
    .catch(err => {
      console.error("Error deleting vehicle:", err);
      showToast("toast-danger", "Server error deleting vehicle.");
    });
}

// Bind to window so inline handlers can access them
window.handleStatusOrDelete = handleStatusOrDelete;
window.deleteVehicleFromFleet = deleteVehicleFromFleet;



function handleVehicleRegistration(event) {
  event.preventDefault();
  const vehicleNo = document.getElementById("reg-veh-no").value.trim().toUpperCase();
  const modelName = document.getElementById("reg-veh-model").value.trim();
  const category = document.getElementById("reg-veh-category").value;
  const driverName = document.getElementById("reg-veh-driver").value.trim();
  const driverMob = document.getElementById("reg-veh-driver-mob").value.trim();

  if (!vehicleNo || !modelName || !category || !driverName || !driverMob) {
    showToast("toast-danger", "Please fill in all required fields.");
    return;
  }

  // Mobile number validation (10 digits)
  if (!/^\d{10}$/.test(driverMob)) {
    showToast("toast-danger", "Please enter a valid 10-digit mobile number.");
    return;
  }

  fetch(API_BASE + '/vehicles', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      driver_name: driverName,
      vehicle_no: vehicleNo,
      driver_mob_no: driverMob,
      vehicle_category: category,
      model_name: modelName
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showToast("toast-success", `Vehicle ${vehicleNo} successfully registered!`);
        document.getElementById("register-vehicle-form").reset();
        loadVehicles(); // Refresh the list
      } else {
        showToast("toast-danger", `Error: ${data.message}`);
      }
    })
    .catch(err => {
      console.error("Error registering vehicle:", err);
      showToast("toast-danger", "Failed to register vehicle on server.");
    });
}

function toggleSidebar(event) {
  if (event) event.stopPropagation();
  const sidebar = document.getElementById("app-sidebar");
  const overlay = document.getElementById("sidebar-overlay");
  if (sidebar && overlay) {
    sidebar.classList.toggle("open");
    overlay.classList.toggle("active");
  }
}
window.toggleSidebar = toggleSidebar;

// Resize listener to adjust chart layout dynamically
window.addEventListener('resize', () => {
  const analyticsSection = document.getElementById("view-analytics");
  if (analyticsSection && analyticsSection.classList.contains("active")) {
    clearTimeout(window.resizeChartTimeout);
    window.resizeChartTimeout = setTimeout(() => {
      const activeSection = document.getElementById("view-analytics");
      if (activeSection && activeSection.classList.contains("active")) {
        initAnalyticsCharts();
      }
    }, 250);
  }
});

// Driver Complete Trip Logic
let activeCompleteReqId = null;

function openDriverCompleteModal(reqId) {
  const req = requisitions.find(r => String(r.id) === String(reqId));
  if (!req) return;

  activeCompleteReqId = reqId;
  document.getElementById("complete-modal-req-id").innerText = req.id;
  document.getElementById("complete-modal-route").innerText = `${req.pickup} to ${req.dropoff}`;
  document.getElementById("complete-modal-vehicle").innerText = req.vehicleNo;

  document.getElementById("driver-complete-modal").classList.add("active");
}

function closeDriverCompleteModal() {
  document.getElementById("driver-complete-modal").classList.remove("active");
  activeCompleteReqId = null;
}

function confirmDriverCompleteTrip() {
  if (!activeCompleteReqId) return;

  const req = requisitions.find(r => String(r.id) === String(activeCompleteReqId));
  if (!req) return;

  const session = localStorage.getItem(AUTH_KEY);
  if (!session) return;
  const user = JSON.parse(session);

  const btn = document.getElementById("btn-confirm-complete-trip");
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Completing...';
  btn.disabled = true;

  fetch(API_BASE + '/driver/trip-status', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-employee-id': user.employee_id
    },
    body: JSON.stringify({
      request_id: req.request_id || req.id,
      trip_status: 'Complete Trip',
      driver_id: user.employee_id
    })
  })
    .then(res => res.json().then(data => ({ status: res.status, ok: res.ok, body: data })))
    .then(response => {
      if (!response.ok) {
        showToast("toast-danger", response.body.message || "Failed to complete trip.");
      } else {
        showToast("toast-success", "Trip successfully completed!");
        // Update locally
        req.status = "TRIP COMPLETED";
        req.logs.push({ step: "Trip Completed", time: new Date().toTimeString().slice(0, 5) });
        const v = fleet.find(veh => veh.vehicleNo === req.vehicleNo);
        if (v) v.status = "Available";
        
        closeDriverCompleteModal();
        updateDashboardStats();
        renderRecentRequests();
        renderWorkflowTimeline(workflowFilter);
      }
    })
    .catch(err => {
      console.error("Error completing trip:", err);
      showToast("toast-danger", "Server error completing trip.");
    })
    .finally(() => {
      btn.innerHTML = '<i class="fa-solid fa-check"></i> Complete Trip';
      btn.disabled = false;
    });
}
window.openDriverCompleteModal = openDriverCompleteModal;
window.closeDriverCompleteModal = closeDriverCompleteModal;
window.confirmDriverCompleteTrip = confirmDriverCompleteTrip;
