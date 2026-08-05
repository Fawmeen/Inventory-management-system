const express = require('express');
const orderController = require('../controllers/order.controller');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/orders', authenticate, authorize('USER'), orderController.createOrder);
router.get('/orders', authenticate, authorize('USER'), orderController.getOrders);

module.exports = router;
