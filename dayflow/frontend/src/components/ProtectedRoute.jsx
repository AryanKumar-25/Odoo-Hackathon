import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { token, user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    // If they don't have the required role, redirect them or show 403
    return <div>403 Forbidden: You do not have access to this page.</div>;
  }

  return children;
};

export default ProtectedRoute;
