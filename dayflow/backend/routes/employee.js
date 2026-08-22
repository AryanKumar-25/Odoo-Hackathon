const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const prisma = require('../db');

// Require token for all employee routes
router.use(verifyToken);

// --- ATTENDANCE ---

// GET /attendance/me?month=YYYY-MM
// Returns this employee's records for that month
router.get('/attendance/me', async (req, res) => {
  try {
    const { month } = req.query; // expected format: YYYY-MM
    const employeeId = req.user.employeeId;

    if (!employeeId) {
      return res.status(400).json({ error: 'User does not have an associated employee ID' });
    }

    const where = { employeeId };

    if (month) {
      // Create start and end date for the selected month
      const [year, monthStr] = month.split('-');
      const startOfMonth = new Date(Date.UTC(parseInt(year), parseInt(monthStr) - 1, 1));
      const endOfMonth = new Date(Date.UTC(parseInt(year), parseInt(monthStr), 0, 23, 59, 59, 999));

      where.date = {
        gte: startOfMonth,
        lte: endOfMonth,
      };
    }

    const records = await prisma.attendance.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    res.json(records);
  } catch (error) {
    console.error('Error fetching employee attendance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /attendance/checkin
// Records check-in time for today (reject if already checked in)
router.post('/attendance/checkin', async (req, res) => {
  try {
    const employeeId = req.user.employeeId;
    if (!employeeId) return res.status(400).json({ error: 'Missing employee ID' });

    // Define "today" boundaries
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setUTCHours(23, 59, 59, 999);

    // Check if already checked in today
    const existing = await prisma.attendance.findFirst({
      where: {
        employeeId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        }
      }
    });

    if (existing && existing.checkIn) {
      return res.status(400).json({ error: 'Already checked in today' });
    }

    const record = await prisma.attendance.create({
      data: {
        employeeId,
        date: now,
        checkIn: now,
        status: 'present'
      }
    });

    res.json(record);
  } catch (error) {
    console.error('Error on checkin:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /attendance/checkout
// Records check-out time for today (reject if not checked in yet or already checked out)
router.post('/attendance/checkout', async (req, res) => {
  try {
    const employeeId = req.user.employeeId;
    if (!employeeId) return res.status(400).json({ error: 'Missing employee ID' });

    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const existing = await prisma.attendance.findFirst({
      where: {
        employeeId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        }
      }
    });

    if (!existing) {
      return res.status(400).json({ error: 'No check-in record found for today' });
    }
    if (existing.checkOut) {
      return res.status(400).json({ error: 'Already checked out today' });
    }

    const updated = await prisma.attendance.update({
      where: { id: existing.id },
      data: { checkOut: now }
    });

    res.json(updated);
  } catch (error) {
    console.error('Error on checkout:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
