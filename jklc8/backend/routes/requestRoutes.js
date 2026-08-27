// backend/routes/requestRoutes.js
// Vehicle requisition routing configuration
// Bennett University Campus Transport Management System

const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');

router.post('/request', requestController.createRequest);
router.post('/request/cancel', requestController.cancelRequest);
router.get('/myrequests', requestController.getMyRequests);
router.get('/requests/next-id', requestController.getNextRequestId);
router.get('/requests/:id', requestController.getRequestById);
router.get('/api/vehicle-categories', requestController.getCategories);
router.get('/reports/preview', requestController.previewReport);
router.get('/reports/export', requestController.exportReport);

module.exports = router;

