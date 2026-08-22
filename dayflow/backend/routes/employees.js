const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const prisma = require('../db');

// Require token for all employee directory/profile routes
router.use(verifyToken);

// --- 1. DIRECTORY LISTING ---
// GET /api/employees
// Returns list of employees for the company with today's status
router.get('/', async (req, res) => {
  try {
    const { companyId } = req.user;

    // Fetch all employees in the company
    const users = await prisma.user.findMany({
      where: { companyId, role: 'employee' },
      select: { 
        employeeId: true, 
        name: true,
        // Since we don't have a photoUrl in User, we just return what we have
      }
    });

    if (!users.length) return res.json([]);
    const employeeIds = users.map(u => u.employeeId);

    // Compute today's status for each
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setUTCHours(23, 59, 59, 999);

    // Fetch today's attendance
    const attendance = await prisma.attendance.findMany({
      where: {
        employeeId: { in: employeeIds },
        date: { gte: startOfDay, lte: endOfDay }
      }
    });

    // Fetch today's approved leave
    const leaves = await prisma.leaveRequest.findMany({
      where: {
        employeeId: { in: employeeIds },
        status: 'approved',
        startDate: { lte: endOfDay },
        endDate: { gte: startOfDay }
      }
    });

    const attMap = {};
    attendance.forEach(a => attMap[a.employeeId] = true);
    
    const leaveMap = {};
    leaves.forEach(l => leaveMap[l.employeeId] = true);

    const directory = users.map(u => {
      let status = 'absent';
      if (leaveMap[u.employeeId]) status = 'on-leave';
      else if (attMap[u.employeeId]) status = 'present';

      return {
        employeeId: u.employeeId,
        name: u.name,
        status
      };
    });

    res.json(directory);
  } catch (error) {
    console.error('Error fetching employee directory:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- 2. PROFILE DATA ---
// GET /api/employees/:employeeId/profile
router.get('/:employeeId/profile', async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { tab } = req.query; // 'resume', 'private', 'salary'
    
    // Validate target employee belongs to the same company
    const targetUser = await prisma.user.findUnique({
      where: { employeeId },
      include: { company: true }
    });

    if (!targetUser || targetUser.companyId !== req.user.companyId) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const isSelf = req.user.employeeId === employeeId;
    const isAdmin = req.user.role === 'admin';
    const isColleague = !isSelf && !isAdmin;

    // Fetch Profile
    let profile = await prisma.employeeProfile.findUnique({
      where: { employeeId }
    });

    // Auto-create blank profile if none exists
    if (!profile) {
      profile = await prisma.employeeProfile.create({
        data: { employeeId, companyId: targetUser.companyId }
      });
    }

    // Header info (always returned)
    const header = {
      name: targetUser.name,
      employeeId: targetUser.employeeId,
      email: targetUser.email,
      phone: targetUser.phone,
      department: profile.department,
      manager: profile.manager,
      company: targetUser.company?.name
    };

    if (tab === 'resume') {
      return res.json({
        header,
        resume: {
          about: profile.about,
          hobbies: profile.hobbies,
          skills: profile.skills,
          certifications: profile.certifications
        }
      });
    }

    if (tab === 'private') {
      // Permission Matrix: Admin gets full view+edit. Self gets view+restricted edit. Colleague gets view-only.
      return res.json({
        header,
        privateInfo: {
          dob: profile.dob,
          address: profile.address,
          nationality: profile.nationality,
          personalEmail: profile.personalEmail,
          gender: profile.gender,
          maritalStatus: profile.maritalStatus,
          doj: profile.doj,
          bankDetails: profile.bankDetails,
          emergencyContact: profile.emergencyContact
        }
      });
    }

    if (tab === 'salary') {
      // Permission Matrix: Salary is hidden from colleagues.
      if (isColleague) {
        return res.status(403).json({ error: 'Forbidden: Cannot view colleague salary' });
      }

      let salary = await prisma.employeeSalary.findUnique({
        where: { employeeId }
      });

      if (!salary) {
        salary = await prisma.employeeSalary.create({
          data: { employeeId, companyId: targetUser.companyId }
        });
      }

      return res.json({
        header,
        salary
      });
    }

    return res.status(400).json({ error: 'Invalid tab requested' });

  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/employees/:employeeId/profile
router.patch('/:employeeId/profile', async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    // Cross-company check
    const targetUser = await prisma.user.findUnique({ where: { employeeId } });
    if (!targetUser || targetUser.companyId !== req.user.companyId) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const isSelf = req.user.employeeId === employeeId;
    const isAdmin = req.user.role === 'admin';
    const isColleague = !isSelf && !isAdmin;

    if (isColleague) {
      return res.status(403).json({ error: 'Forbidden: Cannot edit colleague profile' });
    }

    const updateData = { ...req.body };
    
    // Strip restricted fields if Self
    if (isSelf && !isAdmin) {
      // Self can only edit address, phone (on User), photo, and Resume fields
      const allowedProfileFields = ['address', 'about', 'hobbies', 'skills', 'certifications'];
      Object.keys(updateData).forEach(key => {
        if (!allowedProfileFields.includes(key) && key !== 'phone') {
          delete updateData[key];
        }
      });
    }

    // If phone is being updated, it belongs to the User model
    if (updateData.phone !== undefined) {
      await prisma.user.update({
        where: { employeeId },
        data: { phone: updateData.phone }
      });
      delete updateData.phone;
    }

    // The rest belongs to EmployeeProfile
    if (Object.keys(updateData).length > 0) {
      await prisma.employeeProfile.upsert({
        where: { employeeId },
        update: updateData,
        create: {
          employeeId,
          companyId: targetUser.companyId,
          ...updateData
        }
      });
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/employees/:employeeId/salary
router.put('/:employeeId/salary', async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin only' });
    }

    // Cross-company check
    const targetUser = await prisma.user.findUnique({ where: { employeeId } });
    if (!targetUser || targetUser.companyId !== req.user.companyId) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const { wage, workingDaysPerWeek, breakTimeMinutes, pfPercentage, professionalTax, components } = req.body;

    // Validate percentages
    if (components && Array.isArray(components)) {
      let totalPercentageOfWage = 0;
      components.forEach(c => {
        if (c.type === 'percentage_of_wage') {
          totalPercentageOfWage += c.value;
        }
      });
      if (totalPercentageOfWage > 100) {
        return res.status(400).json({ error: 'Components percentage of wage cannot exceed 100%' });
      }
    }

    const updated = await prisma.employeeSalary.upsert({
      where: { employeeId },
      update: {
        wage,
        workingDaysPerWeek,
        breakTimeMinutes,
        pfPercentage,
        professionalTax,
        components
      },
      create: {
        employeeId,
        companyId: targetUser.companyId,
        wage,
        workingDaysPerWeek,
        breakTimeMinutes,
        pfPercentage,
        professionalTax,
        components
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating salary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
