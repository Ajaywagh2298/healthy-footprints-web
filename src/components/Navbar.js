import React, { useState } from 'react';
import { AppBar, Toolbar, IconButton, Typography, Avatar, Drawer, List, ListItem, ListItemIcon, ListItemText, Box, Divider, Menu, MenuItem } from '@mui/material';
import { Menu as MenuIcon, Dashboard as DashboardIcon } from '@mui/icons-material';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import VaccinesIcon from '@mui/icons-material/Vaccines';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BACKEND_HOST_URL } from '../config/config';

export default function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    const user = JSON.parse(localStorage.getItem('user'));

    if (user && user.user.uid) {
      try {
        // Call the logout API
        await axios.get(`${BACKEND_HOST_URL}/api/auth/logout/${user.user.uid}`);

        // Remove user from localStorage
        localStorage.removeItem('user');

        // Navigate to login page
        navigate('/', { replace: true });
      } catch (error) {
        console.error('Logout failed', error);
      }
    }
    handleMenuClose();
  };

  const menuItems = [
    { text: 'Home', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Create Patient', icon: <AssignmentIndIcon />, path: '/createPatient' },
    { text: 'Reminder', icon: <NotificationsActiveIcon />, path: '/reminder' },
    { text: 'Medicine Plan', icon: <VaccinesIcon />, path: '/medicine' },
  ];

  return (
    <>
      <AppBar position="static" color="default" sx={{ borderRadius: 1 }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* Left Side: Menu Button */}
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleDrawer(true)}>
            <MenuIcon />
          </IconButton>

          {/* Right Side: User Avatar */}
          <Box display="flex" alignItems="center">
            <IconButton onClick={handleAvatarClick}>
              <Avatar alt="User Avatar" src="/static/images/avatar/1.jpg" />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer for the Menu */}
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box
          sx={{ width: 240 }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <Box height={60} display="flex" alignItems="center" justifyContent="center">
            <Typography variant="h6">Menu</Typography>
          </Box>
          <Divider />
          <List>
            {menuItems.map((item) => (
              <ListItem button key={item.text} component={Link} to={item.path}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Menu for Avatar */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu>
    </>
  );
}
