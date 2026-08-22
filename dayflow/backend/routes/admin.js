const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const requireAdmin = require('../middleware/requireAdmin');
const prisma = require('../db');

// Require token and admin role for all admin routes
router.use(verifyToken);
router.use(requireAdmin);

// --- EMPLOYEES ---

// List all employees
router.get('/employees', async (req, res) => {
  try {
    const employees = await prisma.user.findMany({
      select: {
        id: true,
        employeeId: true,
        name: true,
        email: true,
        role: true,
      },
    });
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single employee details
router.get('/employees/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        employeeId: true,
        name: true,
        email: true,
        role: true,
      },
    });
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update employee details (edit ANY field on any employee)
router.patch('/employees/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, employeeId } = req.body;
    const updated = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { name, email, role, employeeId },
      select: { id: true, employeeId: true, name: true, email: true, role: true },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});


// --- ATTENDANCE ---

// List all attendance records with optional filtering
router.get('/attendance', async (req, res) => {
  try {
    const { employeeId, date, status } = req.query;
    
    // Build filter dynamically
    const where = {};
    if (employeeId) where.employeeId = employeeId;
    if (status) where.status = status;
    if (date) {
      // Assuming date is passed as YYYY-MM-DD
      const startOfDay = new Date(date);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setUTCHours(23, 59, 59, 999);
      where.date = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const records = await prisma.attendance.findMany({
      where,
      orderBy: { date: 'desc' },
    });
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});


// --- LEAVES ---

// Get all leave requests
router.get('/leave', async (req, res) => {
  try {
    const leaves = await prisma.leaveRequest.findMany({
      orderBy: { startDate: 'desc' },
    });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Approve/Reject leave request
router.patch('/leave/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminComment } = req.body;
    
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updated = await prisma.leaveRequest.update({
      where: { id: parseInt(id) },
      data: { status, adminComment },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});


// --- PAYROLL ---

// Get all payrolls
router.get('/payroll', async (req, res) => {
  try {
    const payrolls = await prisma.payroll.findMany({
      orderBy: { employeeId: 'asc' },
    });
    res.json(payrolls);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update payroll for an employee
router.patch('/payroll/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { baseSalary, allowances, deductions } = req.body;

    const netSalary = (Number(baseSalary) || 0) + (Number(allowances) || 0) - (Number(deductions) || 0);

    // Upsert payroll: create if not exists, update if exists
    // But since employeeId is not marked @unique in Payroll (in schema, id is primary),
    // we use findFirst and update, or create. Let's check schema.
    
    // Schema shows Payroll { id, employeeId, ... } and employeeId is NOT @unique.
    // Let's assume one payroll per employee for now, so we find by employeeId.
    const existing = await prisma.payroll.findFirst({
      where: { employeeId },
    });

    let updated;
    if (existing) {
      updated = await prisma.payroll.update({
        where: { id: existing.id },
        data: { baseSalary: Number(baseSalary), allowances: Number(allowances), deductions: Number(deductions), netSalary },
      });
    } else {
      updated = await prisma.payroll.create({
        data: {
          employeeId,
          baseSalary: Number(baseSalary),
          allowances: Number(allowances),
          deductions: Number(deductions),
          netSalary
        },
      });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
