import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Layout';
import Attendance from './Attendance';

const EmployeeDashboard = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Default to attendance or you could build a generic home later */}
        <Route index element={<Navigate to="attendance" replace />} />
        <Route path="attendance" element={<Attendance />} />
        {/* <Route path="timeoff" element={<TimeOff />} /> */}
      </Route>
    </Routes>
  );
};

export default EmployeeDashboard;
