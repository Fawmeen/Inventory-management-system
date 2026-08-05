const prisma = require('../prisma/client');
const { queueNotification } = require('./notification.service');

async function createOrder(userId, items) {
  if (!items || items.length === 0) {
    const error = new Error('Order must contain at least one item');
    error.statusCode = 400;
    throw error;
  }

  const result = await prisma.$transaction(async (tx) => {
    const productIds = items.map((item) => Number(item.productId));
    const products = await tx.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      const error = new Error('One or more products not found');
      error.statusCode = 404;
      throw error;
    }

    const productMap = new Map(products.map((p) => [p.id, p]));
    let total = 0;
    const orderItemsData = [];
    const lowStockNotifications = [];

    for (const item of items) {
      const product = productMap.get(Number(item.productId));
      const quantity = Number(item.quantity);

      if (!quantity || quantity <= 0) {
        const error = new Error('Quantity must be greater than zero');
        error.statusCode = 400;
        throw error;
      }

      if (product.stock < quantity) {
        const error = new Error('Insufficient stock');
        error.statusCode = 409;
        throw error;
      }

      total += Number(product.price) * quantity;
      orderItemsData.push({ product, quantity });
    }

    const order = await tx.order.create({
      data: {
        userId,
        total,
        items: {
          create: orderItemsData.map(({ product, quantity }) => ({
            productId: product.id,
            quantity,
            price: product.price,
          })),
        },
      },
      include: { items: { include: { product: true } } },
    });

    for (const { product, quantity } of orderItemsData) {
      const newStock = product.stock - quantity;
      const shouldNotifyLowStock =
        newStock <= product.lowStockThreshold && !product.notificationSent;
      const notificationSent = shouldNotifyLowStock ? true : product.notificationSent;

      const updateResult = await tx.product.updateMany({
        where: { id: product.id, stock: { gte: quantity } },
        data: { stock: { decrement: quantity }, notificationSent },
      });

      if (updateResult.count !== 1) {
        const error = new Error('Insufficient stock');
        error.statusCode = 409;
        throw error;
      }

      if (shouldNotifyLowStock) {
        lowStockNotifications.push({
          type: 'LOW_STOCK',
          productId: product.id,
          productName: product.name,
          stock: newStock,
          threshold: product.lowStockThreshold,
          thresholdReached: true,
        });
      }
    }

    return { order, lowStockNotifications };
  });

  const { order, lowStockNotifications } = result;

  if (lowStockNotifications.length > 0) {
    for (const notification of lowStockNotifications) {
      try {
        await queueNotification(notification);
      } catch (error) {
        console.error('Failed to queue low stock notification:', error);
      }
    }
  }

  return { order, lowStockNotifications };
}

async function getOrdersByUser(userId) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: { product: { select: { id: true, name: true } } },
      },
    },
  });
}

module.exports = { createOrder, getOrdersByUser };
