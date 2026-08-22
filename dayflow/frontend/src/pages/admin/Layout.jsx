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

const drawerWidth = 260;

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    { text: 'My Profile', icon: <DashboardIcon fontSize="small" />, path: '/admin/profile' },
    { text: 'Employees', icon: <PeopleIcon fontSize="small" />, path: '/admin/employees' },
    { text: 'Attendance', icon: <AccessTimeIcon fontSize="small" />, path: '/admin/attendance' },
    { text: 'Leave Requests', icon: <EventNoteIcon fontSize="small" />, path: '/admin/leaves' },
    { text: 'Payroll', icon: <AttachMoneyIcon fontSize="small" />, path: '/admin/payroll' },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          width: { sm: `calc(100% - ${drawerWidth}px)` }, 
          ml: { sm: `${drawerWidth}px` },
          bgcolor: '#fff',
          borderBottom: '2px solid #000',
          color: '#000'
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h4" noWrap component="div" sx={{ fontSize: '1.25rem' }}>
            ADMIN DASHBOARD
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ 
              width: 40, 
              height: 40, 
              bgcolor: '#FFE17C', 
              border: '2px solid #000', 
              boxShadow: '2px 2px 0 #000',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800
            }}>
              A
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: '2px solid #000',
            bgcolor: '#fff'
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar sx={{ borderBottom: '2px solid #000', bgcolor: '#FFE17C' }}>
          <Typography variant="h2" sx={{ fontSize: '1.5rem', width: '100%', textAlign: 'center' }}>
            DAYFLOW
          </Typography>
        </Toolbar>
        <Box sx={{ p: 2, flexGrow: 1 }}>
          <List sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {menuItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <ListItem key={item.text} disablePadding>
                  <ListItemButton 
                    onClick={() => navigate(item.path)}
                    sx={{
                      borderRadius: '8px',
                      border: '2px solid',
                      borderColor: isActive ? '#000' : 'transparent',
                      bgcolor: isActive ? '#FFE17C' : 'transparent',
                      boxShadow: isActive ? '4px 4px 0 #000' : 'none',
                      transform: isActive ? 'translate(-2px, -2px)' : 'none',
                      mb: isActive ? 0.5 : 0,
                      transition: 'all 0.1s ease',
                      '&:hover': {
                        bgcolor: isActive ? '#FFE17C' : '#f0f0f0',
                        borderColor: isActive ? '#000' : 'transparent',
                      }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Box sx={{ 
                        display: 'flex', 
                        p: 0.5, 
                        bgcolor: isActive ? '#fff' : '#B7C6C2', 
                        border: '2px solid #000',
                        borderRadius: '6px',
                        color: '#000'
                      }}>
                        {item.icon}
                      </Box>
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.text} 
                      primaryTypographyProps={{ 
                        fontWeight: 800, 
                        fontFamily: 'Cabinet Grotesk, system-ui, sans-serif'
                      }} 
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>
        <Box sx={{ p: 2, borderTop: '2px solid #000' }}>
          <List>
            <ListItem disablePadding>
              <ListItemButton 
                onClick={logout}
                sx={{
                  borderRadius: '8px',
                  border: '2px solid transparent',
                  '&:hover': {
                    bgcolor: '#171E19',
                    color: '#fff',
                    borderColor: '#000',
                    '& .MuiListItemIcon-root box': {
                      bgcolor: '#fff',
                      color: '#000'
                    }
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    p: 0.5, 
                    bgcolor: '#fff', 
                    border: '2px solid #000',
                    borderRadius: '6px',
                    color: '#000'
                  }}>
                    <ExitToAppIcon fontSize="small" />
                  </Box>
                </ListItemIcon>
                <ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: 800 }} />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, mt: '64px', minHeight: 'calc(100vh - 64px)' }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
