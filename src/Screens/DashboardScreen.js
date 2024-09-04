import React, { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Box,
    TextField,
    IconButton,
    Typography,
    Paper,
    InputAdornment,
    Card,
    CardActions,
    CardContent,
    Tooltip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Button,
    CircularProgress
} from '@mui/material';
import { Search, Refresh, AccountCircle, AddCircleOutline, ShowChart } from '@mui/icons-material';
import Navbar from '../components/Navbar';
import { BACKEND_HOST_URL } from '../config/config';
import { useNavigate, useLocation } from 'react-router-dom';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import axios from 'axios';

export default function DashboardScreen() {
    const location = useLocation();
    const navigate = useNavigate();
    const { staff } = location.state || {}; // Assuming staff is passed via state

    // State for widgets data
    const [totalMatrix, setTotalMatrix] = useState({});
    // State for patients data
    const [patients, setPatients] = useState([]);
    // State for search query
    const [searchQuery, setSearchQuery] = useState('');
    // State for dialog
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    // State for loading
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchPatients();
        fetchMatrix();
    }, []);

    // Function to fetch patients data
    const fetchPatients = () => {
        setLoading(true);
        fetch(`${BACKEND_HOST_URL}/api/patients`)
            .then((res) => res.json())
            .then((data) => {
                setPatients(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    };

    // Function to fetch metrics data
    const fetchMatrix = () => {
        setLoading(true);
        fetch(`${BACKEND_HOST_URL}/api/auth/metrics`)
            .then((res) => res.json())
            .then((data) => {
                setTotalMatrix(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    };

    // Function to handle refresh button click
    const handleRefresh = () => {
        fetchPatients();
        fetchMatrix();
    };

    const filteredPatients = patients.filter((patient) =>
        patient.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleNavigate = (path, params) => {
        navigate(path, { state: params });
    };

    const handleClickOpen = (patient) => {
        setSelectedPatient(patient);
        setDialogOpen(true);
    };

    const handleClose = () => {
        setDialogOpen(false);
        setSelectedPatient(null);
    };

    const handleUpdate = async () => {
        try {
            await axios.put(`${BACKEND_HOST_URL}/api/patients/${selectedPatient.uid}`, selectedPatient);
            handleClose();
            fetchPatients();
        } catch (error) {
            console.error('Failed to update patient:', error);
        }
    };

    const renderPatient = (patient) => (
        <Card
            key={patient.uid}
            sx={{
                padding: 2,
                marginBottom: 2,
                boxShadow: 3,
                borderRadius: 2,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: 6,
                },
            }}
        >
            <CardContent>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={6}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{patient.name}</Typography>
                        <Box display="flex" alignItems="center">
                            <CalendarTodayIcon sx={{ fontSize: 16, marginRight: 0.5, color: 'gray' }} />
                            <Typography variant="body2" color="text.secondary">
                                {new Date(patient.dateOfBirth).toLocaleDateString()}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={2}>
                        {/* Avatar can be placed here if needed */}
                    </Grid>
                    <Grid item xs={4} textAlign="right">
                        <CardActions sx={{ justifyContent: 'flex-end' }}>
                            <Tooltip title="Add Daily Record">
                                <IconButton onClick={() => handleNavigate('/dailyRecord', { patientUid: patient.uid } )}>
                                    <AddCircleOutline color="primary" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="View Patient Details">
                                <IconButton onClick={() => handleClickOpen(patient)}>
                                    <AccountCircle color="secondary" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="View Charts">
                                <IconButton>
                                    <ShowChart color="action" />
                                </IconButton>
                            </Tooltip>
                        </CardActions>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );

    return (
        <>
            <Navbar />
            <Box sx={{ paddingTop: 2, margin: 2 }}>
                <Grid container spacing={2} justifyContent="space-between" alignItems="center">
                    <Grid item xs={10}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Search Patients"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>
                    <Grid item xs={2}>
                        <IconButton onClick={handleRefresh}>
                            <Refresh />
                        </IconButton>
                    </Grid>
                </Grid>

                <Grid container spacing={2} sx={{ marginTop: 2 }}>
                    <Grid item xs={6}>
                        <Paper sx={{ padding: 2, textAlign: 'center', backgroundColor: '#82e0aa', color: 'white' }}>
                            <Typography>Total Patients</Typography>
                            <Typography variant="h6">{totalMatrix.totalPatients || 0}</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={6}>
                        <Paper sx={{ padding: 2, textAlign: 'center', backgroundColor: '#f0b27a', color: 'white' }}>
                            <Typography>Total Stock Quantity</Typography>
                            <Typography variant="h6">{totalMatrix.totalStockQuantity || 0}</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={6}>
                        <Paper sx={{ padding: 2, textAlign: 'center', backgroundColor: '#85c1e9', color: 'white' }}>
                            <Typography>Total Value</Typography>
                            <Typography variant="h6">{totalMatrix.totalValue || 0}</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={6}>
                        <Paper sx={{ padding: 2, textAlign: 'center', backgroundColor: '#c39bd3', color: 'white' }}>
                            <Typography>Total Users</Typography>
                            <Typography variant="h6">{totalMatrix.totalUsers || 0}</Typography>
                        </Paper>
                    </Grid>
                </Grid>

                <Typography variant="h6" sx={{ margin: 2 }}>
                    Patient's Health Data
                </Typography>

                <Box
                    sx={{
                        marginTop: 1,
                        maxHeight: '40vh', // Adjust height as needed
                        overflowY: 'auto', // Enable scrolling
                        padding: 2,
                        bgcolor: '#f9f9f9',
                        borderRadius: 1,
                        boxShadow: 1,
                    }}
                >
                    {loading ? <CircularProgress /> : filteredPatients.map(renderPatient)}
                </Box>

                {/* Patient Details Dialog */}
                <Dialog open={dialogOpen} onClose={handleClose} fullWidth>
                    <DialogTitle>Patient Details</DialogTitle>
                    <DialogContent>
                        {selectedPatient && (
                            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, padding: 1 }}>
                                <TextField
                                    label="Name"
                                    variant="outlined"
                                    value={selectedPatient.name}
                                    onChange={(e) => setSelectedPatient({ ...selectedPatient, name: e.target.value })}
                                    fullWidth
                                />
                                <TextField
                                    label="Date of Birth"
                                    variant="outlined"
                                    type="date"
                                    value={new Date(selectedPatient.dateOfBirth).toISOString().split('T')[0]}
                                    onChange={(e) => setSelectedPatient({ ...selectedPatient, dateOfBirth: e.target.value })}
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                />
                                <TextField
                                    label="Weight"
                                    variant="outlined"
                                    value={selectedPatient.weight}
                                    onChange={(e) => setSelectedPatient({ ...selectedPatient, weight: e.target.value })}
                                    fullWidth
                                />
                                <TextField
                                    label="Height"
                                    variant="outlined"
                                    value={selectedPatient.height}
                                    onChange={(e) => setSelectedPatient({ ...selectedPatient, height: e.target.value })}
                                    fullWidth
                                />
                                <TextField
                                    label="Address"
                                    variant="outlined"
                                    value={selectedPatient.address}
                                    onChange={(e) => setSelectedPatient({ ...selectedPatient, address: e.target.value })}
                                    fullWidth
                                />
                                {/* Add more fields as needed */}
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button onClick={handleUpdate} color="primary">Update</Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </>
    );
}
