const express = require('express');
const inventoryController = require('../controllers/inventory.controller');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/inventory/stock-in', authenticate, authorize('STAFF'), inventoryController.stockIn);
router.post('/inventory/stock-out', authenticate, authorize('STAFF'), inventoryController.stockOut);
router.get('/inventory/logs', authenticate, authorize('MANAGER'), inventoryController.getLogs);

module.exports = router;
