const prisma = require('../db');
// Exporting the user model from Prisma singleton to maintain requested structure
module.exports = prisma.user;
