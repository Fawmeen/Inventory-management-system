const prisma = require('../prisma/client');
const { handleLowStockNotification } = require('./notification.service');

async function createOrder(userId, items) {
  if (!items || items.length === 0) {
    const error = new Error('Order must contain at least one item');
    error.statusCode = 400;
    throw error;
  }

  return prisma.$transaction(async (tx) => {
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

    for (const item of items) {
      const product = productMap.get(Number(item.productId));
      const quantity = Number(item.quantity);

      if (!quantity || quantity <= 0) {
        const error = new Error('Quantity must be greater than zero');
        error.statusCode = 400;
        throw error;
      }

      // The low-stock threshold is only used for alerts, not for blocking purchases.
      // Users may still buy until stock reaches 0.
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
      const notificationSent =
        newStock > product.lowStockThreshold ? false : product.notificationSent;

      const updateResult = await tx.product.updateMany({
        where: { id: product.id, stock: { gte: quantity } },
        data: { stock: { decrement: quantity }, notificationSent },
      });

      if (updateResult.count !== 1) {
        const error = new Error('Insufficient stock');
        error.statusCode = 409;
        throw error;
      }

      const updated = await tx.product.findUnique({ where: { id: product.id } });
      await handleLowStockNotification(updated, tx);
    }

    return order;
  });
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
