const prisma = require('../prisma/client');

async function queueNotification({ type, productId, productName, stock, threshold, thresholdReached }) {
  return prisma.notificationQueue.create({
    data: {
      type,
      productId,
      productName,
      stock,
      threshold,
      thresholdReached,
    },
  });
}

async function handleLowStockNotification(product, db = prisma) {
  if (product.stock <= product.lowStockThreshold && !product.notificationSent) {
    console.log(
      `LOW STOCK ALERT : Product ${product.name} has only ${product.stock} items left`
    );

    await queueNotification({
      type: 'LOW_STOCK',
      productId: product.id,
      productName: product.name,
      stock: product.stock,
      threshold: product.lowStockThreshold,
      thresholdReached: true,
    });

    return db.product.update({
      where: { id: product.id },
      data: { notificationSent: true },
    });
  }

  return product;
}

async function updateStockWithNotification(productId, newStock, db = prisma) {
  const product = await db.product.findUnique({ where: { id: productId } });

  const notificationSent =
    newStock > product.lowStockThreshold ? false : product.notificationSent;

  const updated = await db.product.update({
    where: { id: productId },
    data: { stock: newStock, notificationSent },
  });

  return handleLowStockNotification(updated, db);
}

async function consumeQueuedNotification() {
  return prisma.notificationQueue.findFirst({
    where: { processed: false },
    orderBy: { createdAt: 'asc' },
  });
}

async function markNotificationProcessed(id) {
  return prisma.notificationQueue.update({
    where: { id },
    data: { processed: true },
  });
}

module.exports = {
  handleLowStockNotification,
  updateStockWithNotification,
  consumeQueuedNotification,
  markNotificationProcessed,
  queueNotification,
};
