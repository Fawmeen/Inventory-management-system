const { consumeQueuedNotification } = require('../services/notification.service');
const { createUserNotifications } = require('../services/userNotification.service');

async function getStockUpdate(req, res) {
  try {
    const notification = await consumeQueuedNotification();

    if (!notification) {
      return res.status(200).json({ message: 'No stock updates available' });
    }

    const message = {
      type: notification.type,
      name: notification.productName,
      productId: notification.productId,
      stock: notification.stock,
      threshold: notification.threshold,
      thresholdReached: notification.thresholdReached,
      timestamp: notification.createdAt,
    };

    const userNotifications = await createUserNotifications(message);
    return res.status(200).json({ message, userNotifications });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

module.exports = { getStockUpdate };
