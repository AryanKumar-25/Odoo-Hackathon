const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  console.log('SALARIES:', JSON.stringify(await prisma.employeeSalary.findMany(), null, 2));
  console.log('RECORDS:', JSON.stringify(await prisma.payrollRecord.findMany(), null, 2));
}
main().then(() => prisma.$disconnect());
