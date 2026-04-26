const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient({});

async function main() {
  const masterPassword = await bcrypt.hash('master123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'master@evo.com' },
    update: {},
    create: {
      email: 'master@evo.com',
      name: 'Admin Master',
      password: masterPassword,
      role: 'MASTER',
    },
  });
  
  console.log({ user });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
