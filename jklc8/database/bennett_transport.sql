-- =========================================================
-- DATABASE: bennett_transport_portal
-- Bennett University Campus Transport Management System
-- =========================================================

CREATE DATABASE IF NOT EXISTS `bennett_transport_portal`;
USE `bennett_transport_portal`;

-- Drop existing tables to ensure clean recreation (order is important due to Foreign Keys)
DROP TABLE IF EXISTS trip_logs;
DROP TABLE IF EXISTS driver_profiles;
DROP TABLE IF EXISTS vehicle_allocations;
DROP VIEW IF EXISTS vehreq;
DROP VIEW IF EXISTS vechreq;
DROP TABLE IF EXISTS vehicle_requests;
DROP TABLE IF EXISTS vehreq;
DROP TABLE IF EXISTS vechreq;
DROP TABLE IF EXISTS vehicle_request_dummy;
DROP TABLE IF EXISTS veh_details;
DROP TABLE IF EXISTS employees;

-- Optional cleanup of old unused tables if present
DROP TABLE IF EXISTS vehicle_type;
DROP TABLE IF EXISTS vehicle_type_category;

-- =========================================================
-- TABLE 1: employees (serves all roles: Faculty, HOD, TransportOffice, Driver)
-- =========================================================
CREATE TABLE IF NOT EXISTS employees (
  employee_id VARCHAR(50) PRIMARY KEY,
  employee_name VARCHAR(100) NOT NULL,
  department VARCHAR(100) NOT NULL,
  designation VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL,
  password VARCHAR(100) NOT NULL,
  mobile VARCHAR(20) NOT NULL
);

-- =========================================================
-- TABLE 2: vechreq (Single Request Forms Storage Table)
-- =========================================================
CREATE TABLE IF NOT EXISTS vechreq (
  LOCATION VARCHAR(100) DEFAULT NULL,
  REQLOCATION VARCHAR(100) DEFAULT NULL,
  REQNO VARCHAR(50) NOT NULL,
  REQDT date DEFAULT NULL,
  REQTYP varchar(50) DEFAULT NULL,
  LOCOFLG varchar(10) DEFAULT NULL,
  FROMDEST VARCHAR(100) DEFAULT NULL,
  TODEST VARCHAR(100) DEFAULT NULL,
  FROMDATE datetime DEFAULT NULL,
  TODATE datetime DEFAULT NULL,
  DETAILS varchar(100) DEFAULT NULL,
  NOPER int DEFAULT NULL,
  REQBY VARCHAR(50) DEFAULT NULL,
  DEDEMPCD varchar(6) DEFAULT NULL,
  RECOBY varchar(6) DEFAULT NULL,
  RECFLG varchar(10) DEFAULT NULL,
  RECREM varchar(80) DEFAULT NULL,
  APPBY varchar(6) DEFAULT NULL,
  APPFLG varchar(10) DEFAULT NULL,
  APPREM varchar(80) DEFAULT NULL,
  HIRED_FLAG char(1) DEFAULT NULL,
  SPAPP varchar(6) DEFAULT NULL,
  SPAPPFLG varchar(10) DEFAULT NULL,
  SPPREM varchar(80) DEFAULT NULL,
  GATEFLG varchar(10) DEFAULT NULL,
  GATEVEHFLG varchar(5) DEFAULT NULL,
  VEHNO varchar(20) DEFAULT NULL,
  GATEREM varchar(30) DEFAULT NULL,
  GATEDT date DEFAULT NULL,
  UNSCH char(1) DEFAULT NULL,
  LOPHNO varchar(10) DEFAULT NULL,
  MOBNO varchar(13) DEFAULT NULL,
  COMPNM varchar(50) DEFAULT NULL,
  GSTNM varchar(45) DEFAULT NULL,
  GSTCONTMOBNO varchar(13) DEFAULT NULL,
  PICKPOINT VARCHAR(100) DEFAULT NULL,
  DROPOINT VARCHAR(100) DEFAULT NULL,
  DRIMOBNO varchar(13) DEFAULT NULL,
  DRINAME varchar(50) DEFAULT NULL,
  HIRETYP varchar(10) DEFAULT NULL,
  SMSFLG char(1) DEFAULT NULL,
  FORTHEEMP varchar(100) DEFAULT NULL,
  CONSMSFLG char(1) DEFAULT NULL,
  SENDSMSFLG char(1) DEFAULT NULL,
  APP1 char(1) DEFAULT NULL,
  APP2 char(1) DEFAULT NULL,
  RETURNFLG char(1) DEFAULT NULL,
  NOPER1 int DEFAULT NULL,
  DEDAMT decimal(12,0) DEFAULT NULL,
  NOTI_TO varchar(20) DEFAULT NULL,
  NOTI_FLG char(1) DEFAULT NULL,
  COST_CENTER varchar(20) DEFAULT NULL,
  FARE_AMOUNT decimal(10,2) DEFAULT NULL,
  VRQ_CATG VARCHAR(50) DEFAULT NULL,
  VRQ_CATG_DESC VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (REQNO),
  UNIQUE KEY VEH_03102024 (REQNO, REQLOCATION),
  FOREIGN KEY (REQBY) REFERENCES employees(employee_id) ON DELETE CASCADE,
  INDEX idx_REQBY (REQBY),
  INDEX idx_APPFLG (APPFLG)
);

