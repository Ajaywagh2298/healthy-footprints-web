import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    TextField,
    IconButton,
    CircularProgress,
    Button,
    Box,
    Grid,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TablePagination,
    Select,
    MenuItem,
    InputLabel,
} from '@mui/material';
import { Refresh, AddCircleOutline, CalendarToday, Visibility, Search, Edit as EditIcon } from '@mui/icons-material';
import axios from 'axios';
import Navbar from '../components/Navbar';
import DeleteIcon from '@mui/icons-material/Delete';
import { BACKEND_HOST_URL } from '../config/config';

export default function DietPlanScreen() {
    const [dietPlans, setDietPlans] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [viewOpen, setViewOpen] = useState(false);
    const [selectedDietPlan, setSelectedDietPlan] = useState(null);
    const [newDietPlan, setNewDietPlan] = useState({
        _id: '', // Changed uid to _id to match ObjectId
        patientUid: '',
        meals: [],
        time: '', // Keep as string for input but convert before submission
        dietType: '',
        staffUid: '',
    });

    const user = JSON.parse(localStorage.getItem('user'));
    const staffUid = user ? user.user.uid : '';

    const [openMealForm, setOpenMealForm] = useState(false);
    const [mealData, setMealData] = useState({ name: '', quantity: '', unit: '' });

    const [patients, setPatients] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        fetchPatients();
        fetchDietPlans();
    }, []);

    async function fetchPatients() {
        try {
            const response = await axios.get(`${BACKEND_HOST_URL}/api/patients`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': 'https://healthy-footprints-web.vercel.app'
                    },
                    withCredentials: true, // This includes cookies in the request if your backend expects them
                });
            setPatients(response.data);
        } catch (error) {
            console.error('Failed to fetch patients:', error);
        }
    }

    async function fetchDietPlans() {
        setLoading(true);
        try {
            const response = await axios.get(`${BACKEND_HOST_URL}/api/dietPlans/`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': 'https://healthy-footprints-web.vercel.app'
                    },
                    withCredentials: true, // This includes cookies in the request if your backend expects them
                });
            response.data.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
            setDietPlans(response.data);
        } catch (error) {
            console.error('Failed to fetch diet plans:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleDietPlanClick = (dietPlan) => {
        setSelectedDietPlan(dietPlan);
        setViewOpen(true);
    };

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setNewDietPlan({
            _id: '', // Reset _id on close
            patientUid: '',
            meals: [],
            time: '',
            dietType: '',
            staffUid: staffUid,
        });
        setOpen(false);
    };

    const handleViewClose = () => {
        setViewOpen(false);
    };

    const handleInputChange = (name, value) => {
        setNewDietPlan((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleRemoveMeal = (index) => {
        const updatedMeals = newDietPlan.meals.filter((_, i) => i !== index);
        setNewDietPlan((prev) => ({
            ...prev,
            meals: updatedMeals,
        }));
    };

    const handleMealFormOpen = () => {
        setMealData({ name: '', quantity: '', unit: '' });
        setOpenMealForm(true);
    };

    const handleMealFormClose = () => {
        setOpenMealForm(false);
    };

    const handleMealDataChange = (field, value) => {
        setMealData((prev) => ({ ...prev, [field]: value }));
    };

    const handleMealSave = () => {
        setNewDietPlan((prev) => ({
            ...prev,
            meals: [...prev.meals, mealData]
        }));
        handleMealFormClose();
    };

    const handleEditMeal = (index) => {
        setMealData(newDietPlan.meals[index]);
        setOpenMealForm(true);
    };

    const handleSubmit = async () => {
        try {
            if (newDietPlan.meals.length === 0) {
                alert('Please add at least one meal before submitting the plan.');
                return; // Prevent further execution
            }

            await axios.post(`${BACKEND_HOST_URL}/api/dietPlans/`, {
                ...newDietPlan,
                time: new Date(`1970-01-01T${newDietPlan.time}:00`), // Convert time to Date object
                createdDate: new Date(),
                updatedDate: new Date(),
            },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': 'https://healthy-footprints-web.vercel.app'
                    },
                    withCredentials: true, // This includes cookies in the request if your backend expects them
                });

            setNewDietPlan({
                _id: '', // Reset _id on submit
                patientUid: '',
                meals: [],
                time: '',
                dietType: '',
                staffUid: staffUid,
            });
            fetchDietPlans();
            handleClose();
        } catch (error) {
            console.error('Failed to create diet plan:', error);
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleDeleteDietPlan = async (id) => {
        try {
            await axios.delete(`${BACKEND_HOST_URL}/api/dietPlans/${id}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': 'https://healthy-footprints-web.vercel.app'
                    },
                    withCredentials: true, // This includes cookies in the request if your backend expects them
                });
            fetchDietPlans(); // Refresh the diet plans after deletion
        } catch (error) {
            console.error('Failed to delete diet plan:', error);
        }
    };

    return (
        <>
            <Navbar />
            <Container maxWidth="md">
                <Box display="flex" flexDirection="column" alignItems="center" padding={2} mt={4}>
                    <Box display="flex" alignItems="center" mb={3} width="100%">
                        <TextField
                            variant="outlined"
                            placeholder="Search Diet Plan"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            InputProps={{
                                startAdornment: <Search />,
                            }}
                            sx={{ flexGrow: 1, marginRight: 2 }}
                        />
                        <IconButton onClick={fetchDietPlans} color="primary">
                            <Refresh />
                        </IconButton>
                    </Box>

                    {loading ? (
                        <CircularProgress />
                    ) : (
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Index</TableCell>
                                        <TableCell>Patient</TableCell>
                                        <TableCell>Time</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {dietPlans.length > 0 ? dietPlans.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((dietPlan, index) => (
                                        <TableRow key={dietPlan._id || index}> {/* Changed uid to _id */}
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{patients.find((d) => d.uid === dietPlan.patientUid)?.name || 'Unknown'}</TableCell>
                                            <TableCell>{new Date(dietPlan.time).toLocaleTimeString()}</TableCell>
                                            <TableCell>
                                                <IconButton size="small" color="primary" onClick={() => handleDietPlanClick(dietPlan)}>
                                                    <Visibility />
                                                </IconButton>
                                                <IconButton size="small" color="error" onClick={() => handleDeleteDietPlan(dietPlan._id)}> {/* Changed uid to _id */}
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={4}>
                                                <Typography variant="body1" align="center">No Diet Plans Found</Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                            <TablePagination
                                rowsPerPageOptions={[10, 15, 25]}
                                component="div"
                                count={dietPlans.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                            />
                        </TableContainer>
                    )}
                </Box>
            </Container>

            <Box position="fixed" bottom={16} right={16}>
                <IconButton
                    color="primary"
                    style={{ width: 60, height: 60 }}
                    onClick={handleClickOpen}
                >
                    <AddCircleOutline style={{ fontSize: 60 }} />
                </IconButton>
            </Box>

            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
                <DialogTitle>Create Diet Plan</DialogTitle>
                <DialogContent>
                    <Box component="form" noValidate autoComplete="off" sx={{ mt: 1 }}>
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Patient</InputLabel>
                            <Select
                                value={newDietPlan.patientUid}
                                onChange={(e) => handleInputChange('patientUid', e.target.value)}
                            >
                                {patients.map((patient) => (
                                    <MenuItem key={patient.uid} value={patient.uid}>
                                        {patient.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            margin="normal"
                            label="Diet Time"
                            type="time"
                            fullWidth
                            value={newDietPlan.time}
                            onChange={(e) => handleInputChange('time', e.target.value)}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            inputProps={{
                                step: 300,
                            }}
                        />
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Diet Type</InputLabel>
                            <Select
                                value={newDietPlan.dietType}
                                onChange={(e) => handleInputChange('dietType', e.target.value)}
                            >
                                <MenuItem value="liquid">Liquid</MenuItem>
                                <MenuItem value="solid">Solid</MenuItem>
                                <MenuItem value="healthy">Healthy</MenuItem>
                            </Select>
                        </FormControl>
                        <Box mt={3}>
                            <Typography variant="h6">Meals</Typography>
                            {newDietPlan.meals.length > 0 ? (
                                <TableContainer component={Paper}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Name</TableCell>
                                                <TableCell>Quantity</TableCell>
                                                <TableCell>Unit</TableCell>
                                                <TableCell>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody sx={{ fontSize: 14 }}>
                                            {newDietPlan.meals.map((meal, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{meal.name}</TableCell>
                                                    <TableCell>{meal.quantity}</TableCell>
                                                    <TableCell>{meal.unit}</TableCell>
                                                    <TableCell>
                                                        <IconButton onClick={() => handleEditMeal(index)} color="primary">
                                                            <EditIcon />
                                                        </IconButton>
                                                        <IconButton onClick={() => handleRemoveMeal(index)} color="error">
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                <Typography variant="body2">No Meals Added</Typography>
                            )}
                            <Button onClick={handleMealFormOpen} variant="outlined" sx={{ mt: 2 }}>
                                Add Meal
                            </Button>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} color="primary">
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openMealForm} onClose={handleMealFormClose} fullWidth maxWidth="xs">
                <DialogTitle>Add Meal</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Meal Name"
                        value={mealData.name}
                        onChange={(e) => handleMealDataChange('name', e.target.value)}
                        margin="dense"
                    />
                    <TextField
                        fullWidth
                        label="Quantity"
                        type="number"
                        value={mealData.quantity}
                        onChange={(e) => handleMealDataChange('quantity', e.target.value)}
                        margin="dense"
                    />
                    <TextField
                        fullWidth
                        label="Unit"
                        value={mealData.unit}
                        onChange={(e) => handleMealDataChange('unit', e.target.value)}
                        margin="dense"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleMealFormClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleMealSave} color="primary">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={viewOpen} onClose={handleViewClose} fullWidth maxWidth="sm">
                <DialogTitle>View Diet Plan Details</DialogTitle>
                <DialogContent>
                    {selectedDietPlan && (
                        <Box>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center' }}>
                                    <CalendarToday sx={{ fontSize: 20, marginRight: 1 }} />
                                    {selectedDietPlan.createdDate ? new Date(selectedDietPlan.createdDate).toLocaleDateString() : 'N/A'}
                                </Typography>
                            </Box>
                            <Divider sx={{ my: 2 }} />
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="body2"><strong>Time:</strong> {new Date(selectedDietPlan.time).toLocaleTimeString()}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="h6">Meals</Typography>
                                    {selectedDietPlan.meals && selectedDietPlan.meals.map((meal, index) => (
                                        <Box key={index} display="flex" alignItems="center" mb={1}>
                                            <Typography variant="body2" sx={{ mr: 2 }}>{meal.name}</Typography>
                                            <Typography variant="body2" sx={{ mr: 2 }}>{meal.quantity}</Typography>
                                            <Typography variant="body2">{meal.unit}</Typography>
                                        </Box>
                                    ))}
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleViewClose} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
