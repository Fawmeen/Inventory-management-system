const prisma = require('../prisma/client');
const { handleLowStockNotification } = require('./notification.service');
const { getAllUserEmails } = require('./userNotification.service');
const { sendNewProductEmail } = require('./mail.service');

async function getAllProducts() {
  return prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
}

async function getProductById(id) {
  return prisma.product.findUnique({ where: { id: Number(id) } });
}

async function createProduct(data) {
  const product = await prisma.product.create({
    data: {
      name: data.name,
      category: data.category,
      price: data.price,
      stock: data.stock ?? 0,
      lowStockThreshold: data.lowStockThreshold ?? 5,
    },
  });

  const users = await getAllUserEmails();
  const userEmails = users.map((user) => user.email);

  sendNewProductEmail(product, userEmails).catch((error) => {
    console.error('Failed to send new product emails:', error);
  });

  return product;
}

async function updateProduct(id, data) {
  const product = await getProductById(id);

  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  const updated = await prisma.product.update({
    where: { id: Number(id) },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.price !== undefined && { price: data.price }),
      ...(data.stock !== undefined && { stock: data.stock }),
      ...(data.lowStockThreshold !== undefined && {
        lowStockThreshold: data.lowStockThreshold,
      }),
    },
  });

  if (updated.stock > updated.lowStockThreshold && updated.notificationSent) {
    return prisma.product.update({
      where: { id: updated.id },
      data: { notificationSent: false },
    });
  }

  return handleLowStockNotification(updated);
}

async function deleteProduct(id) {
  const product = await getProductById(id);

  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  return prisma.product.delete({ where: { id: Number(id) } });
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
