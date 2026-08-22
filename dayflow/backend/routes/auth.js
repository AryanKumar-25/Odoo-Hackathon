const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../db');
const verifyToken = require('../middleware/verifyToken');
const { generateEmployeeId, generateTempPassword } = require('../utils/authUtils');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

// POST /signup (Company + Admin Signup)
router.post('/signup', async (req, res) => {
  try {
    const { companyName, logoUrl, name, email, phone, password } = req.body;

    if (!companyName || !name || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if email already in use
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Create Company
    const company = await prisma.company.create({
      data: { name: companyName, logoUrl }
    });

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Generate an admin employeeId uniquely scoped to the new company
    // Using the auto-incremented company ID guarantees no collisions across companies
    const adminEmployeeId = `ADMIN-C${company.id}`;

    // Create Admin User
    const user = await prisma.user.create({
      data: {
        companyId: company.id,
        employeeId: adminEmployeeId,
        name,
        email,
        phone,
        passwordHash,
        role: 'admin',
        mustChangePassword: false // Admin sets their own password at signup
      }
    });

    const token = jwt.sign(
      { id: user.id, employeeId: user.employeeId, role: user.role, mustChangePassword: user.mustChangePassword, companyId: user.companyId },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        employeeId: user.employeeId,
        name: user.name,
        email: user.email,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
        companyId: user.companyId
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /login
router.post('/login', async (req, res) => {
  try {
    const { loginId, password } = req.body; // loginId can be email or employeeId

    if (!loginId || !password) {
      return res.status(400).json({ error: 'Missing credentials' });
    }

    // Find user by either email OR employeeId
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: loginId },
          { employeeId: loginId }
        ]
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, employeeId: user.employeeId, role: user.role, mustChangePassword: user.mustChangePassword, companyId: user.companyId },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        employeeId: user.employeeId,
        name: user.name,
        email: user.email,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
        companyId: user.companyId
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /change-password
// Reusable for forced first-login OR standard settings change
router.post('/change-password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Missing current or new password' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid current password' });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newPasswordHash,
        mustChangePassword: false
      }
    });

    // Re-issue token since mustChangePassword payload changed
    const token = jwt.sign(
      { id: updatedUser.id, employeeId: updatedUser.employeeId, role: updatedUser.role, mustChangePassword: updatedUser.mustChangePassword, companyId: updatedUser.companyId },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Password updated successfully',
      token,
      user: {
        id: updatedUser.id,
        employeeId: updatedUser.employeeId,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        mustChangePassword: updatedUser.mustChangePassword,
        companyId: updatedUser.companyId
      }
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
