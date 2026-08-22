import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Layout';
import Attendance from './Attendance';
import Leave from './Leave';

import EmployeeDirectory from '../employees/EmployeeDirectory';
import EmployeeProfile from '../employees/EmployeeProfile';
import EmployeePayroll from '../payroll/EmployeePayroll';

const EmployeeDashboard = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<EmployeeDirectory />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="leave" element={<Leave />} />
        <Route path="profile/:employeeId" element={<EmployeeProfile />} />
        <Route path="payroll" element={<EmployeePayroll />} />
      </Route>
    </Routes>
  );
};

export default EmployeeDashboard;
