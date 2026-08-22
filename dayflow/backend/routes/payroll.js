const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const prisma = require('../db');

router.use(verifyToken);

// Middleware to check Admin role
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied: Admin only' });
  }
  next();
};

// Helpers for calculating working days in a month
function getWorkingDays(year, month, daysPerWeek) {
  let count = 0;
  const daysInMonth = new Date(year, month, 0).getDate();
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month - 1, i);
    const dayOfWeek = d.getDay(); // 0 = Sunday, 6 = Saturday
    // Assume typical weekend deduction. If daysPerWeek is 5, Sat/Sun are off.
    // If daysPerWeek is 6, Sun is off.
    if (daysPerWeek === 5 && (dayOfWeek === 0 || dayOfWeek === 6)) continue;
    if (daysPerWeek === 6 && dayOfWeek === 0) continue;
    count++;
  }
  return count;
}

// GET /api/payroll
// Admin only. List all records for a given month/year
router.get('/', requireAdmin, async (req, res) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) return res.status(400).json({ error: 'Month and year required' });

    // Fetch all employees for this company
    const users = await prisma.user.findMany({
      where: { companyId: req.user.companyId, role: 'employee' },
      select: { employeeId: true, name: true }
    });

    // Fetch existing records for this month/year
    const records = await prisma.payrollRecord.findMany({
      where: {
        companyId: req.user.companyId,
        month: parseInt(month),
        year: parseInt(year)
      }
    });

    const recordMap = {};
    records.forEach(r => recordMap[r.employeeId] = r);

    // Combine them
    const result = users.map(u => {
      const rec = recordMap[u.employeeId];
      if (rec) {
        return {
          ...rec,
          employeeName: u.name,
          // When returning Decimals, Prisma returns Decimal objects. They serialize to strings or floats.
          // The frontend handles numbers or strings. We can send them as is.
        };
      } else {
        return {
          id: null,
          employeeId: u.employeeId,
          employeeName: u.name,
          status: 'Not Generated',
          payableDays: '-',
          grossSalary: '-',
          netSalary: '-'
        };
      }
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching payroll:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/payroll/:employeeId
// Admin or Employee (own records). 
router.get('/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { month, year } = req.query;
    
    // Cross-company check
    const targetUser = await prisma.user.findUnique({ where: { employeeId } });
    if (!targetUser || targetUser.companyId !== req.user.companyId) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    if (req.user.role !== 'admin' && req.user.employeeId !== employeeId) {
      return res.status(403).json({ error: 'Forbidden: Cannot view colleague payroll' });
    }

    const whereClause = { employeeId };
    if (month) whereClause.month = parseInt(month);
    if (year) whereClause.year = parseInt(year);
    
    // EmployeePayroll.jsx ONLY fetches finalized records. 
    // We enforce this on the server for employees to prevent them snooping on drafts.
    if (req.user.role !== 'admin') {
      whereClause.status = 'finalized';
    }

    const records = await prisma.payrollRecord.findMany({
      where: whereClause,
      orderBy: [
        { year: 'desc' },
        { month: 'desc' }
      ]
    });

    res.json(records);
  } catch (error) {
    console.error('Error fetching employee payroll:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/payroll/generate
// Admin only.
router.post('/generate', requireAdmin, async (req, res) => {
  try {
    const { month, year, employeeId } = req.body;
    if (!month || !year) return res.status(400).json({ error: 'Month and year required' });

    // Target either a single employee, or all employees in the company
    let targetEmployeeIds = [];
    if (employeeId) {
      const u = await prisma.user.findUnique({ where: { employeeId } });
      if (!u || u.companyId !== req.user.companyId) return res.status(404).json({ error: 'Employee not found' });
      targetEmployeeIds.push(employeeId);
    } else {
      const users = await prisma.user.findMany({
        where: { companyId: req.user.companyId, role: 'employee' }
      });
      targetEmployeeIds = users.map(u => u.employeeId);
    }

    let generatedCount = 0;
    const results = [];

    for (const empId of targetEmployeeIds) {
      // Look for existing record
      const existingRecord = await prisma.payrollRecord.findUnique({
        where: {
          employeeId_month_year: {
            employeeId: empId,
            month: parseInt(month),
            year: parseInt(year)
          }
        }
      });

      // Skip finalized records
      if (existingRecord && existingRecord.status === 'finalized') {
        results.push({ employeeId: empId, status: 'skipped', reason: 'already finalized' });
        continue;
      }

      // Fetch salary config
      const salaryConfig = await prisma.employeeSalary.findUnique({ where: { employeeId: empId } });
      if (!salaryConfig) {
        results.push({ employeeId: empId, status: 'skipped', reason: 'no salary config found' });
        continue;
      }

      // Calculate working days
      const totalMonthDays = getWorkingDays(year, month, salaryConfig.workingDaysPerWeek);
      
      // Calculate unpaid absences
      // 1. Get attendance
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
      
      const attendance = await prisma.attendance.findMany({
        where: {
          employeeId: empId,
          date: { gte: startOfMonth, lte: endOfMonth }
        }
      });

      // 2. Get approved leaves
      const leaves = await prisma.leaveRequest.findMany({
        where: {
          employeeId: empId,
          status: 'approved',
          startDate: { lte: endOfMonth },
          endDate: { gte: startOfMonth }
        }
      });

      // Create a set of days present or on paid/sick leave
      const coveredDays = new Set();
      
      attendance.forEach(a => {
        coveredDays.add(a.date.toISOString().split('T')[0]);
      });

      let unpaidLeaveDaysCount = 0;

      leaves.forEach(l => {
        // Simple loop through days of the leave request within this month
        const curr = new Date(Math.max(l.startDate, startOfMonth));
        const end = new Date(Math.min(l.endDate, endOfMonth));
        
        while (curr <= end) {
          const dateStr = curr.toISOString().split('T')[0];
          const dayOfWeek = curr.getDay();
          
          // Only count working days
          const isWorkingDay = (salaryConfig.workingDaysPerWeek === 5 && dayOfWeek !== 0 && dayOfWeek !== 6) ||
                               (salaryConfig.workingDaysPerWeek === 6 && dayOfWeek !== 0) ||
                               (salaryConfig.workingDaysPerWeek === 7);
                               
          if (isWorkingDay) {
            if (l.type === 'unpaid' && !coveredDays.has(dateStr)) {
              unpaidLeaveDaysCount++;
            }
            coveredDays.add(dateStr); // Mark covered so we don't count it as missing
          }
          curr.setDate(curr.getDate() + 1);
        }
      });

      // Find any working days not covered by attendance or leave
      let missingDays = 0;
      for (let i = 1; i <= new Date(year, month, 0).getDate(); i++) {
        const d = new Date(year, month - 1, i);
        const dayOfWeek = d.getDay();
        const isWorkingDay = (salaryConfig.workingDaysPerWeek === 5 && dayOfWeek !== 0 && dayOfWeek !== 6) ||
                             (salaryConfig.workingDaysPerWeek === 6 && dayOfWeek !== 0) ||
                             (salaryConfig.workingDaysPerWeek === 7);
                             
        if (isWorkingDay) {
          const dateStr = d.toISOString().split('T')[0];
          if (!coveredDays.has(dateStr)) {
            missingDays++;
          }
        }
      }

      const totalUnpaidDays = unpaidLeaveDaysCount + missingDays;
      const payableDays = Math.max(0, totalMonthDays - totalUnpaidDays);
      
      // Calculate prorated gross salary
      const prorationFactor = totalMonthDays > 0 ? (payableDays / totalMonthDays) : 0;
      
      let computedBasic = 0;
      let totalGross = 0;
      const components = salaryConfig.components || [];
      const evaluatedComponents = components.map(c => {
        let calcVal = 0;
        let baseValForProration = 0;
        
        if (c.type === 'percentage_of_wage') {
          baseValForProration = (Number(salaryConfig.wage) * Number(c.value)) / 100;
          if (c.name.toLowerCase().includes('basic')) computedBasic = baseValForProration;
        } else if (c.type === 'percentage_of_basic') {
          const basicToUse = computedBasic > 0 ? computedBasic : (Number(salaryConfig.wage) * 0.5);
          baseValForProration = (basicToUse * Number(c.value)) / 100;
        } else if (c.type === 'fixed') {
          baseValForProration = Number(c.value);
        }
        
        calcVal = baseValForProration * prorationFactor;
        totalGross += calcVal;
        return { name: c.name, val: calcVal, originalVal: baseValForProration };
      });

      const grossSalary = totalGross;

      // pfPercentage is stored in EmployeeSalary, we need to calculate the actual deduction amount
      const actualBasic = computedBasic > 0 ? (computedBasic * prorationFactor) : (grossSalary * 0.5);
      const pfDeductionVal = (actualBasic * parseFloat(salaryConfig.pfPercentage || 0)) / 100;
      const ptVal = parseFloat(salaryConfig.professionalTax || 0);

      const netSalary = grossSalary - pfDeductionVal - ptVal;

      const recordData = {
        employeeId: empId,
        companyId: req.user.companyId,
        month: parseInt(month),
        year: parseInt(year),
        payableDays,
        unpaidLeaveDays: totalUnpaidDays,
        grossSalary,
        componentBreakdown: evaluatedComponents,
        pfDeduction: pfDeductionVal,
        professionalTax: ptVal,
        netSalary: Math.max(0, netSalary || 0),
        status: 'draft'
      };

      if (existingRecord) {
        // Overwrite draft
        await prisma.payrollRecord.update({
          where: { id: existingRecord.id },
          data: recordData
        });
        results.push({ employeeId: empId, status: 'overwritten' });
      } else {
        await prisma.payrollRecord.create({ data: recordData });
        results.push({ employeeId: empId, status: 'generated' });
      }
      generatedCount++;
    }

    res.json({ message: `Successfully generated ${generatedCount} records`, results });
  } catch (error) {
    console.error('Error generating payroll:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/payroll/:id
// Admin only. Edit draft.
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { grossSalary, pfDeduction, professionalTax, netSalary } = req.body;

    const record = await prisma.payrollRecord.findUnique({ where: { id: parseInt(id) } });
    if (!record || record.companyId !== req.user.companyId) {
      return res.status(404).json({ error: 'Record not found' });
    }
    
    if (record.status !== 'draft') {
      return res.status(400).json({ error: 'Cannot edit a finalized record' });
    }

    const updated = await prisma.payrollRecord.update({
      where: { id: parseInt(id) },
      data: {
        grossSalary: grossSalary !== undefined ? grossSalary : record.grossSalary,
        pfDeduction: pfDeduction !== undefined ? pfDeduction : record.pfDeduction,
        professionalTax: professionalTax !== undefined ? professionalTax : record.professionalTax,
        netSalary: netSalary !== undefined ? netSalary : record.netSalary
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating payroll:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/payroll/:id/finalize
// Admin only. Finalize draft.
router.put('/:id/finalize', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const record = await prisma.payrollRecord.findUnique({ where: { id: parseInt(id) } });
    if (!record || record.companyId !== req.user.companyId) {
      return res.status(404).json({ error: 'Record not found' });
    }

    if (record.status !== 'draft') {
      return res.status(400).json({ error: 'Record is already finalized' });
    }

    const updated = await prisma.payrollRecord.update({
      where: { id: parseInt(id) },
      data: { status: 'finalized' }
    });

    res.json(updated);
  } catch (error) {
    console.error('Error finalizing payroll:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