-- =========================================================
-- TABLE 3: vehicle_allocations
-- =========================================================
CREATE TABLE IF NOT EXISTS vehicle_allocations (
  allocation_id INT AUTO_INCREMENT PRIMARY KEY,
  REQNO VARCHAR(50) NOT NULL,
  vehicle_number VARCHAR(50) NOT NULL,
  driver_name VARCHAR(100) NOT NULL,
  assigned_by VARCHAR(50) NOT NULL,
  assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign key constraints
  FOREIGN KEY (REQNO) REFERENCES vechreq(REQNO) ON DELETE CASCADE,
  FOREIGN KEY (assigned_by) REFERENCES employees(employee_id) ON DELETE CASCADE,
  
  -- Indexes
  INDEX idx_REQNO (REQNO)
);

-- =========================================================
-- TABLE 4: vehicle_type_category (Trip Purpose Categories)
-- =========================================================
CREATE TABLE IF NOT EXISTS vehicle_type_category (
  sno VARCHAR(4) PRIMARY KEY,
  descr VARCHAR(255) NOT NULL
);

-- =========================================================
-- TABLE 5: vehicle_type
-- =========================================================
CREATE TABLE IF NOT EXISTS vehicle_type (
  name VARCHAR(100) NOT NULL,
  code VARCHAR(10) NOT NULL,
  plant VARCHAR(100) NOT NULL,
  app VARCHAR(50) NULL,
  orderby INT NOT NULL
);

