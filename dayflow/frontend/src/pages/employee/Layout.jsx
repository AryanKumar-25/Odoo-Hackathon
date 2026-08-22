import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton 
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { useAuth } from '../../context/AuthContext';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mr: 4 }}>
            Dayflow
          </Typography>
          
          <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
            <Button 
              color={location.pathname === '/employee' ? 'primary' : 'inherit'}
              onClick={() => navigate('/employee')}
            >
              Employees
            </Button>
            <Button 
              color={location.pathname.includes('/employee/attendance') ? 'primary' : 'inherit'}
              onClick={() => navigate('/employee/attendance')}
            >
              Attendance
            </Button>
            <Button 
              color={location.pathname.includes('/employee/timeoff') ? 'primary' : 'inherit'}
              onClick={() => navigate('/employee/timeoff')}
            >
              Time Off
            </Button>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton color="inherit">
              <NotificationsIcon />
            </IconButton>
            <IconButton color="inherit">
              <AccountCircleIcon />
            </IconButton>
            <IconButton color="inherit" onClick={logout} title="Logout">
              <ExitToAppIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: 'background.default' }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
