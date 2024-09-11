import React, { useState, useEffect } from 'react';
import {
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
    Switch,
    FormControlLabel,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TablePagination
} from '@mui/material';
import Navbar from '../components/Navbar';
import { Refresh, AddCircleOutline, CalendarToday, AccessTime, Favorite, DirectionsRun, Thermostat, SupervisedUserCircle, Search } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import AirIcon from '@mui/icons-material/Air';
import MedicationIcon from '@mui/icons-material/Medication';
import OpacityIcon from '@mui/icons-material/Opacity';
import GestureIcon from '@mui/icons-material/Gesture';
import { BACKEND_HOST_URL } from '../config/config';

export default function DailyRecordScreen() {
    const navigate = useNavigate();
    const location = useLocation(); // Hook to access the passed state
    const { patientUid } = location.state || {}; // Extract patientUid from the state

    const [dailyRecords, setDailyRecords] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [viewOpen, setViewOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [newRecord, setNewRecord] = useState({
        recordDate: '',
        systolicBP: '',
        diastolicBP: '',
        rp: '',
        temperature: '',
        oxygen: '',
        urine: false,
        motion: false,
        meal: '',
        medicine: '',
    });
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const user = JSON.parse(localStorage.getItem('user'));
    const staffUid = user ? user.user.uid : '';

    useEffect(() => {
        if (patientUid) {
            fetchDailyRecords();
        }
    }, [patientUid]);

    async function fetchDailyRecords() {
        setLoading(true);
        try {
            // Make sure to include patientUid in the API request URL
            const response = await axios.get(`${BACKEND_HOST_URL}/api/dailyRecords/${patientUid}`,
                {
                headers: {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': 'https://healthy-footprints-web.vercel.app'
                },
                withCredentials: true, // This includes cookies in the request if your backend expects them
              });
            response.data.sort((a, b) => new Date(b.recordDate) - new Date(a.recordDate));
            setDailyRecords(response.data);
        } catch (error) {
            console.error('Failed to fetch records:', error);
        } finally {
            setLoading(false);
        }
    }

    const filteredRecords = dailyRecords.filter(record => {
        const dateString = record.date || record.recordDate || '';
        return dateString.includes(search);
    });

    const handleRecordClick = (record) => {
        setSelectedRecord(record);
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
        setNewRecord({
            ...newRecord,
            [name]: value,
        });
    };

    const handleToggleChange = (name) => {
        setNewRecord({
            ...newRecord,
            [name]: !newRecord[name],
        });
    };

    const handleSubmit = async () => {
        try {
            await axios.post(`${BACKEND_HOST_URL}/api/dailyRecords/`, {  
                patientUid: patientUid,
                staffUid: staffUid,
                bp: `${newRecord.systolicBP}/${newRecord.diastolicBP}`, // Combine BP values
                ...newRecord });
                setNewRecord({
                    recordDate: '',
                    systolicBP: '',
                    diastolicBP: '',
                    rp: '',
                    temperature: '',
                    oxygen: '',
                    urine: false,
                    motion: false,
                    meal: '',
                    medicine: '',
                })
            fetchDailyRecords();
            handleClose();
        } catch (error) {
            console.error('Failed to create record:', error);
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <>
            <Navbar />
            <Box display="flex" flexDirection="column" alignItems="center" padding={1} margin={2}>
                <Box display="flex" alignItems="center" mb={2}>
                    <TextField
                        variant="outlined"
                        placeholder="Search Records"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <Search />
                            ),
                        }}
                        sx={{ marginRight: 2 }}
                    />
                    <IconButton onClick={fetchDailyRecords} color="primary">
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
                                    <TableCell>Date</TableCell>
                                    <TableCell>Time (24 hr)</TableCell>
                                    <TableCell>View</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredRecords.length > 0 ? filteredRecords.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((record, index) => (
                                    <TableRow key={record._id || index}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{record.recordDate ? new Date(record.recordDate).toLocaleDateString() : 'N/A'}</TableCell>
                                        <TableCell>{record.recordDate ? new Date(record.recordDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : 'N/A'}</TableCell>
                                        <TableCell>
                                            <Button size="small" color="primary" onClick={() => handleRecordClick(record)}>
                                                <VisibilityIcon />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={4}>
                                            <Typography variant="body1">No Records Found</Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25]}
                            component="div"
                            count={filteredRecords.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                    </TableContainer>
                )}
            </Box>

            {/* Floating Action Button */}
            <Box position="fixed" bottom={16} right={16}>
                <IconButton
                    color="primary"
                    style={{ width: 60, height: 60 }}
                    onClick={handleClickOpen}
                >
                    <AddCircleOutline style={{ fontSize: 60 }} />
                </IconButton>
            </Box>

            {/* Dialog for creating new record */}
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Create Daily Record</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Record Date"
                        type="datetime-local"
                        fullWidth
                        value={newRecord.recordDate}
                        onChange={(e) => handleInputChange('recordDate', e.target.value)}
                    />
                    <Box display="flex" justifyContent="space-between">
                        <TextField
                            margin="dense"
                            label="Systolic BP"
                            fullWidth
                            value={newRecord.systolicBP}
                            sx={{marginRight : 1}}
                            onChange={(e) => handleInputChange('systolicBP', e.target.value)}
                        />
                        <TextField
                            margin="dense"
                            label="Diastolic BP"
                            fullWidth
                            value={newRecord.diastolicBP}
                            onChange={(e) => handleInputChange('diastolicBP', e.target.value)}
                        />
                    </Box>
                    <TextField
                        margin="dense"
                        label="Respiratory Rate"
                        fullWidth
                        value={newRecord.rp}
                        onChange={(e) => handleInputChange('rp', e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Oxygen"
                        fullWidth
                        value={newRecord.oxygen}
                        onChange={(e) => handleInputChange('oxygen', e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Temperature"
                        fullWidth
                        value={newRecord.temperature}
                        onChange={(e) => handleInputChange('temperature', e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Meal"
                        fullWidth
                        value={newRecord.meal}
                        onChange={(e) => handleInputChange('meal', e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Medicine"
                        fullWidth
                        value={newRecord.medicine}
                        onChange={(e) => handleInputChange('medicine', e.target.value)}
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={newRecord.urine}
                                onChange={() => handleToggleChange('urine')}
                            />
                        }
                        label="Urine"
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={newRecord.motion}
                                onChange={() => handleToggleChange('motion')}
                            />
                        }
                        label="Motion"
                    />
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

            {/* Dialog for viewing record */}
            <Dialog open={viewOpen} onClose={handleViewClose}>
                <DialogTitle>View Record Details</DialogTitle>
                <DialogContent>
                    {selectedRecord && (
                        <Box>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="body2" color="textSecondary" sx={{ flexDirection : 'row',alignItems : 'center', textAlign : 'center', marginLeft : 3}}>
                                    <CalendarToday sx={{fontSize : 20}}/> <Typography>{selectedRecord.recordDate ? new Date(selectedRecord.recordDate).toLocaleDateString() : 'N/A'}</Typography>
                                </Typography>
                                <Typography variant="body2" color="textSecondary" sx={{ flexDirection : 'row', alignItems : 'center', textAlign : 'center', marginRight : 4}}>
                                    <AccessTime sx={{fontSize : 20}}/> <Typography>{selectedRecord.recordDate ? new Date(selectedRecord.recordDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : 'N/A'}</Typography>
                                </Typography>
                            </Box>
                            <Divider sx={{ my: 2 }} />
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Box display="flex" alignItems="center">
                                        <Favorite sx={{color : '#cb4335', marginRight : 2}}/>
                                        <Typography>{selectedRecord.bp || 0}</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6}>
                                    <Box display="flex" alignItems="center">
                                        <DirectionsRun sx={{color : '#3498db', marginRight : 2}}/>
                                        <Typography>{selectedRecord.rp || 0}</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6}>
                                    <Box display="flex" alignItems="center">
                                        <Thermostat sx={{color : '#e67e22', marginRight : 2}}/>
                                        <Typography>{selectedRecord.temperature || 0}</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6}>
                                    <Box display="flex" alignItems="center">
                                        <AirIcon sx={{color : '#ccd1d1', marginRight : 2}}/>
                                        <Typography>{selectedRecord.oxygen || 0}</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6}>
                                    <Box display="flex" alignItems="center">
                                        <LocalDiningIcon sx={{color :'#f0b27a' , marginRight : 2}}/>
                                        <Typography>{selectedRecord.meal || 'N/A'}</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6}>
                                    <Box display="flex" alignItems="center">
                                        <MedicationIcon sx={{color :'#27ae60' , marginRight : 2}}/>
                                        <Typography>{selectedRecord.medicine || 'N/A'}</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6}>
                                    <Box display="flex" alignItems="center">
                                        <OpacityIcon  sx={{color :'#85c1e9' , marginRight : 2}}/>
                                        <Typography>U {selectedRecord.urine ? 'Yes' : 'No'}</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6}>
                                    <Box display="flex" alignItems="center">
                                        <GestureIcon sx={{color :'#f1c40f', marginRight : 2}}/>
                                        <Typography>M {selectedRecord.motion ? 'Yes' : 'No'}</Typography>
                                    </Box>
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
