// backend/controllers/requestController.js
// Handles vehicle requisition processing, retrieval, and ID generation
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

const BENNETT_CATEGORIES = [
  { sno: '100', descr: 'Industrial Visit' },
  { sno: '101', descr: 'Hackathon / Technical Competition' },
  { sno: '102', descr: 'Research Visit' },
  { sno: '103', descr: 'Conference / Seminar' },
  { sno: '104', descr: 'Faculty Official Duty' },
  { sno: '105', descr: 'Placement Drive' },
  { sno: '106', descr: 'Guest Pickup / Drop' },
  { sno: '107', descr: 'Academic Collaboration Visit' },
  { sno: '108', descr: 'Workshop / FDP' },
  { sno: '109', descr: 'Club Event' },
  { sno: '110', descr: 'Cultural Event' },
  { sno: '111', descr: 'Sports Tournament' },
  { sno: '112', descr: 'NSS / Social Outreach Program' },
  { sno: '113', descr: 'Examination Duty' },
  { sno: '114', descr: 'University Administration Work' },
  { sno: '115', descr: 'Airport / Railway Station Pickup' },
  { sno: '116', descr: 'Medical Emergency' },
  { sno: '117', descr: 'Maintenance & Logistics' },
  { sno: '118', descr: 'Other Official Purpose' }
];

exports.getCategories = async (req, res) => {
  // Respond immediately to prevent any client hanging
  res.status(200).json(BENNETT_CATEGORIES);

  // Background DB category table sync
  try {
    const [rows] = await db.execute('SELECT * FROM vehicle_type_category ORDER BY sno;');
    const hasLegacy = rows.some(r => r.descr && (r.descr.includes('Govt') || r.descr.includes('Ladies') || r.descr.includes('CSR') || r.descr.includes('Banas') || r.descr.includes('HO Employees')));
    if (rows.length === 0 || hasLegacy) {
      await db.execute('DELETE FROM vehicle_type_category;');
      for (const cat of BENNETT_CATEGORIES) {
        await db.execute('INSERT INTO vehicle_type_category (sno, descr) VALUES (?, ?);', [cat.sno, cat.descr]);
      }
    }
  } catch (e) {
    // Non-blocking catch
  }
};

