const orderService = require('../services/order.service');

async function createOrder(req, res) {
  try {
    const { items } = req.body;

    const result = await orderService.createOrder(req.user.id, items);
    return res.status(201).json(result);
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message });
  }
}

async function getOrders(req, res) {
  try {
    const orders = await orderService.getOrdersByUser(req.user.id);
    return res.status(200).json(orders);
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message });
  }
}

module.exports = { createOrder, getOrders };
