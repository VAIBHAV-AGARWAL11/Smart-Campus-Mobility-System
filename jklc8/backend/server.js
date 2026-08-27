// backend/server.js
// Main entry point for the Node.js Express server
// Bennett University Campus Transport Management System

const express = require('express');
const path = require('path');
const cors = require('cors');
const os = require('os');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const requestRoutes = require('./routes/requestRoutes');
const hodRoutes = require('./routes/hodRoutes');
const transportRoutes = require('./routes/transportRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Disable HTTP caching to ensure client browsers always fetch fresh code updates
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Enable Cross-Origin Resource Sharing
app.use(cors());

// Parse incoming request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register API routes
app.use(authRoutes);
app.use(requestRoutes);
app.use(hodRoutes);
app.use(transportRoutes);

// Serve frontend static assets securely from the project directory
app.use(express.static(path.join(__dirname, '..')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// Fallback to index.html for single page application routing
app.get('*', (req, res) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/request') || req.path.startsWith('/transport') || req.path.startsWith('/vehicles') || req.path.startsWith('/reports') || req.path.startsWith('/driver')) {
    return res.status(404).json({ success: false, message: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, '../index.html'));
});

// Function to get local IP address
function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return null;
}

// Start listening for requests
app.listen(PORT, () => {
  const localIp = getLocalIpAddress();
  console.log(`=======================================================`);
  console.log(`Bennett University Transport Management Server is running on port ${PORT}`);
  console.log(`Access the application at:`);
  console.log(`  Local:            http://localhost:${PORT}`);
  if (localIp) {
    console.log(`  On Your Network:  http://${localIp}:${PORT}`);
  }
  console.log(`=======================================================`);
});

