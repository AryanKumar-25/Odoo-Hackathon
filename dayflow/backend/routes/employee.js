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

// --- LEAVE ---

// POST /leave/apply
router.post('/leave/apply', async (req, res) => {
  try {
    const { type, startDate, endDate, remarks } = req.body;
    const { employeeId, companyId } = req.user;

    if (!employeeId) return res.status(400).json({ error: 'Missing employee ID' });
    if (!['paid', 'sick', 'unpaid'].includes(type)) return res.status(400).json({ error: 'Invalid leave type' });
    if (!startDate || !endDate) return res.status(400).json({ error: 'Start and end dates are required' });

    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setUTCHours(0, 0, 0, 0);
    end.setUTCHours(23, 59, 59, 999);

    const now = new Date();
    now.setUTCHours(0, 0, 0, 0); // Start of today

    if (start < now) return res.status(400).json({ error: 'Start date cannot be in the past' });
    if (end < start) return res.status(400).json({ error: 'End date cannot be before start date' });

    // Overlap validation
    // Find any existing pending or approved requests for this employee
    const overlapping = await prisma.leaveRequest.findFirst({
      where: {
        employeeId,
        status: { in: ['pending', 'approved'] },
        // Two date ranges overlap if: (StartA <= EndB) and (EndA >= StartB)
        // new request = A, existing request = B
        startDate: { lte: end },
        endDate: { gte: start }
      }
    });

    if (overlapping) {
      return res.status(400).json({ error: 'Leave request overlaps with an existing pending or approved request' });
    }

    // Balance check
    const requestedDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    
    if (type !== 'unpaid') {
      const balance = await prisma.leaveBalance.findUnique({
        where: { employeeId }
      });
      if (!balance) return res.status(400).json({ error: 'Leave balance not found' });
      
      if (type === 'paid' && requestedDays > balance.paidDays) {
        return res.status(400).json({ error: `You requested ${requestedDays} days, but only have ${balance.paidDays} Paid days available.` });
      }
      if (type === 'sick' && requestedDays > balance.sickDays) {
        return res.status(400).json({ error: `You requested ${requestedDays} days, but only have ${balance.sickDays} Sick days available.` });
      }
    }

    const leave = await prisma.leaveRequest.create({
      data: {
        employeeId,
        companyId,
        type,
        startDate: start,
        endDate: end,
        remarks,
        status: 'pending'
      }
    });

    res.status(201).json(leave);
  } catch (error) {
    console.error('Error applying for leave:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /leave/balance
router.get('/leave/balance', async (req, res) => {
  try {
    const { employeeId } = req.user;
    if (!employeeId) return res.status(400).json({ error: 'Missing employee ID' });

    const balance = await prisma.leaveBalance.findUnique({
      where: { employeeId }
    });

    if (!balance) return res.status(404).json({ error: 'Balance not found' });
    res.json(balance);
  } catch (error) {
    console.error('Error fetching leave balance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /leave/me
router.get('/leave/me', async (req, res) => {
  try {
    const { employeeId } = req.user;
    if (!employeeId) return res.status(400).json({ error: 'Missing employee ID' });

    const leaves = await prisma.leaveRequest.findMany({
      where: { employeeId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(leaves);
  } catch (error) {
    console.error('Error fetching leaves:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
