// backend/routes/transportRoutes.js
// Transport Office routing configuration
// Bennett University Campus Transport Management System

const express = require('express');
const router = express.Router();
const transportController = require('../controllers/transportController');

router.get('/transport/pending', transportController.getPendingTransport);
router.post('/transport/assign', transportController.assignVehicle);
router.post('/transport/update-status', transportController.updateStatus);
router.get('/vehicles', transportController.getVehicles);
router.post('/vehicles', transportController.registerVehicle);
router.post('/vehicles/update-status', transportController.updateVehicleStatus);
router.post('/vehicles/delete', transportController.deleteVehicle);

// Driver-specific routes
router.get('/driver/trips', transportController.getDriverTrips);
router.post('/driver/trip-status', transportController.updateDriverTripStatus);
router.post('/driver/fuel-log', transportController.addFuelLog);

module.exports = router;

