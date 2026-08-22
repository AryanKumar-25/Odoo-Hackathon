const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  await prisma.payrollRecord.deleteMany();
}
main().then(() => prisma.$disconnect());
