import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Layout';
import Employees from './Employees';
import Attendance from './Attendance';
import Leaves from './Leaves';
import AdminPayroll from '../payroll/AdminPayroll';
import EmployeeProfile from '../employees/EmployeeProfile';

const AdminDashboard = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Default to Admin's own profile */}
        <Route index element={<Navigate to="profile" replace />} />
        <Route path="profile" element={<EmployeeProfile />} />
        <Route path="profile/:employeeId" element={<EmployeeProfile />} />
        <Route path="employees" element={<Employees />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="leaves" element={<Leaves />} />
        <Route path="payroll" element={<AdminPayroll />} />
      </Route>
    </Routes>
  );
};

export default AdminDashboard;
