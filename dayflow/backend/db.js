const { PrismaClient } = require('@prisma/client');

// Single DB connection instance
const prisma = new PrismaClient();

module.exports = prisma;
