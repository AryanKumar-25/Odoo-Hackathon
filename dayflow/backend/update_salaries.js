const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const salaries = await prisma.employeeSalary.findMany();
  for (const salary of salaries) {
    if (salary.components.length <= 2) { // only Basic and HRA
      await prisma.employeeSalary.update({
        where: { id: salary.id },
        data: {
          pfPercentage: 12,
          components: [
            { name: 'Basic Salary', type: 'percentage_of_wage', value: 50 },
            { name: 'House Rent Allowance', type: 'percentage_of_basic', value: 50 },
            { name: 'Standard Allowance', type: 'percentage_of_basic', value: 16.67 },
            { name: 'Performance Bonus', type: 'percentage_of_basic', value: 8.33 },
            { name: 'Leave Travel Allowance', type: 'percentage_of_basic', value: 8.33 },
            { name: 'Fixed Allowance', type: 'percentage_of_basic', value: 11.67 }
          ]
        }
      });
    }
  }
  console.log("Updated existing salaries!");
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
