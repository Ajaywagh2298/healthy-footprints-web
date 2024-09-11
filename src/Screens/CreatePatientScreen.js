import React, { useState } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  Grid,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Card,
  CardContent,
  Container,
} from '@mui/material';
import axios from 'axios';
import { BACKEND_HOST_URL } from '../config/config';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function CreatePatientScreen({ user }) {
  const [form, setForm] = useState({
    name: '',
    dateOfBirth: '',
    weight: '',
    height: '',
    bloodGroup: '',
    address: '',
    healthStatus: '',
    staffUid: user?.uid || '', // Use logged-in user's UID
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (name, value) => {
    setForm({ ...form, [name]: value });
  };

  const validate = () => {
    let tempErrors = {};
    tempErrors.name = form.name ? '' : 'This field is required.';
    tempErrors.weight = form.weight && !isNaN(form.weight) ? '' : 'Enter a valid weight.';
    tempErrors.height = form.height && !isNaN(form.height) ? '' : 'Enter a valid height.';
    tempErrors.bloodGroup = form.bloodGroup ? '' : 'This field is required.';
    tempErrors.address = form.address ? '' : 'This field is required.';
    tempErrors.healthStatus = form.healthStatus ? '' : 'Select a health status.';
    setErrors(tempErrors);
    return Object.values(tempErrors).every((x) => x === '');
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      await axios.post(`${BACKEND_HOST_URL}/api/patients`, form ,
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://healthy-footprints-web.vercel.app'
        },
        withCredentials: true, // This includes cookies in the request if your backend expects them
      });
      setForm({
        name: '',
        dateOfBirth: '',
        weight: '',
        height: '',
        bloodGroup: '',
        address: '',
        healthStatus: '',
        staffUid: user?.uid || '',
      });
      navigate('/dashboard'); // Navigate back to the Dashboard screen
    } catch (error) {
      console.error('Error creating patient:', error);
    }
  };

  return (
    <>
    <Navbar />
      <Card sx={{ m: 2, p: 2, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            Create Patient
          </Typography>
          <Box component="form" noValidate autoComplete="off">
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name"
                  variant="outlined"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  error={Boolean(errors.name)}
                  helperText={errors.name}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Date of Birth"
                  variant="outlined"
                  value={form.dateOfBirth}
                  onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                  error={Boolean(errors.dateOfBirth)}
                  helperText={errors.dateOfBirth}
                  placeholder="YYYY-MM-DD"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Weight (kg)"
                  variant="outlined"
                  value={form.weight}
                  onChange={(e) => handleChange('weight', e.target.value)}
                  error={Boolean(errors.weight)}
                  helperText={errors.weight}
                  type="number"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Height (cm)"
                  variant="outlined"
                  value={form.height}
                  onChange={(e) => handleChange('height', e.target.value)}
                  error={Boolean(errors.height)}
                  helperText={errors.height}
                  type="number"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Blood Group"
                  variant="outlined"
                  value={form.bloodGroup}
                  onChange={(e) => handleChange('bloodGroup', e.target.value)}
                  error={Boolean(errors.bloodGroup)}
                  helperText={errors.bloodGroup}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  variant="outlined"
                  value={form.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  error={Boolean(errors.address)}
                  helperText={errors.address}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl component="fieldset" error={Boolean(errors.healthStatus)}>
                  <FormLabel component="legend">Health Status</FormLabel>
                  <RadioGroup
                    row
                    value={form.healthStatus}
                    onChange={(e) => handleChange('healthStatus', e.target.value)}
                  >
                    <FormControlLabel value="Healthy" control={<Radio />} label="Healthy" />
                    <FormControlLabel value="Unhealthy" control={<Radio />} label="Unhealthy" />
                  </RadioGroup>
                  <Typography variant="caption" color="error">
                    {errors.healthStatus}
                  </Typography>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Button fullWidth variant="contained" color="primary" onClick={handleSubmit}>
                  Submit
                </Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </>
  );
}
