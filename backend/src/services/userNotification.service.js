const prisma = require('../prisma/client');

async function getAllUserEmails() {
  const users = await prisma.user.findMany({
    where: { role: 'USER' },
    select: { email: true, name: true },
  });
  return users;
}

async function createUserNotifications(message) {
  const users = await getAllUserEmails();
  return users.map((user) => ({
    userEmail: user.email,
    userName: user.name,
    type: message.type,
    productId: message.productId,
    productName: message.productName,
    stock: message.stock,
    threshold: message.threshold,
    timestamp: message.timestamp || message.createdAt,
  }));
}

module.exports = { createUserNotifications, getAllUserEmails };
