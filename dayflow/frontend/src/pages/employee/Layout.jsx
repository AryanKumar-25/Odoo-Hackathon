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

  const navItems = [
    { label: 'Directory', path: '/employee', exact: true },
    { label: 'Attendance', path: '/employee/attendance' },
    { label: 'Time Off', path: '/employee/leave' },
    { label: 'Payroll', path: '/employee/payroll' },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{ 
          bgcolor: '#fff', 
          borderBottom: '2px solid #000',
          color: '#000'
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', px: { xs: 2, md: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Typography variant="h2" sx={{ fontSize: '1.5rem', bgcolor: '#FFE17C', px: 2, py: 0.5, border: '2px solid #000', borderRadius: '8px', boxShadow: '2px 2px 0 #000' }}>
              DAYFLOW
            </Typography>
            
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
              {navItems.map(item => {
                const isActive = item.exact 
                  ? location.pathname === item.path 
                  : location.pathname.startsWith(item.path);
                  
                return (
                  <Button 
                    key={item.label}
                    onClick={() => navigate(item.path)}
                    sx={{
                      fontWeight: 800,
                      color: '#000',
                      border: '2px solid transparent',
                      bgcolor: isActive ? '#FFE17C' : 'transparent',
                      border: isActive ? '2px solid #000' : '2px solid transparent',
                      boxShadow: isActive ? '2px 2px 0 #000' : 'none',
                      transform: isActive ? 'translate(-2px, -2px)' : 'none',
                      '&:hover': {
                        bgcolor: isActive ? '#FFE17C' : '#f0f0f0',
                      }
                    }}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {!todayRecord ? (
                <Button variant="contained" sx={{ bgcolor: '#000', color: '#fff', '&:hover': { bgcolor: '#171E19' } }} onClick={handleCheckIn}>
                  Check In
                </Button>
              ) : isCheckedIn ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="subtitle2" fontWeight="800">
                    Since {formatCheckInTime}
                  </Typography>
                  <Button variant="outlined" onClick={handleCheckOut}>
                    Check Out
                  </Button>
                </Box>
              ) : (
                <Typography variant="subtitle2" fontWeight="800" sx={{ bgcolor: '#B7C6C2', px: 2, py: 0.5, border: '2px solid #000', borderRadius: '4px' }}>
                  Checked out
                </Typography>
              )}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton sx={{ border: '2px solid transparent', '&:hover': { border: '2px solid #000', bgcolor: '#f0f0f0' } }}>
                <NotificationsIcon sx={{ color: '#000' }} />
              </IconButton>
              
              <IconButton 
                onClick={handleMenu} 
                sx={{ 
                  p: 0, 
                  border: '2px solid #000', 
                  borderRadius: '8px',
                  boxShadow: '2px 2px 0 #000',
                  transition: 'transform 0.1s ease',
                  '&:hover': { transform: 'translate(-1px, -1px)', boxShadow: '3px 3px 0 #000' }
                }}
              >
                <Avatar sx={{ width: 40, height: 40, bgcolor: '#FFE17C', color: '#000', fontWeight: 800, borderRadius: '6px' }}>
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                  sx: {
                    mt: 1,
                    border: '2px solid #000',
                    boxShadow: '4px 4px 0 #000',
                    borderRadius: '8px',
                  }
                }}
              >
                <MenuItem onClick={goToProfile} sx={{ fontWeight: 700 }}>My Profile</MenuItem>
                <MenuItem onClick={doLogout} sx={{ fontWeight: 700, color: 'error.main' }}>Log Out</MenuItem>
              </Menu>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 4 } }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
