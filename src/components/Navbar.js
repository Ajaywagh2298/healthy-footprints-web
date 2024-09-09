import React, { useState } from 'react';
import { AppBar, Toolbar, IconButton, Typography, Avatar, Drawer, List, ListItem, ListItemIcon, ListItemText, Box, Divider, Menu, MenuItem } from '@mui/material';
import { Menu as MenuIcon, Dashboard as DashboardIcon } from '@mui/icons-material';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import VaccinesIcon from '@mui/icons-material/Vaccines';
import SoupKitchenIcon from '@mui/icons-material/SoupKitchen';
import PlaylistAddCheckCircleIcon from '@mui/icons-material/PlaylistAddCheckCircle';
import InventoryIcon from '@mui/icons-material/Inventory';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BACKEND_HOST_URL } from '../config/config';
import { motion } from 'framer-motion';

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
        await axios.get(`${BACKEND_HOST_URL}/api/auth/logout/${user.user.uid}`);
        localStorage.removeItem('user');
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
    { text: 'Diet Plan', icon: <SoupKitchenIcon />, path: '/deit-plan' }, 
    { text: 'Items', icon : <PlaylistAddCheckCircleIcon />, path: '/item' },
    { text: 'Stock List', icon : <InventoryIcon />, path: '/stock' }
  ];

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: '#1976d2', borderRadius: 0 }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleDrawer(true)}>
            <MenuIcon />
          </IconButton>
          <Box display="flex" alignItems="center">
            <IconButton onClick={handleAvatarClick}>
              <Avatar alt="User Avatar" src="/static/images/avatar/1.jpg" sx={{ width: 40, height: 40 }} />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box
          sx={{ width: 240, backgroundColor: '#f5f5f5' }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <Box height={60} display="flex" alignItems="center" justifyContent="center">
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Menu</Typography>
          </Box>
          <Divider />
          <List>
            {menuItems.map((item) => (
              <motion.div whileHover={{ scale: 1.05 }} key={item.text}>
                <ListItem button component={Link} to={item.path} sx={{ '&:hover': { backgroundColor: '#e0e0e0' } }}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItem>
              </motion.div>
            ))}
          </List>
        </Box>
      </Drawer>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            bgcolor: '#ffffff',
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
          },
        }}
      >
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu>
    </>
  );
}
