import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Typography,
  Container,
  Box,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Paper,
  CssBaseline
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BACKEND_HOST_URL } from '../config/config';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [dialogTitle, setDialogTitle] = useState('');
  const [isRegister, setIsRegister] = useState(false);

  // Registration form states
  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [type, setType] = useState('');

  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.user.token && user.user.uid) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleLogin = async () => {
    try {
      const { data } = await axios.post(`${BACKEND_HOST_URL}/api/auth/login`, { username, password },
      {
        headers: {
          'Content-Type': 'application/json',  // Ensure the request content type is JSON
        },
        withCredentials: true, // This includes cookies in the request if your backend expects them
      });
      localStorage.setItem('user', JSON.stringify(data));  // Store the user data

      setDialogTitle('Success');
      setDialogMessage('Login Successful!');
      setDialogOpen(true);
      
      setTimeout(() => {
        setDialogOpen(false);
        navigate('/dashboard', { replace: true });
      }, 1000);  // Adding a delay to allow the dialog to close
    } catch (error) {
      setDialogTitle('Error');
      setDialogMessage('Invalid Credentials');
      setDialogOpen(true);
    }
  };

  const handleRegister = async () => {
    try {
      await axios.post(`${BACKEND_HOST_URL}/api/auth/register`, { username, name, password, dateOfBirth, type },
      {
        headers: {
          'Content-Type': 'application/json',  // Ensure the request content type is JSON
          'Authorization': `Bearer`, // Add any custom headers you need (e.g., auth tokens)
        },
        withCredentials: true, // This includes cookies in the request if your backend expects them
      });
      setDialogTitle('Success');
      setDialogMessage('Registration Successful! Please log in.');
      setDialogOpen(true);
      setIsRegister(false);
    } catch (error) {
      setDialogTitle('Error');
      setDialogMessage('Registration Failed. Please try again.');
      setDialogOpen(true);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Paper
        elevation={6}
        sx={{
          marginTop: 8,
          padding: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderRadius: 3,
          backgroundColor: '#f5f5f5',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5" sx={{ fontWeight: 'bold', color: '#3f51b5' }}>
          {isRegister ? 'Register' : 'Sign In'}
        </Typography>
        <Box component="form" noValidate sx={{ mt: 3, width: '100%' }}>
          {isRegister ? (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="username"
                  label="Username"
                  name="username"
                  autoComplete="username"
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="name"
                  label="Name"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="dateOfBirth"
                  label="Date of Birth"
                  type="date"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="type-label">Type</InputLabel>
                  <Select
                    labelId="type-label"
                    id="type"
                    value={type}
                    label="Type"
                    onChange={(e) => setType(e.target.value)}
                  >
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="staff">Staff</MenuItem>
                    <MenuItem value="user">User</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Button
                type="button"
                fullWidth
                variant="contained"
                color="primary"
                sx={{ mt: 3, mb: 2 }}
                onClick={handleRegister}
              >
                Register
              </Button>
              <Button
                type="button"
                fullWidth
                variant="outlined"
                color="primary"
                onClick={() => setIsRegister(false)}
              >
                Back to Login
              </Button>
            </Grid>
          ) : (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="username"
                  label="Username"
                  name="username"
                  autoComplete="username"
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Grid>
              <Button
                type="button"
                fullWidth
                variant="contained"
                color="primary"
                sx={{ mt: 3, mb: 2 }}
                onClick={handleLogin}
              >
                Sign In
              </Button>
              <Button
                type="button"
                fullWidth
                variant="outlined"
                color="primary"
                onClick={() => setIsRegister(true)}
              >
                Register
              </Button>
            </Grid>
          )}
        </Box>
      </Paper>

      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent>
          <Typography>{dialogMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
