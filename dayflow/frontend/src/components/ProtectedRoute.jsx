import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Enforce mandatory password change before accessing any dashboard
  if (user.mustChangePassword && location.pathname !== '/auth/change-password') {
    return <Navigate to="/auth/change-password" replace />;
  }

  // If role is restricted, check it
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Optionally redirect to a 'not authorized' page or their respective dashboard
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'employee') return <Navigate to="/employee" replace />;
    return <Navigate to="/auth" replace />;
  }

  return children;
};

export default ProtectedRoute;
