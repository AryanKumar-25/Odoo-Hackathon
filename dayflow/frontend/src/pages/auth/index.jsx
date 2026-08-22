import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Paper } from '@mui/material';

const AuthPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleAdminLogin = () => {
    // We provide a mock token and mock admin user
    login('mock_admin_token', { id: 1, role: 'admin', employeeId: 'A001', name: 'Admin User' });
    navigate('/admin');
  };

  const handleEmployeeLogin = () => {
    // We provide a mock token and mock employee user
    login('mock_employee_token', { id: 2, role: 'employee', employeeId: 'E001', name: 'John Doe' });
    navigate('/employee');
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: 'background.default' }}>
      <Paper sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'center', minWidth: 300 }}>
        <Typography variant="h5" gutterBottom>
          Authentication
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          (Teammate 1 is building the real auth, use these mock buttons to test routes for now)
        </Typography>
        
        <Button variant="contained" color="primary" onClick={handleAdminLogin}>
          Mock Login as Admin
        </Button>
        <Button variant="outlined" color="primary" onClick={handleEmployeeLogin}>
          Mock Login as Employee
        </Button>
      </Paper>
    </Box>
  );
};

export default AuthPage;
