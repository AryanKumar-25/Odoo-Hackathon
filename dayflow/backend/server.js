const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Import routes (these can be filled in by teammates)
const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employee');
const employeesRoutes = require('./routes/employees');
const adminRoutes = require('./routes/admin');
const payrollRoutes = require('./routes/payroll');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/employees', employeesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payroll', payrollRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
