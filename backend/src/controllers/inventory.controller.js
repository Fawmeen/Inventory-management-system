const inventoryService = require('../services/inventory.service');

async function stockIn(req, res) {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({ message: 'productId and quantity are required' });
    }

    const log = await inventoryService.stockIn(req.user.id, productId, Number(quantity));
    return res.status(201).json(log);
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message });
  }
}

async function stockOut(req, res) {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({ message: 'productId and quantity are required' });
    }

    const log = await inventoryService.stockOut(req.user.id, productId, Number(quantity));
    return res.status(201).json(log);
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message });
  }
}

async function getLogs(req, res) {
  try {
    const logs = await inventoryService.getLogs();
    return res.status(200).json(logs);
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message });
  }
}

module.exports = { stockIn, stockOut, getLogs };
