const express = require('express');
const stockUpdateController = require('../controllers/stockUpdate.controller');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/stock-updates', authenticate, authorize('MANAGER'), stockUpdateController.getStockUpdate);

module.exports = router;
