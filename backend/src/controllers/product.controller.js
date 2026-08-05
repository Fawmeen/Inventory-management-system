const productService = require('../services/product.service');

async function getProducts(req, res) {
  try {
    const products = await productService.getAllProducts();
    return res.status(200).json(products);
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message });
  }
}

async function createProduct(req, res) {
  try {
    const { name, category, price, stock, lowStockThreshold } = req.body;

    if (!name || !category || price === undefined) {
      return res.status(400).json({ message: 'Name, category, and price are required' });
    }

    const product = await productService.createProduct({
      name,
      category,
      price,
      stock,
      lowStockThreshold,
    });

    return res.status(201).json(product);
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message });
  }
}

async function updateProduct(req, res) {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    return res.status(200).json(product);
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message });
  }
}

async function deleteProduct(req, res) {
  try {
    await productService.deleteProduct(req.params.id);
    return res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message });
  }
}

module.exports = { getProducts, createProduct, updateProduct, deleteProduct };
