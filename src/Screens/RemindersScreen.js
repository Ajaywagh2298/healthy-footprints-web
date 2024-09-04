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
    Checkbox,
    ListItemText
} from '@mui/material';
import { Refresh, AddCircleOutline, CalendarToday, AccessTime, Visibility, Search } from '@mui/icons-material';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { BACKEND_HOST_URL } from '../config/config';

export default function RemindersScreen() {
    const [reminders, setReminders] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [viewOpen, setViewOpen] = useState(false);
    const [selectedReminder, setSelectedReminder] = useState(null);
    const [newReminder, setNewReminder] = useState({
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
    const [selectedDates, setSelectedDates] = useState([]); // Added this state
    const [patients, setPatients] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

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
            const response = await axios.get(`${BACKEND_HOST_URL}/api/reminders/`);
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
        setOpen(false);
    };

    const handleViewClose = () => {
        setViewOpen(false);
    };

    const handleInputChange = (name, value) => {
        setNewReminder({
            ...newReminder,
            [name]: value,
        });
    };

    const handleAddDate = () => {
        if (newReminder.reminderTimeDate) {
            setSelectedDates([...selectedDates, newReminder.reminderTimeDate]);
            handleInputChange('reminderTimeDate', '');
        }
    };

    const user = JSON.parse(localStorage.getItem('user'));
    const staffUid = user ? user.user.uid : '';

    const handleSubmit = async () => {
        try {
            await axios.post(`${BACKEND_HOST_URL}/api/reminders/`, {
                ...newReminder,
                reminderTimeDate: selectedDates // Use the array of dates
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
            setSelectedDates([]); // Reset selected dates
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

    const dayOptions = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    return (
        <>
        <Navbar/>
            <Container maxWidth="md">
                <Box display="flex" flexDirection="column" alignItems="center" padding={2} mt={4}>
                    <Box display="flex" alignItems="center" mb={3} width="100%">
                        <TextField
                            variant="outlined"
                            placeholder="Search Reminders"
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
                                        <TableCell>Start Time</TableCell>
                                        <TableCell>End Time</TableCell>
                                        <TableCell>Type</TableCell>
                                        <TableCell>View</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {reminders.length > 0 ? reminders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((reminder, index) => (
                                        <TableRow key={reminder._id || index}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{reminder.reminderTimeStart}</TableCell>
                                            <TableCell>{reminder.reminderTimeEnd}</TableCell>
                                            <TableCell>{reminder.reminderType}</TableCell>
                                            <TableCell>
                                                <IconButton size="small" color="primary" onClick={() => handleReminderClick(reminder)}>
                                                    <Visibility />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={5}>
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
                <DialogTitle>Create Reminder</DialogTitle>
                <DialogContent>
                    <Box component="form" noValidate autoComplete="off" sx={{ mt: 1 }}>
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Patient</InputLabel>
                            <Select
                                value={newReminder.patientUid}
                                onChange={(e) => handleInputChange('patientUid', e.target.value)}
                            >
                                {patients.map((patient) => (
                                    <MenuItem key={patient.uid} value={patient.uid}>
                                        {patient.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth margin="normal">
                            <InputLabel>Reminder Type</InputLabel>
                            <Select
                                value={newReminder.reminderType}
                                onChange={(e) => handleInputChange('reminderType', e.target.value)}
                            >
                                <MenuItem value="Medication">Medication</MenuItem>
                                <MenuItem value="Exercise">Exercise</MenuItem>
                                <MenuItem value="Diet">Diet</MenuItem>
                                <MenuItem value="Hydration">Hydration</MenuItem>
                                <MenuItem value="Other">Other</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl fullWidth margin="normal">
                            <InputLabel>Reminder Frequency</InputLabel>
                            <Select
                                value={newReminder.reminderFrequency}
                                onChange={(e) => handleInputChange('reminderFrequency', e.target.value)}
                            >
                                <MenuItem value="Daily">Daily</MenuItem>
                                <MenuItem value="Weekly">Weekly</MenuItem>
                                <MenuItem value="Monthly">Monthly</MenuItem>
                                <MenuItem value="Day">Day</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            margin="normal"
                            label="Start Time"
                            type="time"
                            fullWidth
                            value={newReminder.reminderTimeStart}
                            onChange={(e) => handleInputChange('reminderTimeStart', e.target.value)}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            inputProps={{
                                step: 300, // 5 minutes
                            }}
                        />

                        <TextField
                            margin="normal"
                            label="End Time"
                            type="time"
                            fullWidth
                            value={newReminder.reminderTimeEnd}
                            onChange={(e) => handleInputChange('reminderTimeEnd', e.target.value)}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            inputProps={{
                                step: 300, // 5 minutes
                            }}
                        />

                        {newReminder.reminderFrequency === 'Weekly' && (
                            <FormControl fullWidth margin="normal">
                                <InputLabel>Days of the Week</InputLabel>
                                <Select
                                    multiple
                                    value={newReminder.reminderTimeDay}
                                    onChange={(e) => handleInputChange('reminderTimeDay', e.target.value)}
                                    renderValue={(selected) => selected.join(', ')}
                                >
                                    {dayOptions.map((day) => (
                                        <MenuItem key={day} value={day}>
                                            <Checkbox checked={newReminder.reminderTimeDay.indexOf(day) > -1} />
                                            <ListItemText primary={day} />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}

                        {newReminder.reminderFrequency === 'Monthly' && (
                            <TextField
                                margin="normal"
                                label="Date"
                                type="date"
                                fullWidth
                                value={newReminder.reminderTimeDate}
                                onChange={(e) => handleInputChange('reminderTimeDate', e.target.value)}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        )}

                        {newReminder.reminderFrequency === 'Day' && (
                            <>
                                <Box display="flex" alignItems="center">
                                    <TextField
                                        margin="normal"
                                        label="Date"
                                        type="date"
                                        fullWidth
                                        value={newReminder.reminderTimeDate}
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

                        <TextField
                            margin="normal"
                            label="Reminder Message"
                            fullWidth
                            multiline
                            rows={2}
                            value={newReminder.reminderMessage}
                            onChange={(e) => handleInputChange('reminderMessage', e.target.value)}
                        />

                        <TextField
                            margin="normal"
                            label="Note"
                            fullWidth
                            multiline
                            rows={2}
                            value={newReminder.note}
                            onChange={(e) => handleInputChange('note', e.target.value)}
                        />

                        <FormControl fullWidth margin="normal">
                            <InputLabel>Notification Push Type</InputLabel>
                            <Select
                                value={newReminder.notificationPushType}
                                onChange={(e) => handleInputChange('notificationPushType', e.target.value)}
                            >
                                <MenuItem value="all">For All Users</MenuItem>
                                <MenuItem value={staffUid}>Only For Me</MenuItem>
                            </Select>
                        </FormControl>
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

            <Dialog open={viewOpen} onClose={handleViewClose} fullWidth maxWidth="sm">
                <DialogTitle>View Reminder Details</DialogTitle>
                <DialogContent>
                    {selectedReminder && (
                        <Box>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center' }}>
                                    <CalendarToday sx={{ fontSize: 20, marginRight: 1 }} />
                                    {selectedReminder.createDate ? new Date(selectedReminder.createDate).toLocaleDateString() : 'N/A'}
                                </Typography>
                                <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center' }}>
                                    <AccessTime sx={{ fontSize: 20, marginRight: 1 }} />
                                    {selectedReminder.createDate ? new Date(selectedReminder.createDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : 'N/A'}
                                </Typography>
                            </Box>
                            <Divider sx={{ my: 2 }} />
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="body2"><strong>Type:</strong> {selectedReminder.reminderType}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2"><strong>Frequency:</strong> {selectedReminder.reminderFrequency}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2"><strong>Start Time:</strong> {selectedReminder.reminderTimeStart}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2"><strong>End Time:</strong> {selectedReminder.reminderTimeEnd}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2"><strong>Message:</strong> {selectedReminder.reminderMessage}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2"><strong>Note:</strong> {selectedReminder.note}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2"><strong>Notification Type:</strong> {selectedReminder.notificationPushType == 'all' ? 'All User' : 'Only For Me'}</Typography>
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
