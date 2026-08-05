const prisma = require('../prisma/client');
const {
  updateStockWithNotification,
  handleLowStockNotification,
  queueNotification,
} = require('./notification.service');

async function stockIn(staffId, productId, quantity) {
  if (!quantity || quantity <= 0) {
    const error = new Error('Quantity must be greater than zero');
    error.statusCode = 400;
    throw error;
  }

  const product = await prisma.product.findUnique({
    where: { id: Number(productId) },
  });

  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  const newStock = product.stock + quantity;
  const updated = await updateStockWithNotification(product.id, newStock, prisma);

  await queueNotification({
    type: 'STOCK_ADDED',
    productId: updated.id,
    productName: updated.name,
    stock: updated.stock,
    threshold: updated.lowStockThreshold,
    thresholdReached: updated.stock <= updated.lowStockThreshold,
  });

  return prisma.inventoryLog.create({
    data: {
      productId: product.id,
      staffId,
      type: 'STOCK_IN',
      quantity,
    },
    include: { product: true, staff: { select: { id: true, name: true } } },
  });
}

async function stockOut(staffId, productId, quantity) {
  if (!quantity || quantity <= 0) {
    const error = new Error('Quantity must be greater than zero');
    error.statusCode = 400;
    throw error;
  }

  const product = await prisma.product.findUnique({
    where: { id: Number(productId) },
  });

  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  const updateResult = await prisma.product.updateMany({
    where: { id: product.id, stock: { gte: quantity } },
    data: {
      stock: { decrement: quantity },
    },
  });

  if (updateResult.count !== 1) {
    const error = new Error('Insufficient stock');
    error.statusCode = 409;
    throw error;
  }

  const updated = await prisma.product.findUnique({ where: { id: product.id } });

  await queueNotification({
    type: 'STOCK_OUT',
    productId: updated.id,
    productName: updated.name,
    stock: updated.stock,
    threshold: updated.lowStockThreshold,
    thresholdReached: updated.stock <= updated.lowStockThreshold,
  });

  await handleLowStockNotification(updated);

  return prisma.inventoryLog.create({
    data: {
      productId: product.id,
      staffId,
      type: 'STOCK_OUT',
      quantity,
    },
    include: { product: true, staff: { select: { id: true, name: true } } },
  });
}

async function getLogs() {
  return prisma.inventoryLog.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      product: { select: { id: true, name: true } },
      staff: { select: { id: true, name: true } },
    },
  });
}

module.exports = { stockIn, stockOut, getLogs };
