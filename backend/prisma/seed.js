const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const users = [
  { name: 'Manager User', email: 'manager@example.com', password: 'password123', role: 'MANAGER' },
  { name: 'Staff User', email: 'staff@example.com', password: 'password123', role: 'STAFF' },
  { name: 'Regular User', email: 'user@example.com', password: 'password123', role: 'USER' },
];

async function main() {
  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);

    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        name: user.name,
        email: user.email,
        password: hashedPassword,
        role: user.role,
      },
    });
  }

  await prisma.product.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Laptop',
      category: 'Electronics',
      price: 999.99,
      stock: 10,
      lowStockThreshold: 5,
    },
  });

  console.log('Seed completed: 3 users + 1 sample product created.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