exports.createRequest = async (req, res) => {
  let requestData = null;
  let employee = null;
  let data = null;
  try {
    console.log('Incoming Form Payload (req.body):', req.body);
    data = req.body;

    // Validate user exists
    employee = await Employee.findById(data.employee_id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Faculty not found.' });
    }

    // Construct consolidated DATETIME fields
    const pickupDateStr = data.pickup_date;
    const pickupHourInt = data.pickup_hour;
    const pickupMinInt = data.pickup_minute;
    const pickup_datetime = (pickupDateStr && pickupHourInt !== undefined && pickupMinInt !== undefined)
      ? `${pickupDateStr} ${String(pickupHourInt).padStart(2, '0')}:${String(pickupMinInt).padStart(2, '0')}:00`
      : (data.pickupTime || data.pickup_datetime);

    const returnJourney = (data.returnJourneyRequired || data.return_journey_required);
    const returnDateStr = data.return_date;
    const returnHourInt = data.return_hour;
    const returnMinInt = data.return_minute;
    const return_datetime = (returnJourney && returnDateStr && returnHourInt !== undefined && returnMinInt !== undefined)
      ? `${returnDateStr} ${String(returnHourInt).padStart(2, '0')}:${String(returnMinInt).padStart(2, '0')}:00`
      : (returnJourney ? (data.returnTime || data.return_datetime) : null);

    // Validate date and time are not in the past (only if status is not 'Draft')
    if (data.status !== 'Draft') {
      const now = new Date();
      const pastLimit = new Date(now.getTime() - 5 * 60 * 1000); // 5-minute buffer

      if (pickup_datetime) {
        const pickupDateObj = new Date(String(pickup_datetime).replace(' ', 'T'));
        if (pickupDateObj < pastLimit) {
          return res.status(400).json({ success: false, message: 'Pickup date and time cannot be in the past.' });
        }

        if (returnJourney && return_datetime) {
          const returnDateObj = new Date(String(return_datetime).replace(' ', 'T'));
          if (returnDateObj < pastLimit) {
            return res.status(400).json({ success: false, message: 'Return date and time cannot be in the past.' });
          }
          if (returnDateObj <= pickupDateObj) {
            return res.status(400).json({ success: false, message: 'Return date and time must be after the pickup date and time.' });
          }
        }
      }
    }

    // Prepare data mapping for model
    requestData = {
      employee_id: data.employee_id || null,
      employee_name: employee.employee_name || null,
      department: employee.department || null,
      plant_location: data.plantLocation || data.plant_location || null,
      journey_type: data.journeyType || data.journey_type || null,
      pickup_point: data.pickupLoc || data.pickup_point || null,
      drop_point: data.dropLoc || data.drop_point || null,
      from_location: data.fromLoc || data.from_location || null,
      to_location: data.toLoc || data.to_location || null,
      purpose: data.purpose || null,
      pickup_datetime: pickup_datetime || null,
      return_datetime: return_datetime || null,
      passengers: data.passengers || 1,
      vehicle_category: data.suggestedCategory || data.vehicle_category || null,
      mobile_number: data.mobile || data.mobile_number || employee.mobile || null,
      remarks: data.remarks || null,
      status: data.status || 'REQUEST SUBMITTED',
      return_journey_required: returnJourney ? 1 : 0,
      travelling_with_guest: (data.travellingWithGuest || data.travelling_with_guest) ? 1 : 0,
      guest_name: (data.travellingWithGuest || data.travelling_with_guest) ? (data.guestName || data.guest_name || '') : '',
      guest_mobile: (data.travellingWithGuest || data.travelling_with_guest) ? (data.guestMobile || data.guest_mobile || '') : '',
      distance: data.distance || 0,
      cost: data.cost || 0.00,
      logs: data.logs || [{ step: 'Requested', time: new Date().toISOString().replace('T', ' ').slice(0, 16) }],
      created_at: new Date(),
      
      // New fields
      category: data.category || null,
      pickup_date: data.pickup_date || null,
      pickup_hour: data.pickup_hour !== undefined && data.pickup_hour !== null ? parseInt(data.pickup_hour, 10) : null,
      pickup_minute: data.pickup_minute !== undefined && data.pickup_minute !== null ? parseInt(data.pickup_minute, 10) : null,
      return_date: returnJourney ? (data.return_date || null) : null,
      return_hour: returnJourney && data.return_hour !== undefined && data.return_hour !== null ? parseInt(data.return_hour, 10) : null,
      return_minute: returnJourney && data.return_minute !== undefined && data.return_minute !== null ? parseInt(data.return_minute, 10) : null
    };

        // Check if there is an existing draft for this employee
    const existingDraft = await Request.findDraftByEmployeeId(data.employee_id);
    let reqNo;
    if (existingDraft) {
      reqNo = existingDraft.requisition_no || existingDraft.id;
      await Request.update(reqNo, requestData);
    } else {
      reqNo = await Request.create(requestData);
    }
    const createdRequest = await Request.findById(reqNo);

    // Audit Trail: Log REQUEST_SUBMITTED
    if (data.status !== 'Draft') {
      const authEmpId = req.headers['x-employee-id'] || data.employee_id;
      const actualReqNo = Request.getReqNo(reqNo);
      await db.execute(
        'INSERT INTO request_history (REQNO, action, performed_by, performed_at) VALUES (?, ?, ?, NOW())',
        [actualReqNo, 'REQUEST_SUBMITTED', authEmpId]
      );
    }

    return res.status(201).json({
      success: true,
      message: data.status === 'Draft' ? 'Draft requisition saved successfully.' : 'Vehicle request submitted successfully',
      requestNo: reqNo,
      request: formatRequest(createdRequest)
    });
  } catch (error) {
    console.error('Database insertion failed:', error);
    try {
      const logContent = `${new Date().toISOString()}\nError: ${error.message}\nStack: ${error.stack}\nData Sent: ${JSON.stringify(data, null, 2)}\nEmployee: ${JSON.stringify(employee, null, 2)}\nRequest Data: ${JSON.stringify(requestData || {}, null, 2)}\n`;
      require('fs').writeFileSync(require('path').join(__dirname, '../../error.log'), logContent);
    } catch (e) {
      console.error('Failed to write error log file:', e);
    }
    return res.status(500).json({ success: false, message: 'Database insertion failed: ' + error.message });
  }
};

