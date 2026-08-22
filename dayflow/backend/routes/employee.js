const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');

// Require token for all employee routes
router.use(verifyToken);

// Teammate 2: Fill in employee routes here (e.g., GET /attendance, POST /leave)

module.exports = router;
