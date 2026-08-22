const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const orphans = await prisma.user.findMany({
    where: { companyId: null }
  });
  console.log('Orphan users found:', orphans.length);
  orphans.forEach(o => console.log(`ID: ${o.id}, Email: ${o.email}, Role: ${o.role}`));
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