exports.cancelRequest = async (req, res) => {
  try {
    const { request_id } = req.body;
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

    if (!requestId) {
      return res.status(400).json({ success: false, message: 'request_id is required.' });
    }

    const success = await Request.cancelRequest(requestId);
    if (success) {
      return res.status(200).json({ success: true, message: 'Request cancelled successfully.' });
    } else {
      return res.status(400).json({ success: false, message: 'Cannot cancel — request may already be approved or cancelled.' });
    }
  } catch (error) {
    console.error('Error cancelling request:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.getMyRequests = async (req, res) => {
  try {
    const employeeId = req.headers['x-employee-id'] || req.query.employeeId || req.query.employee_id;

    if (!employeeId) {
      return res.status(400).json({ success: false, message: 'User ID is required.' });
    }

    const rows = await Request.findByEmployeeId(employeeId);
    const formatted = rows.map(formatRequest);

    return res.status(200).json(formatted);
  } catch (error) {
    console.error('Error fetching requests:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.getRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    // Handle raw numeric, old REQ-2026-, old YYYY01XX, and new YYYYXXX ID formats
    let requestId = id;
    if (typeof id === 'string') {
      if (id.startsWith('REQ-2026-')) {
        requestId = parseInt(id.replace('REQ-2026-', ''), 10);
      } else if (/^\d{8}$/.test(id)) {
        requestId = parseInt(id.substring(6), 10);
      } else if (/^\d{7}$/.test(id)) {
        requestId = parseInt(id.substring(4), 10);
      } else if (/^\d+$/.test(id)) {
        requestId = parseInt(id, 10);
      }
    }

    const row = await Request.findById(requestId);

    if (!row) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    return res.status(200).json(formatRequest(row));
  } catch (error) {
    console.error('Error fetching request:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.getNextRequestId = async (req, res) => {
  try {
    const reqNo = await Request.getNextReqNo();
    return res.status(200).json({ success: true, requestNo: reqNo, formattedNum: reqNo, next_id: reqNo });
  } catch (error) {
    console.error('Error getting next ID:', error);
    return res.status(500).json({ success: false, message: 'Request number generation failed: ' + error.message });
  }
};

exports.previewReport = async (req, res) => {
  try {
    const filters = {
      from_date: req.query.from_date,
      to_date: req.query.to_date,
      department: req.query.department || null,
      vehicle_category: req.query.vehicle_category || null,
      employee_id: req.query.employee_id || null
    };

    if (!filters.from_date || !filters.to_date) {
      return res.status(400).json({ success: false, message: 'From Date and To Date are required.' });
    }

    const records = await Request.findByFilters(filters);
    return res.status(200).json(records);
  } catch (error) {
    console.error('Error getting report preview:', error);
    return res.status(500).json({ success: false, message: 'Internal server error: ' + error.message });
  }
};

exports.exportReport = async (req, res) => {
  try {
    const filters = {
      from_date: req.query.from_date,
      to_date: req.query.to_date,
      department: req.query.department || null,
      vehicle_category: req.query.vehicle_category || null,
      employee_id: req.query.employee_id || null
    };

    if (!filters.from_date || !filters.to_date) {
      return res.status(400).send('From Date and To Date are required.');
    }

    const records = await Request.findByFilters(filters);
    const xml = buildExcelXML(records, filters);

    res.setHeader('Content-Type', 'application/vnd.ms-excel');
    res.setHeader('Content-Disposition', 'attachment; filename="Vehicle_Requisition_Report.xls"');
    return res.send(xml);
  } catch (error) {
    console.error('Error exporting report:', error);
    return res.status(500).send('Internal server error: ' + error.message);
  }
};

function buildExcelXML(records, filters) {
  const generatedDate = new Date().toLocaleDateString('en-IN') + ' ' + new Date().toLocaleTimeString('en-IN');
  const reportPeriod = `${filters.from_date} to ${filters.to_date}`;
  const totalRequests = records.length;
  
  const approved = records.filter(r => r.status === 'HOD APPROVED' || r.status === 'APPROVED').length;
  const pending = records.filter(r => r.status === 'REQUEST SUBMITTED' || r.status === 'PENDING').length;
  const rejected = records.filter(r => r.status === 'REJECTED').length;
  const allocated = records.filter(r => r.status === 'VEHICLE ASSIGNED' || r.status === 'TRIP COMPLETED').length;
  
  const uniqueEmps = new Set(records.map(r => r.employee_id).filter(Boolean)).size;

  const xmlEscape = (str) => {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  let xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
  <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
    <Author>Bennett University Transport Management</Author>
    <Created>${new Date().toISOString()}</Created>
  </DocumentProperties>
  <Styles>
    <Style ss:ID="Default" ss:Name="Normal">
      <Alignment ss:Vertical="Bottom"/>
      <Borders/>
      <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#000000"/>
      <Interior/>
      <NumberFormat/>
      <Protection/>
    </Style>
    <Style ss:ID="Title">
      <Font ss:FontName="Calibri" ss:Size="16" ss:Bold="1" ss:Color="#1F4E79"/>
    </Style>
    <Style ss:ID="SummaryLabel">
      <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1"/>
      <Interior ss:Color="#EAEAEA" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="SummaryVal">
      <Font ss:FontName="Calibri" ss:Size="11"/>
    </Style>
    <Style ss:ID="Header">
      <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#FFFFFF" ss:Bold="1"/>
      <Interior ss:Color="#1F4E79" ss:Pattern="Solid"/>
      <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#000000"/>
      </Borders>
    </Style>
    <Style ss:ID="StatusApproved">
      <Interior ss:Color="#C6EFCE" ss:Pattern="Solid"/>
      <Font ss:Color="#006100" ss:Bold="1"/>
    </Style>
    <Style ss:ID="StatusPending">
      <Interior ss:Color="#FFEB9C" ss:Pattern="Solid"/>
      <Font ss:Color="#9C6500" ss:Bold="1"/>
    </Style>
    <Style ss:ID="StatusRejected">
      <Interior ss:Color="#FFC7CE" ss:Pattern="Solid"/>
      <Font ss:Color="#9C0006" ss:Bold="1"/>
    </Style>
    <Style ss:ID="StatusAllocated">
      <Interior ss:Color="#DDEBF7" ss:Pattern="Solid"/>
      <Font ss:Color="#002060" ss:Bold="1"/>
    </Style>
    <Style ss:ID="DateStyle">
      <NumberFormat ss:Format="yyyy\-mm\-dd"/>
    </Style>
  </Styles>
  <Worksheet ss:Name="Vehicle Requisition Report">
    <Table>`;

  const headers = [
    "Requisition Number (REQ No.)", "Request Date (REQ Date)", "Faculty ID", "Faculty Name", "Department",
    "Mobile Number", "Journey Type", "Vehicle Category", "Purpose of Request",
    "Pickup Location", "Drop Location", "Pickup Date", "Pickup Time", "Return Date",
    "Return Time", "Passenger Count", "Guest Name", "Guest Mobile", "Request Remarks",
    "Request Status", "Allocation Status", "Assigned Vehicle Number", "Assigned Driver",
    "Driver Mobile", "Allocation Date", "Created By", "Last Updated Date"
  ];

  const colMaxLengths = headers.map(h => h.length);

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

    const values = [
      r.requisition_no || r.id || '',
      formatDate(r.created_at),
      r.employee_id || '',
      r.employee_name || '',
      r.department || '',
      r.mobile_number || '',
      r.journey_type || '',
      r.category || '',
      r.purpose || '',
      r.pickup_point || '',
      r.drop_point || '',
      formatDate(r.pickup_datetime),
      formatTime(r.pickup_datetime),
      formatDate(r.return_datetime),
      formatTime(r.return_datetime),
      r.passengers || 0,
      r.guest_name || '',
      r.guest_mobile || '',
      r.remarks || '',
      reqStatus,
      allocStatus,
      r.vehicle_number || '',
      r.driver_name || '',
      r.DRIMOBNO || r.driver_mobile || '',
      formatDate(r.assigned_at),
      r.employee_id || '',
      formatDate(r.assigned_at || r.created_at)
    ];

    values.forEach((v, idx) => {
      const len = String(v).length;
      if (len > colMaxLengths[idx]) {
        colMaxLengths[idx] = len;
      }
    });

    return { values, reqStatus, allocStatus };
  });

  colMaxLengths.forEach(len => {
    const width = Math.min(60, Math.max(10, len)) * 8.0;
    xml += `\n      <Column ss:Width="${width}"/>`;
  });

  xml += `\n      <Row ss:Height="24">
        <Cell ss:StyleID="Title"><Data ss:Type="String">Bennett University - Campus Transport Report</Data></Cell>
      </Row>
      <Row ss:Height="15"/>`;

  const summaryBlock = [
    { label: "Report Generated Date", val: generatedDate },
    { label: "Report Period", val: reportPeriod },
    { label: "Total Requests", val: totalRequests, isNum: true },
    { label: "Approved Requests", val: approved, isNum: true },
    { label: "Pending Requests", val: pending, isNum: true },
    { label: "Rejected Requests", val: rejected, isNum: true },
    { label: "Allocated Requests", val: allocated, isNum: true },
    { label: "Total Employees Served", val: uniqueEmps, isNum: true }
  ];

  summaryBlock.forEach(item => {
    xml += `\n      <Row ss:Height="18">
        <Cell ss:StyleID="SummaryLabel"><Data ss:Type="String">${item.label}</Data></Cell>
        <Cell ss:StyleID="SummaryVal"><Data ss:Type="${item.isNum ? 'Number' : 'String'}">${item.val}</Data></Cell>
      </Row>`;
  });

  xml += `\n      <Row ss:Height="15"/>`;

  xml += `\n      <Row ss:Height="25">`;
  headers.forEach(h => {
    xml += `\n        <Cell ss:StyleID="Header"><Data ss:Type="String">${xmlEscape(h)}</Data></Cell>`;
  });
  xml += `\n      </Row>`;

  tableRows.forEach(rowInfo => {
    xml += `\n      <Row ss:Height="20">`;
    rowInfo.values.forEach((v, idx) => {
      let styleStr = '';
      if (idx === 20) {
        if (rowInfo.reqStatus === 'Approved') styleStr = ' ss:StyleID="StatusApproved"';
        else if (rowInfo.reqStatus === 'Pending') styleStr = ' ss:StyleID="StatusPending"';
        else if (rowInfo.reqStatus === 'Rejected') styleStr = ' ss:StyleID="StatusRejected"';
      } else if (idx === 21) {
        if (rowInfo.allocStatus === 'Allocated' || rowInfo.allocStatus === 'Completed') styleStr = ' ss:StyleID="StatusAllocated"';
        else if (rowInfo.allocStatus === 'Pending') styleStr = ' ss:StyleID="StatusPending"';
        else if (rowInfo.allocStatus === 'Cancelled') styleStr = ' ss:StyleID="StatusRejected"';
      } else if (idx === 1 || idx === 12 || idx === 14 || idx === 25 || idx === 27) {
        styleStr = ' ss:StyleID="DateStyle"';
      }

      let typeStr = 'String';
      if (v !== '' && !isNaN(v) && (idx === 0 || idx === 16)) {
        typeStr = 'Number';
      }

      xml += `\n        <Cell${styleStr}><Data ss:Type="${typeStr}">${xmlEscape(v)}</Data></Cell>`;
    });
    xml += `\n      </Row>`;
  });

  xml += `\n    </Table>
    <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
      <Selected/>
      <FreezePanes/>
      <FrozenNoSplit/>
      <SplitHorizontal>12</SplitHorizontal>
      <TopRowBottomPane>12</TopRowBottomPane>
      <ActivePane>2</ActivePane>
      <Panes>
        <Pane>
          <Number>3</Number>
        </Pane>
        <Pane>
          <Number>2</Number>
          <ActiveRow>12</ActiveRow>
        </Pane>
      </Panes>
    </WorksheetOptions>
  </Worksheet>
</Workbook>`;

  return xml;
}
