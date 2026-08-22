import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import DashboardHome from './DashboardHome';
import Employees from './Employees';
import Attendance from './Attendance';
import Leaves from './Leaves';
import Payroll from './Payroll';

const AdminDashboard = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<DashboardHome />} />
        <Route path="employees" element={<Employees />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="leaves" element={<Leaves />} />
        <Route path="payroll" element={<Payroll />} />
      </Route>
    </Routes>
  );
};

export default AdminDashboard;
