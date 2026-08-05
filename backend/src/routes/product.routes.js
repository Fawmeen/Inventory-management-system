const express = require('express');
const productController = require('../controllers/product.controller');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/products', authenticate, productController.getProducts);
router.post('/products', authenticate, authorize('MANAGER'), productController.createProduct);
router.put('/products/:id', authenticate, authorize('MANAGER'), productController.updateProduct);
router.delete('/products/:id', authenticate, authorize('MANAGER'), productController.deleteProduct);

module.exports = router;
