const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const requireAdmin = require('../middleware/requireAdmin');

// Require token and admin role for all admin routes
router.use(verifyToken);
router.use(requireAdmin);

// Teammate 3: Fill in admin routes here (e.g., GET /leaves, POST /payroll)

module.exports = router;
