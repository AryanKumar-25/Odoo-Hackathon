const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting LeaveBalance seed...');

  const allUsers = await prisma.user.findMany({
    where: { role: 'employee' }
  });

  const existingBalances = await prisma.leaveBalance.findMany();
  const existingEmployeeIds = new Set(existingBalances.map(b => b.employeeId));

  const users = allUsers.filter(u => !existingEmployeeIds.has(u.employeeId));

  console.log(`Found ${users.length} employees without a leave balance.`);

  for (const user of users) {
    try {
      await prisma.leaveBalance.create({
        data: {
          employeeId: user.employeeId,
          companyId: user.companyId
        }
      });
      console.log(`✅ Created balance for ${user.employeeId}`);
    } catch (e) {
      console.error(`❌ Failed to create balance for ${user.employeeId}:`, e.message);
    }
  }

  console.log('Seed completed successfully.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
