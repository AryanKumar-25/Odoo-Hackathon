import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton,
  Menu,
  MenuItem,
  Badge,
  Avatar
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useAuth } from '../../context/AuthContext';
import { getMyAttendance, checkIn, checkOut } from '../../api/employee';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [anchorEl, setAnchorEl] = useState(null);
  const [todayRecord, setTodayRecord] = useState(null);

  const fetchAttendance = async () => {
    try {
      const now = new Date();
      const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const res = await getMyAttendance(monthStr);
      
      const todayStr = now.toISOString().split('T')[0];
      const todayAtt = res.data.find(r => r.date.startsWith(todayStr));
      setTodayRecord(todayAtt || null);
    } catch (err) {
      console.error('Error fetching today attendance for nav', err);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handleCheckIn = async () => {
    try {
      await checkIn();
      fetchAttendance();
    } catch (err) {
      console.error(err);
      alert('Failed to check in');
    }
  };

  const handleCheckOut = async () => {
    try {
      await checkOut();
      fetchAttendance();
    } catch (err) {
      console.error(err);
      alert('Failed to check out');
    }
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const goToProfile = () => {
    handleClose();
    navigate(`/employee/profile/${user.employeeId}`);
  };

  const doLogout = () => {
    handleClose();
    logout();
  };

  const isCheckedIn = todayRecord && todayRecord.checkIn && !todayRecord.checkOut;
  const isCheckedOut = todayRecord && todayRecord.checkOut;
  
  let formatCheckInTime = "";
  if (isCheckedIn || isCheckedOut) {
    formatCheckInTime = new Date(todayRecord.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

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
              color={location.pathname.includes('/employee/leave') ? 'primary' : 'inherit'}
              onClick={() => navigate('/employee/leave')}
            >
              Time Off
            </Button>
            <Button 
              color={location.pathname.includes('/employee/payroll') ? 'primary' : 'inherit'}
              onClick={() => navigate('/employee/payroll')}
            >
              Payroll
            </Button>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {!todayRecord ? (
              <Button variant="contained" color="primary" onClick={handleCheckIn}>
                Check In
              </Button>
            ) : isCheckedIn ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption" color="textSecondary">
                  Since {formatCheckInTime}
                </Typography>
                <Button variant="outlined" color="primary" onClick={handleCheckOut}>
                  Check Out
                </Button>
              </Box>
            ) : (
              <Typography variant="caption" color="textSecondary">
                Checked out today
              </Typography>
            )}

            <IconButton color="inherit">
              <NotificationsIcon />
            </IconButton>
            
            <IconButton onClick={handleMenu} color="inherit">
              <Badge 
                overlap="circular" 
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                variant="dot"
                color={isCheckedIn ? 'success' : 'error'}
              >
                <Avatar sx={{ width: 32, height: 32 }} />
              </Badge>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={goToProfile}>My Profile</MenuItem>
              <MenuItem onClick={doLogout}>Log Out</MenuItem>
            </Menu>
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
