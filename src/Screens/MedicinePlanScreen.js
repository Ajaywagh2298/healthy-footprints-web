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
    FormControlLabel,
    Switch,
    Checkbox,
    ListItemText
} from '@mui/material';
import { Refresh, AddCircleOutline, CalendarToday, Visibility, Search, Edit as EditIcon } from '@mui/icons-material';
import axios from 'axios';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import Navbar from '../components/Navbar';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import { BACKEND_HOST_URL } from '../config/config';

export default function MedicinePlanScreen() {
    const [reminders, setReminders] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [viewOpen, setViewOpen] = useState(false);
    const [selectedReminder, setSelectedReminder] = useState(null);
    const [newMedicine, setNewMedicine] = useState({
        patientUid: '',
        time: '',
        staffUid: '',
        medicines: [],
        setReminder: false,
        reminderForAll: false,
        reminderFrequency: '',
        reminderTimeDay: [],
        reminderTimeDate: ''
    });

    const user = JSON.parse(localStorage.getItem('user'));
    const staffUid = user ? user.user.uid : '';

    const [newReminder, setNewReminder] = useState({
        patientUid: '',
        reminderType: 'Medicine',
        reminderFrequency: '',
        reminderTimeStart: '',
        reminderTimeEnd: '',
        reminderTimeDate: '',
        reminderTimeDay: [],
        reminderMessage: 'Hey! Take Your Medicine On Time!',
        note: '',
        notificationPushType: '',
    });
    const [openMedicineForm, setOpenMedicineForm] = useState(false);
    const [medicineData, setMedicineData] = useState({ name: '', quantity: '', unit: '' });

    const [selectedDates, setSelectedDates] = useState([]);
    const [patients, setPatients] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const dayOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    useEffect(() => {
        fetchPatients();
        fetchReminders();
    }, []);

    async function fetchPatients() {
        try {
            const response = await axios.get(`${BACKEND_HOST_URL}/api/patients`);
            setPatients(response.data);
        } catch (error) {
            console.error('Failed to fetch patients:', error);
        }
    }

    async function fetchReminders() {
        setLoading(true);
        try {
            const response = await axios.get(`${BACKEND_HOST_URL}/api/medicinePlans/`);
            response.data.sort((a, b) => new Date(b.createDate) - new Date(a.createDate));
            setReminders(response.data);
        } catch (error) {
            console.error('Failed to fetch reminders:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleReminderClick = (reminder) => {
        setSelectedReminder(reminder);
        setViewOpen(true);
    };

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setNewMedicine({
            patientUid: '',
            time: '',
            staffUid: '',
            medicines: [],
            setReminder: false,
            reminderForAll: false,
            reminderFrequency: '',
            reminderTimeDay: [],
            reminderTimeDate: ''
        });
        setOpen(false);
    };

    const handleViewClose = () => {
        setViewOpen(false);
    };

    const handleInputChange = (name, value) => {
        setNewMedicine((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleRemoveMedicine = (index) => {
        const updatedMedicines = newMedicine.medicines.filter((_, i) => i !== index);
        setNewMedicine((prev) => ({
            ...prev,
            staffUid: staffUid,
            medicines: updatedMedicines,
        }));
    };

    const handleMedicineFormOpen = () => {
        setMedicineData({ name: '', quantity: '', unit: '' });
        setOpenMedicineForm(true);
    };

    const handleMedicineFormClose = () => {
        setOpenMedicineForm(false);
    };

    const handleMedicineDataChange = (field, value) => {
        setMedicineData((prev) => ({ ...prev, [field]: value }));
    };

    const handleMedicineSave = () => {
        setNewMedicine((prev) => ({
            ...prev,
            medicines: [...prev.medicines, medicineData]
        }));
        handleMedicineFormClose();
    };

    const handleEditMedicine = (index) => {
        setMedicineData(newMedicine.medicines[index]);
        setOpenMedicineForm(true);
    };

    const handleAddDate = () => {
        if (newReminder.reminderTimeDate) {
            setSelectedDates((prev) => [...prev, newReminder.reminderTimeDate]);
            handleInputChange('reminderTimeDate', '');
        }
    };

    const handleSubmit = async () => {
        try {
            if (newMedicine.medicines.length === 0) {
                alert('Please add at least one medicine before submitting the plan.');
                return; // Prevent further execution
            }

            await axios.post(`${BACKEND_HOST_URL}/api/medicinePlans/`, {
                ...newMedicine,
                reminderTimeDate: selectedDates
            });

            if (newMedicine.setReminder) {
                setNewReminder((prev) => ({
                    ...prev,
                    patientUid: newMedicine.patientUid,
                    reminderFrequency: newMedicine.reminderFrequency,
                    reminderTimeStart: newMedicine.time,
                    reminderTimeDate: newMedicine.reminderTimeDate,
                    reminderTimeDay: newMedicine.reminderTimeDay,
                    notificationPushType: newMedicine.reminderForAll ? 'all' : staffUid,
                    note: newMedicine.medicines.map(medicine => `${medicine.name} (${medicine.quantity} ${medicine.unit})`).join(', ') // Set medicines as reminder note
                }));
                await addReminder();
            }

            setNewMedicine({
                patientUid: '',
                time: '',
                staffUid: '',
                medicines: [],
                setReminder: false,
                reminderForAll: false,
                reminderFrequency: '',
                reminderTimeDay: [],
                reminderTimeDate: ''
            });
            setSelectedDates([]);
            fetchReminders();
            handleClose();
        } catch (error) {
            console.error('Failed to create reminder:', error);
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const addReminder = async () => {
        await axios.post(`${BACKEND_HOST_URL}/api/reminders/`, {
            ...newReminder
        });

        setNewReminder({
            patientUid: '',
            reminderType: '',
            reminderFrequency: '',
            reminderTimeStart: '',
            reminderTimeEnd: '',
            reminderTimeDate: '',
            reminderTimeDay: [],
            reminderMessage: '',
            note: '',
            notificationPushType: '',
        });
    };

    const handleDeleteReminder = async (id) => {
        try {
            await axios.delete(`${BACKEND_HOST_URL}/api/medicinePlans/${id}`);
            fetchReminders(); // Refresh the reminders after deletion
        } catch (error) {
            console.error('Failed to delete reminder:', error);
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
                            placeholder="Search Medicine Plan"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            InputProps={{
                                startAdornment: <Search />,
                            }}
                            sx={{ flexGrow: 1, marginRight: 2 }}
                        />
                        <IconButton onClick={fetchReminders} color="primary">
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
                                    {reminders.length > 0 ? reminders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((reminder, index) => (
                                        <TableRow key={reminder._id || index}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{patients.find((d) => d.uid === reminder.patientUid)?.name || 'Unknown'}</TableCell>
                                            <TableCell>{reminder.time}</TableCell>
                                            <TableCell>
                                                <IconButton size="small" color="primary" onClick={() => handleReminderClick(reminder)}>
                                                    <Visibility />
                                                </IconButton>
                                                <IconButton size="small" color="error" onClick={() => handleDeleteReminder(reminder._id)}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={4}>
                                                <Typography variant="body1" align="center">No Reminders Found</Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                            <TablePagination
                                rowsPerPageOptions={[10, 15, 25]}
                                component="div"
                                count={reminders.length}
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
                <DialogTitle>Create Medicine Plan</DialogTitle>
                <DialogContent>
                    <Box component="form" noValidate autoComplete="off" sx={{ mt: 1 }}>
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Patient</InputLabel>
                            <Select
                                value={newMedicine.patientUid}
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
                            label="Medicine Time"
                            type="time"
                            fullWidth
                            value={newMedicine.time}
                            onChange={(e) => handleInputChange('time', e.target.value)}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            inputProps={{
                                step: 300,
                            }}
                        />
                        <Box mt={3}>
                            <Typography variant="h6">Medicines</Typography>
                            {newMedicine.medicines.length > 0 ? (
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
                                            {newMedicine.medicines.map((medicine, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{medicine.name}</TableCell>
                                                    <TableCell>{medicine.quantity}</TableCell>
                                                    <TableCell>{medicine.unit}</TableCell>
                                                    <TableCell>
                                                        <IconButton onClick={() => handleEditMedicine(index)} color="primary">
                                                            <EditIcon />
                                                        </IconButton>
                                                        <IconButton onClick={() => handleRemoveMedicine(index)} color="error">
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                <Typography variant="body2">No Medicines Added</Typography>
                            )}
                            <Button onClick={handleMedicineFormOpen} variant="outlined" sx={{ mt: 2 }}>
                                Add Medicine
                            </Button>
                        </Box>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={newMedicine.setReminder}
                                    onChange={(e) => handleInputChange('setReminder', e.target.checked)}
                                />
                            }
                            label="Set Reminder"
                        />
                        {newMedicine.setReminder && (
                            <>
                                <FormControl fullWidth margin="normal">
                                    <InputLabel>Reminder Frequency</InputLabel>
                                    <Select
                                        value={newMedicine.reminderFrequency}
                                        onChange={(e) => handleInputChange('reminderFrequency', e.target.value)}
                                    >
                                        <MenuItem value="Daily">Daily</MenuItem>
                                        <MenuItem value="Weekly">Weekly</MenuItem>
                                        <MenuItem value="Monthly">Monthly</MenuItem>
                                        <MenuItem value="Day">Day</MenuItem>
                                    </Select>
                                </FormControl>

                                {newMedicine.reminderFrequency === 'Weekly' && (
                                    <FormControl fullWidth margin="normal">
                                        <InputLabel>Days of the Week</InputLabel>
                                        <Select
                                            multiple
                                            value={newMedicine.reminderTimeDay}
                                            onChange={(e) => handleInputChange('reminderTimeDay', e.target.value)}
                                            renderValue={(selected) => selected.join(', ')}
                                        >
                                            {dayOptions.map((day) => (
                                                <MenuItem key={day} value={day}>
                                                    <Checkbox checked={newMedicine.reminderTimeDay.indexOf(day) > -1} />
                                                    <ListItemText primary={day} />
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                )}

                                {newMedicine.reminderFrequency === 'Monthly' && (
                                    <TextField
                                        margin="normal"
                                        label="Date"
                                        type="date"
                                        fullWidth
                                        value={newMedicine.reminderTimeDate}
                                        onChange={(e) => handleInputChange('reminderTimeDate', e.target.value)}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                    />
                                )}

                                {newMedicine.reminderFrequency === 'Day' && (
                                    <>
                                        <Box display="flex" alignItems="center">
                                            <TextField
                                                margin="normal"
                                                label="Date"
                                                type="date"
                                                fullWidth
                                                value={newMedicine.reminderTimeDate}
                                                onChange={(e) => handleInputChange('reminderTimeDate', e.target.value)}
                                                InputLabelProps={{
                                                    shrink: true,
                                                }}
                                            />
                                            <Button onClick={handleAddDate} sx={{ ml: 2 }} variant="outlined">Add</Button>
                                        </Box>
                                        <Box mt={2}>
                                            {selectedDates.length > 0 && (
                                                <Typography variant="body2">
                                                    Selected Dates: {selectedDates.join(', ')}
                                                </Typography>
                                            )}
                                        </Box>
                                    </>
                                )}
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={newMedicine.reminderForAll}
                                            onChange={(e) => handleInputChange('reminderForAll', e.target.checked)}
                                        />
                                    }
                                    label="Reminder For All!"
                                />
                            </>
                        )}
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

            <Dialog open={openMedicineForm} onClose={handleMedicineFormClose} fullWidth maxWidth="xs">
                <DialogTitle>Add Medicine</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Medicine Name"
                        value={medicineData.name}
                        onChange={(e) => handleMedicineDataChange('name', e.target.value)}
                        margin="dense"
                    />
                    <TextField
                        fullWidth
                        label="Quantity"
                        type="number"
                        value={medicineData.quantity}
                        onChange={(e) => handleMedicineDataChange('quantity', e.target.value)}
                        margin="dense"
                    />
                    <TextField
                        fullWidth
                        label="Unit"
                        value={medicineData.unit}
                        onChange={(e) => handleMedicineDataChange('unit', e.target.value)}
                        margin="dense"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleMedicineFormClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleMedicineSave} color="primary">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={viewOpen} onClose={handleViewClose} fullWidth maxWidth="sm">
                <DialogTitle>View Medicine Plan Details</DialogTitle>
                <DialogContent>
                    {selectedReminder && (
                        <Box>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center' }}>
                                    <CalendarToday sx={{ fontSize: 20, marginRight: 1 }} />
                                    {selectedReminder.createdAt ? new Date(selectedReminder.createdAt).toLocaleDateString() : 'N/A'}
                                </Typography>
                            </Box>
                            <Divider sx={{ my: 2 }} />
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="body2"><strong>Time:</strong> {selectedReminder.time}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="h6">Medicines</Typography>
                                    {selectedReminder.medicines && selectedReminder.medicines.map((medicine, index) => (
                                        <Box key={index} display="flex" alignItems="center" mb={1}>
                                            <Typography variant="body2" sx={{ mr: 2 }}>{medicine.name}</Typography>
                                            <Typography variant="body2" sx={{ mr: 2 }}>{medicine.quantity}</Typography>
                                            <Typography variant="body2">{medicine.unit}</Typography>
                                        </Box>
                                    ))}
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2"><strong>Set Reminder:</strong> {selectedReminder.setReminder ? <DoneAllIcon sx={{ color: 'green' }} /> : <ClearIcon sx={{ color: 'red' }} />}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2"><strong>Reminder For All:</strong> {selectedReminder.reminderForAll ? <DoneAllIcon sx={{ color: 'green' }} /> : <ClearIcon sx={{ color: 'red' }} />}</Typography>
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
