const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const requireAdmin = require('../middleware/requireAdmin');
const prisma = require('../db');

// Require token and admin role for all admin routes
router.use(verifyToken);
router.use(requireAdmin);

const bcrypt = require('bcryptjs');
const { generateEmployeeId, generateTempPassword } = require('../utils/authUtils');

// --- EMPLOYEES ---

// Create an employee
router.post('/employees', async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    // Ensure email is unique
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Get Admin's companyId
    const adminUser = await prisma.user.findUnique({ 
      where: { id: req.user.id },
      include: { company: true }
    });

    if (!adminUser || !adminUser.company) {
      return res.status(400).json({ error: 'Admin is not associated with a company' });
    }
    
    const companyName = adminUser.company.name;
    const year = new Date().getFullYear();

    // Determine serial number for the year
    // For simplicity, we just count how many employees exist in this company
    // In a real app, you'd want a more robust sequence table to prevent race conditions.
    const employeeCount = await prisma.user.count({
      where: { companyId: adminUser.companyId, role: 'employee' }
    });
    const serial = employeeCount + 1;

    const newEmployeeId = generateEmployeeId(companyName, name, year, serial);
    const tempPassword = generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const newUser = await prisma.user.create({
      data: {
        employeeId: newEmployeeId,
        companyId: adminUser.companyId,
        name,
        email,
        phone,
        passwordHash,
        role: 'employee',
        mustChangePassword: true
      }
    });

    res.status(201).json({
      message: 'Employee created successfully',
      user: {
        id: newUser.id,
        employeeId: newUser.employeeId,
        name: newUser.name,
        email: newUser.email
      },
      plaintextPassword: tempPassword // ONLY RETURNED ONCE
    });

  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// List all employees
router.get('/employees', async (req, res) => {
  try {
    const employees = await prisma.user.findMany({
      where: { role: 'employee', companyId: req.user.companyId },
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
    const employee = await prisma.user.findFirst({
      where: { id: parseInt(id), companyId: req.user.companyId },
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
    
    // Pre-check ownership
    const target = await prisma.user.findFirst({
      where: { id: parseInt(id), companyId: req.user.companyId }
    });
    if (!target) return res.status(404).json({ error: 'Employee not found' });

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

// List all attendance records for a specific day, joined with all employees
router.get('/attendance', async (req, res) => {
  try {
    const { date } = req.query; // e.g. YYYY-MM-DD
    
    // Default to today if no date provided
    const targetDate = date ? new Date(date) : new Date();
    
    const startOfDay = new Date(targetDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    // 1. Fetch all employees for this admin's company
    const employees = await prisma.user.findMany({
      where: { role: 'employee', companyId: req.user.companyId },
      select: { employeeId: true, name: true }
    });
    
    const myEmployeeIds = employees.map(e => e.employeeId);

    // 2. Fetch all attendance records for that day for these employees
    const records = await prisma.attendance.findMany({
      where: {
        employeeId: { in: myEmployeeIds },
        date: {
          gte: startOfDay,
          lte: endOfDay,
        }
      }
    });

    // Map records by employeeId for O(1) lookup
    const recordMap = {};
    records.forEach(r => {
      recordMap[r.employeeId] = r;
    });

    // 3. Join the data
    const joinedData = employees.map(emp => {
      const record = recordMap[emp.employeeId];
      return {
        employeeId: emp.employeeId,
        name: emp.name,
        date: record ? record.date : null,
        checkIn: record ? record.checkIn : null,
        checkOut: record ? record.checkOut : null,
        status: record ? record.status : null // Can be null if no record (e.g. weekend/no-show)
      };
    });

    res.json(joinedData);
  } catch (error) {
    console.error('Error fetching joined attendance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// --- LEAVES ---

// Get all leave requests
router.get('/leave', async (req, res) => {
  try {
    const employees = await prisma.user.findMany({
      where: { role: 'employee', companyId: req.user.companyId },
      select: { employeeId: true }
    });
    const myEmployeeIds = employees.map(e => e.employeeId);

    const leaves = await prisma.leaveRequest.findMany({
      where: { employeeId: { in: myEmployeeIds } },
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

    const employees = await prisma.user.findMany({
      where: { role: 'employee', companyId: req.user.companyId },
      select: { employeeId: true }
    });
    const myEmployeeIds = employees.map(e => e.employeeId);

    // Pre-check ownership
    const targetLeave = await prisma.leaveRequest.findFirst({
      where: { id: parseInt(id), employeeId: { in: myEmployeeIds } }
    });
    if (!targetLeave) return res.status(404).json({ error: 'Leave request not found' });

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
    const employees = await prisma.user.findMany({
      where: { role: 'employee', companyId: req.user.companyId },
      select: { employeeId: true }
    });
    const myEmployeeIds = employees.map(e => e.employeeId);

    const payrolls = await prisma.payroll.findMany({
      where: { employeeId: { in: myEmployeeIds } },
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

    // Verify employee belongs to admin's company
    const employee = await prisma.user.findFirst({
      where: { employeeId, companyId: req.user.companyId }
    });
    if (!employee) return res.status(403).json({ error: 'Unauthorized or employee not found' });

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