-- =========================================================
-- TABLE 6: veh_details (Fleet Vehicles)
-- =========================================================
CREATE TABLE IF NOT EXISTS veh_details (
  id INT AUTO_INCREMENT PRIMARY KEY,
  driver_name VARCHAR(100) NOT NULL,
  vehicle_no VARCHAR(50) NOT NULL UNIQUE,
  driver_mob_no VARCHAR(20) NOT NULL,
  vehicle_category VARCHAR(50) NOT NULL,
  model_name VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- TABLE 7: driver_profiles (Extended Driver Info)
-- =========================================================
CREATE TABLE IF NOT EXISTS driver_profiles (
  driver_id VARCHAR(50) PRIMARY KEY,
  license_number VARCHAR(50) NOT NULL,
  license_type VARCHAR(50) DEFAULT 'Heavy Commercial',
  experience_years INT DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 4.5,
  total_trips INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'Available',
  FOREIGN KEY (driver_id) REFERENCES employees(employee_id) ON DELETE CASCADE
);

-- =========================================================
-- TABLE 8: trip_logs (Driver Trip Tracking)
-- =========================================================
CREATE TABLE IF NOT EXISTS trip_logs (
  log_id INT AUTO_INCREMENT PRIMARY KEY,
  REQNO VARCHAR(50) NOT NULL,
  driver_id VARCHAR(50) NOT NULL,
  trip_status VARCHAR(30) DEFAULT 'Assigned',
  start_odometer DECIMAL(10,1) DEFAULT NULL,
  end_odometer DECIMAL(10,1) DEFAULT NULL,
  fuel_consumed DECIMAL(8,2) DEFAULT NULL,
  fuel_cost DECIMAL(10,2) DEFAULT NULL,
  started_at DATETIME DEFAULT NULL,
  reached_at DATETIME DEFAULT NULL,
  completed_at DATETIME DEFAULT NULL,
  remarks TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (REQNO) REFERENCES vechreq(REQNO) ON DELETE CASCADE,
  FOREIGN KEY (driver_id) REFERENCES employees(employee_id) ON DELETE CASCADE,
  INDEX idx_driver (driver_id),
  INDEX idx_trip_status (trip_status)
);

-- =========================================================
-- SEED DATA: Bennett University Users
-- =========================================================

-- FACULTY USERS
INSERT INTO employees (employee_id, employee_name, department, designation, role, password, mobile)
VALUES 
('FAC101', 'Dr. Priya Sharma', 'SCSET', 'Associate Professor', 'Faculty', 'fac123', '9876501234')
ON DUPLICATE KEY UPDATE 
  employee_name = VALUES(employee_name),
  department = VALUES(department),
  designation = VALUES(designation),
  role = VALUES(role),
  password = VALUES(password),
  mobile = VALUES(mobile);

INSERT INTO employees (employee_id, employee_name, department, designation, role, password, mobile)
VALUES 
('FAC102', 'Dr. Amit Verma', 'School of Management', 'Assistant Professor', 'Faculty', 'fac456', '9876502345')
ON DUPLICATE KEY UPDATE 
  employee_name = VALUES(employee_name),
  department = VALUES(department),
  designation = VALUES(designation),
  role = VALUES(role),
  password = VALUES(password),
  mobile = VALUES(mobile);

INSERT INTO employees (employee_id, employee_name, department, designation, role, password, mobile)
VALUES 
('FAC103', 'Prof. Neha Gupta', 'School of Law', 'Professor', 'Faculty', 'fac789', '9876503456')
ON DUPLICATE KEY UPDATE 
  employee_name = VALUES(employee_name),
  department = VALUES(department),
  designation = VALUES(designation),
  role = VALUES(role),
  password = VALUES(password),
  mobile = VALUES(mobile);

-- HOD USERS (One per department)
INSERT INTO employees (employee_id, employee_name, department, designation, role, password, mobile)
VALUES 
('HOD201', 'Prof. Deepak Garg', 'SCSET', 'Dean & HOD - SCSET', 'HOD', 'hod123', '9876543210')
ON DUPLICATE KEY UPDATE 
  employee_name = VALUES(employee_name),
  department = VALUES(department),
  designation = VALUES(designation),
  role = VALUES(role),
  password = VALUES(password),
  mobile = VALUES(mobile);

INSERT INTO employees (employee_id, employee_name, department, designation, role, password, mobile)
VALUES 
('HOD202', 'Prof. Sunita Jain', 'School of Management', 'HOD - School of Management', 'HOD', 'hod456', '9876543211')
ON DUPLICATE KEY UPDATE 
  employee_name = VALUES(employee_name),
  department = VALUES(department),
  designation = VALUES(designation),
  role = VALUES(role),
  password = VALUES(password),
  mobile = VALUES(mobile);

INSERT INTO employees (employee_id, employee_name, department, designation, role, password, mobile)
VALUES 
('HOD203', 'Prof. Rajiv Menon', 'School of Law', 'HOD - School of Law', 'HOD', 'hod789', '9876543212')
ON DUPLICATE KEY UPDATE 
  employee_name = VALUES(employee_name),
  department = VALUES(department),
  designation = VALUES(designation),
  role = VALUES(role),
  password = VALUES(password),
  mobile = VALUES(mobile);

INSERT INTO employees (employee_id, employee_name, department, designation, role, password, mobile)
VALUES 
('HOD204', 'Prof. Kavita Sharma', 'School of Media', 'HOD - School of Media', 'HOD', 'hod101', '9876543213')
ON DUPLICATE KEY UPDATE 
  employee_name = VALUES(employee_name),
  department = VALUES(department),
  designation = VALUES(designation),
  role = VALUES(role),
  password = VALUES(password),
  mobile = VALUES(mobile);

INSERT INTO employees (employee_id, employee_name, department, designation, role, password, mobile)
VALUES 
('HOD205', 'Prof. Anand Prakash', 'School of Liberal Arts', 'HOD - School of Liberal Arts', 'HOD', 'hod102', '9876543214')
ON DUPLICATE KEY UPDATE 
  employee_name = VALUES(employee_name),
  department = VALUES(department),
  designation = VALUES(designation),
  role = VALUES(role),
  password = VALUES(password),
  mobile = VALUES(mobile);

-- TRANSPORT OFFICE USER
INSERT INTO employees (employee_id, employee_name, department, designation, role, password, mobile)
VALUES 
('TO301', 'Suresh Yadav', 'Transport Office', 'Transport Manager', 'TransportOffice', 'transport123', '9876544321')
ON DUPLICATE KEY UPDATE 
  employee_name = VALUES(employee_name),
  department = VALUES(department),
  designation = VALUES(designation),
  role = VALUES(role),
  password = VALUES(password),
  mobile = VALUES(mobile);

-- DRIVER USERS
INSERT INTO employees (employee_id, employee_name, department, designation, role, password, mobile)
VALUES 
('DRV401', 'Rajendra Kumar', 'Transport Office', 'Senior Driver', 'Driver', 'drv123', '9876545432')
ON DUPLICATE KEY UPDATE 
  employee_name = VALUES(employee_name),
  department = VALUES(department),
  designation = VALUES(designation),
  role = VALUES(role),
  password = VALUES(password),
  mobile = VALUES(mobile);

INSERT INTO employees (employee_id, employee_name, department, designation, role, password, mobile)
VALUES 
('DRV402', 'Mohan Singh', 'Transport Office', 'Driver', 'Driver', 'drv456', '9876546543')
ON DUPLICATE KEY UPDATE 
  employee_name = VALUES(employee_name),
  department = VALUES(department),
  designation = VALUES(designation),
  role = VALUES(role),
  password = VALUES(password),
  mobile = VALUES(mobile);

INSERT INTO employees (employee_id, employee_name, department, designation, role, password, mobile)
VALUES 
('DRV403', 'Sunil Chauhan', 'Transport Office', 'Driver', 'Driver', 'drv789', '9876547654')
ON DUPLICATE KEY UPDATE 
  employee_name = VALUES(employee_name),
  department = VALUES(department),
  designation = VALUES(designation),
  role = VALUES(role),
  password = VALUES(password),
  mobile = VALUES(mobile);

-- =========================================================
-- SEED DATA: Trip Purpose Categories (Bennett University)
-- =========================================================
TRUNCATE TABLE vehicle_type_category;
INSERT INTO vehicle_type_category (sno, descr) VALUES
('100', 'Industrial Visit'),
('101', 'Hackathon / Technical Competition'),
('102', 'Research Visit'),
('103', 'Conference / Seminar'),
('104', 'Faculty Official Duty'),
('105', 'Placement Drive'),
('106', 'Guest Pickup / Drop'),
('107', 'Academic Collaboration Visit'),
('108', 'Workshop / FDP'),
('109', 'Club Event'),
('110', 'Cultural Event'),
('111', 'Sports Tournament'),
('112', 'NSS / Social Outreach Program'),
('113', 'Examination Duty'),
('114', 'University Administration Work'),
('115', 'Airport / Railway Station Pickup'),
('116', 'Medical Emergency'),
('117', 'Maintenance & Logistics'),
('118', 'Other Official Purpose')
ON DUPLICATE KEY UPDATE descr = VALUES(descr);

-- =========================================================
-- SEED DATA: Vehicle Types (Bennett University)
-- =========================================================
INSERT INTO vehicle_type (name, code, plant, app, orderby) VALUES
('OFFICIAL', 'O', 'Bennett University', '', 1),
('GUEST TRANSPORT', 'G', 'Bennett University', '', 2),
('FIELD VISIT', 'F', 'Bennett University', '', 3),
('EMERGENCY', 'E', 'Bennett University', '', 4),
('INTER-CAMPUS', 'I', 'Bennett University', '', 5);

-- =========================================================
-- SEED DATA: Fleet Vehicles (NCR Region Plates)
-- =========================================================
INSERT INTO veh_details (driver_name, vehicle_no, driver_mob_no, vehicle_category, model_name, status) VALUES
('Rajendra Kumar', 'UP-14-BU-1001', '9876545432', 'Sedan', 'Toyota Etios', 'Available'),
('Mohan Singh', 'UP-14-BU-1002', '9876546543', 'SUV', 'Toyota Innova Crysta', 'Available'),
('Sunil Chauhan', 'DL-4C-BU-2001', '9876547654', 'Premium Sedan', 'Honda City', 'Available'),
('Rajendra Kumar', 'UP-14-BU-1003', '9876545432', 'Bus', 'Force Traveller 26 Seater', 'Available'),
('Mohan Singh', 'UP-14-BU-1004', '9876546543', 'SUV', 'Mahindra XUV700', 'Available'),
('Sunil Chauhan', 'DL-4C-BU-2002', '9876547654', 'Hatchback', 'Maruti Suzuki Swift', 'Available')
ON DUPLICATE KEY UPDATE
  driver_name = VALUES(driver_name),
  driver_mob_no = VALUES(driver_mob_no),
  vehicle_category = VALUES(vehicle_category),
  model_name = VALUES(model_name),
  status = VALUES(status);

-- =========================================================
-- SEED DATA: Driver Profiles
-- =========================================================
INSERT INTO driver_profiles (driver_id, license_number, license_type, experience_years, rating, total_trips, status) VALUES
('DRV401', 'UP1420210012345', 'Heavy Commercial', 12, 4.8, 0, 'Available'),
('DRV402', 'UP1420190054321', 'Heavy Commercial', 8, 4.6, 0, 'Available'),
('DRV403', 'DL0420200067890', 'Light Commercial', 5, 4.7, 0, 'Available')
ON DUPLICATE KEY UPDATE
  license_number = VALUES(license_number),
  license_type = VALUES(license_type),
  experience_years = VALUES(experience_years),
  rating = VALUES(rating);

-- =========================================================
-- SEED DATA: Initial Vehicle Requests (vechreq)
-- =========================================================
INSERT INTO vechreq (
  LOCATION, REQLOCATION, REQNO, REQDT, REQTYP,
  FROMDEST, TODEST, FROMDATE, TODATE, PICKPOINT, DROPOINT,
  APPFLG, RECFLG, DETAILS, NOPER, REQBY, MOBNO, FORTHEEMP,
  VRQ_CATG, VRQ_CATG_DESC, COST_CENTER, FARE_AMOUNT, RETURNFLG,
  RECREM, GSTNM, GSTCONTMOBNO
) VALUES
(
  'Bennett University', 'Bennett University', '2026001', '2026-08-13', 'Official Visit',
  'BENNETT UNIVERSITY', 'IGI AIRPORT', '2026-08-14 09:00:00', '2026-08-14 18:00:00',
  'Gate 1 Bennett University', 'Terminal 3 IGI Airport',
  'APPROVED', 'PENDING', 'Guest Faculty Pickup for International Seminar', 2,
  'FAC101', '9876501234', 'FAC101', 'Sedan', 'Guest Pickup / Drop', '100', 1200.00, 1,
  'Guest arriving on AI-102 flight', 'Prof. John Smith', '9811223344'
),
(
  'Bennett University', 'Bennett University', '2026002', '2026-08-13', 'Official Visit',
  'BENNETT UNIVERSITY', 'NOIDA SECTOR 62', '2026-08-15 10:00:00', '2026-08-15 16:00:00',
  'Academic Block A', 'Noida Sector 62 Tech Park',
  'PENDING', 'PENDING', 'Industry Collaboration Visit for Research Project', 4,
  'FAC102', '9876502345', 'FAC102', 'SUV', 'Research Visit', '100', 850.00, 1,
  'Requires extra trunk space for lab equipment', '', ''
),
(
  'Bennett University', 'Bennett University', '2026003', '2026-08-13', 'Official Visit',
  'BENNETT UNIVERSITY', 'DELHI', '2026-08-16 08:30:00', '2026-08-16 20:00:00',
  'Bennett Campus Centre', 'Delhi Pragati Maidan',
  'APPROVED', 'PENDING', 'National Hackathon Delegation Transport', 8,
  'FAC103', '9876503456', 'FAC103', 'Bus', 'Hackathon / Technical Competition', '100', 2500.00, 1,
  'Student team delegation with 8 participants', '', ''
)
ON DUPLICATE KEY UPDATE
  LOCATION = VALUES(LOCATION),
  DETAILS = VALUES(DETAILS),
  APPFLG = VALUES(APPFLG);


