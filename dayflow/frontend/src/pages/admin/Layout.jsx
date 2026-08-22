import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, 
  Drawer, 
  AppBar, 
  Toolbar, 
  List, 
  Typography, 
  Divider, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText 
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { useAuth } from '../../context/AuthContext';

const drawerWidth = 240;

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
    { text: 'Employees', icon: <PeopleIcon />, path: '/admin/employees' },
    { text: 'Attendance', icon: <AccessTimeIcon />, path: '/admin/attendance' },
    { text: 'Leave Requests', icon: <EventNoteIcon />, path: '/admin/leaves' },
    { text: 'Payroll', icon: <AttachMoneyIcon />, path: '/admin/payroll' },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Admin Dashboard
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Dayflow
          </Typography>
        </Toolbar>
        <Divider />
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton 
                selected={location.pathname === item.path || (location.pathname === '/admin/dashboard' && item.path === '/admin')}
                onClick={() => navigate(item.path)}
              >
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider sx={{ mt: 'auto' }} />
        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={logout}>
              <ListItemIcon>
                <ExitToAppIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
      <Box
        component="main"
        sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3, mt: 8 }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
