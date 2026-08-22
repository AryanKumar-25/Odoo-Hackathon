import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SignIn from './SignIn';
import CompanySignUp from './CompanySignUp';
import ChangePassword from './ChangePassword';

const AuthRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="login" replace />} />
      <Route path="login" element={<SignIn />} />
      <Route path="signup" element={<CompanySignUp />} />
      <Route path="change-password" element={<ChangePassword />} />
    </Routes>
  );
};

export default AuthRouter;
