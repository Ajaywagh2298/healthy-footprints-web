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
    InputLabel
} from '@mui/material';
import { Refresh, AddCircleOutline, CalendarToday, Visibility, Search, Edit as EditIcon } from '@mui/icons-material';
import { Inventory, MonetizationOn, DateRange } from '@mui/icons-material';
import axios from 'axios';
import Navbar from '../components/Navbar';
import DeleteIcon from '@mui/icons-material/Delete';
import { BACKEND_HOST_URL, FRONTEND_HOST_URL } from '../config/config';

export default function StockScreen() {
    const [stockPlans, setStockPlans] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [viewOpen, setViewOpen] = useState(false);
    const [selectedStockPlan, setSelectedStockPlan] = useState(null);
    const [newStockPlan, setNewStockPlan] = useState({
        batchName: '',
        batchDate: '',
        stockEndDate: '',
        stocks: [],
        staffUid: '',
    });

    const user = JSON.parse(localStorage.getItem('user'));
    const staffUid = user ? user.user.uid : '';

    const [openStockForm, setOpenStockForm] = useState(false);
    const [stockData, setStockData] = useState({
        itemUid: '',
        quantity: 0,
        costPerUnit: 0,
        totalCost: 0,
        type: '',
        expiredDate: ''
    });

    const [items, setItems] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        fetchItems();
        fetchStockPlans();
    }, []);

    async function fetchItems() {
        try {
            const response = await axios.get(`${BACKEND_HOST_URL}/api/items`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': FRONTEND_HOST_URL
                    },
                    withCredentials: true, // This includes cookies in the request if your backend expects them
                });
            setItems(response.data);
        } catch (error) {
            console.error('Failed to fetch items:', error);
        }
    }

    async function fetchStockPlans() {
        setLoading(true);
        try {
            const response = await axios.get(`${BACKEND_HOST_URL}/api/Stocks`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': FRONTEND_HOST_URL
                    },
                    withCredentials: true, // This includes cookies in the request if your backend expects them
                });
            response.data.sort((a, b) => new Date(b.batchDate) - new Date(a.batchDate));
            setStockPlans(response.data);
        } catch (error) {
            console.error('Failed to fetch stock plans:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleStockPlanClick = (stockPlan) => {
        setSelectedStockPlan(stockPlan);
        setViewOpen(true);
    };

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setNewStockPlan({
            batchName: '',
            batchDate: '',
            stockEndDate: '',
            stocks: [],
            staffUid: staffUid,
        });
        setOpen(false);
    };

    const handleViewClose = () => {
        setViewOpen(false);
    };

    const handleInputChange = (name, value) => {
        setNewStockPlan((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleRemoveStock = (index) => {
        const updatedStocks = newStockPlan.stocks.filter((_, i) => i !== index);
        setNewStockPlan((prev) => ({
            ...prev,
            stocks: updatedStocks,
        }));
    };

    const handleStockFormOpen = () => {
        setStockData({
            itemUid: '',
            quantity: 0,
            costPerUnit: 0,
            totalCost: 0,
            type: '',
            expiredDate: ''
        });
        setOpenStockForm(true);
    };

    const handleStockFormClose = () => {
        setOpenStockForm(false);
    };

    const handleStockDataChange = (field, value) => {
        setStockData((prev) => {
            let updatedData = { ...prev, [field]: value };
    
            if (field === 'quantity' || field === 'costPerUnit') {
                const quantity = parseFloat(updatedData.quantity) || 0;
                const costPerUnit = parseFloat(updatedData.costPerUnit) || 0;
                updatedData.totalCost = (quantity * costPerUnit).toFixed(2);
            }
    
            if (field === 'quantity' || field === 'totalCost') {
                const quantity = parseFloat(updatedData.quantity) || 0;
                const totalCost = parseFloat(updatedData.totalCost) || 0;
                updatedData.costPerUnit = quantity !== 0 ? (totalCost / quantity).toFixed(2) : 0;
            }
    
            return updatedData;
        });
    };

    const handleStockSave = () => {
        if (!stockData.itemUid) {
            alert('Item Name is required. Please select an item.');
            return; // Prevent saving if itemUid is not set
        }
        setNewStockPlan((prev) => ({
            ...prev,
            stocks: [...prev.stocks, stockData]
        }));
        handleStockFormClose();
    };

    const handleEditStock = (index) => {
        setStockData(newStockPlan.stocks[index]);
        setOpenStockForm(true);
    };

    const handleSubmit = async () => {
        try {
            if (newStockPlan.stocks.length === 0) {
                alert('Please add at least one stock before submitting the plan.');
                return; // Prevent further execution
            }

            // Ensure itemUid is a valid ObjectId format
            const stocksWithValidItemUid = newStockPlan.stocks.map(stock => ({
                ...stock,
                // itemUid: stock.itemUid && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(stock.itemUid) ? stock.itemUid : null // Validate UUID format
            }));

            await axios.post(`${BACKEND_HOST_URL}/api/stocks/`, {
                ...newStockPlan,
                stocks: stocksWithValidItemUid,
                staffUid: staffUid,
                createdDate: new Date(),
                updatedDate: new Date(),
            },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': FRONTEND_HOST_URL
                    },
                    withCredentials: true, // This includes cookies in the request if your backend expects them
                });

            setNewStockPlan({
                uid: '',
                batchName: '',
                batchDate: '',
                stockEndDate: '',
                stocks: [],
                staffUid: staffUid,
            });
            fetchStockPlans();
            handleClose();
        } catch (error) {
            if (error.response && error.response.data) {
                console.error('Error creating stock:', error.response.data);
                alert(`Error creating stock: ${error.response.data.message}`);
            } else {
                console.error('Failed to create stock plan:', error);
            }
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleDeleteStockPlan = async (uid) => {
        try {
            await axios.delete(`${BACKEND_HOST_URL}/api/stock/${uid}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': FRONTEND_HOST_URL
                    },
                    withCredentials: true, // This includes cookies in the request if your backend expects them
                });
            fetchStockPlans(); // Refresh the stock plans after deletion
        } catch (error) {
            console.error('Failed to delete stock plan:', error);
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
                            placeholder="Search Stock Plan"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            InputProps={{
                                startAdornment: <Search />,
                            }}
                            sx={{ flexGrow: 1, marginRight: 2 }}
                        />
                        <IconButton onClick={fetchStockPlans} color="primary">
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
                                        <TableCell>Batch Name</TableCell>
                                        <TableCell>Items Name</TableCell>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {stockPlans.length > 0 ? stockPlans.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((stockPlan, index) => (
                                        <TableRow key={stockPlan.uid || index}> {/* Changed uid to _id */}
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{stockPlan.batchName}</TableCell>
                                            <TableCell>{items.find((d) => d.uid === stockPlan.itemUid)?.itemName || 'Unknown'}</TableCell>
                                            <TableCell>{new Date(stockPlan.batchDate).toLocaleString()}</TableCell>
                                            <TableCell>
                                                <IconButton size="small" color="primary" onClick={() => handleStockPlanClick(stockPlan)}>
                                                    <Visibility />
                                                </IconButton>
                                                <IconButton size="small" color="error" onClick={() => handleDeleteStockPlan(stockPlan.uid)} disabled>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={4}>
                                                <Typography variant="body1" align="center">No Stock Found</Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                            <TablePagination
                                rowsPerPageOptions={[10, 15, 25]}
                                component="div"
                                count={stockPlans.length}
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
                <DialogTitle>Create Stock Plan</DialogTitle>
                <DialogContent>
                    <Box component="form" noValidate autoComplete="off" sx={{ mt: 1 }}>
                        <TextField
                            margin="normal"
                            label="Batch Name"
                            type="text"
                            fullWidth
                            value={newStockPlan.batchName}
                            onChange={(e) => handleInputChange('batchName', e.target.value)}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            inputProps={{
                                step: 300,
                            }}
                        />
                        <TextField
                            margin="normal"
                            label="Batch Date"
                            type="date"
                            fullWidth
                            value={newStockPlan.batchDate}
                            onChange={(e) => handleInputChange('batchDate', e.target.value)}
                        />
                        <Box mt={3}>
                            <Typography variant="h6">Stocks</Typography>
                            {newStockPlan.stocks.length > 0 ? (
                                <TableContainer component={Paper}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Items Name</TableCell>
                                                <TableCell>Quantity</TableCell>
                                                <TableCell>Total Cost</TableCell>
                                                <TableCell>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody sx={{ fontSize: 14 }}>
                                            {newStockPlan.stocks.map((stock, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{items.find(d => d.uid == stock.itemUid)?.itemName || 'Unknown'}</TableCell>
                                                    <TableCell>{stock.quantity}</TableCell>
                                                    <TableCell>{stock.totalCost}</TableCell>
                                                    <TableCell>
                                                        <IconButton onClick={() => handleEditStock(index)} color="primary">
                                                            <EditIcon />
                                                        </IconButton>
                                                        <IconButton onClick={() => handleRemoveStock(index)} color="error">
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                <Typography variant="body2">No Stocks Added</Typography>
                            )}
                            <Button onClick={handleStockFormOpen} variant="outlined" sx={{ mt: 2 }}>
                                Add Stock
                            </Button>
                        </Box>
                    </Box>
                    <TextField
                        fullWidth
                        type='date'
                        label="Stock End Date"
                        value={newStockPlan.stockEndDate}
                        onChange={(e) => handleInputChange('stockEndDate', e.target.value)}
                        margin="dense"
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

            <Dialog open={openStockForm} onClose={handleStockFormClose} fullWidth maxWidth="xs">
                <DialogTitle>Add Stock Items </DialogTitle>
                <DialogContent>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Item Name</InputLabel>
                        <Select
                            value={stockData.itemUid || ''} // Ensure itemUid is not null
                            onChange={(e) => handleStockDataChange('itemUid', e.target.value)}
                        >
                            {items.map((item) => (
                                <MenuItem key={item.uid} value={item.uid}>
                                    {item.itemName}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        fullWidth
                        label="Quantity"
                        type="number"
                        value={stockData.quantity}
                        onChange={(e) => handleStockDataChange('quantity', e.target.value)}
                        margin="dense"
                    />
                    <TextField
                        fullWidth
                        label="Cost Per Unit"
                        value={stockData.costPerUnit}
                        onChange={(e) => handleStockDataChange('costPerUnit', e.target.value)}
                        margin="dense"
                    />
                    <TextField
                        fullWidth
                        label="Total Cost"
                        value={stockData.totalCost}
                        onChange={(e) => handleStockDataChange('totalCost', e.target.value)}
                        margin="dense"
                    />
                    <TextField
                        fullWidth
                        type='date'
                        label="Expired Date"
                        value={stockData.expiredDate}
                        onChange={(e) => handleStockDataChange('expiredDate', e.target.value)}
                        margin="dense"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleStockFormClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleStockSave} color="primary">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={viewOpen} onClose={handleViewClose} fullWidth maxWidth="sm" sx={{ borderRadius: '8px', boxShadow: 24 }}>
                <DialogTitle sx={{ backgroundColor: '#1976d2', color: '#fff', textAlign: 'center' }}>View Stock Plan Details</DialogTitle>
                <DialogContent sx={{ padding: 3 }}>
                    {selectedStockPlan && (
                         <Box sx={{ padding: 2 }}>
                         <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                             <Typography variant="h5" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                                 Stock Plan Details
                             </Typography>
                             <IconButton color="primary">
                                 <Inventory fontSize="large" />
                             </IconButton>
                         </Box>
                         <Divider sx={{ my: 2 }} />
                         <Grid container spacing={2}>
                             <Grid item xs={6}>
                                 <Box display="flex" alignItems="center">
                                     <CalendarToday sx={{ color: '#1976d2', mr: 1 }} />
                                     <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                         Batch Date:
                                     </Typography>
                                 </Box>
                                 <Typography variant="body2">
                                     {new Date(selectedStockPlan.batchDate).toLocaleString()}
                                 </Typography>
                             </Grid>
                             <Grid item xs={6}>
                                 <Box display="flex" alignItems="center">
                                     <DateRange sx={{ color: '#1976d2', mr: 1 }} />
                                     <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                         Expired Date:
                                     </Typography>
                                 </Box>
                                 <Typography variant="body2">
                                     {new Date(selectedStockPlan.expiredDate).toLocaleDateString()}
                                 </Typography>
                             </Grid>
                             <Grid item xs={12}>
                                 <Box display="flex" alignItems="center">
                                     <Inventory sx={{ color: '#1976d2', mr: 1 }} />
                                     <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                                         Quantity:
                                     </Typography>
                                 </Box>
                                 <Typography variant="body1" sx={{ ml: 3 }}>
                                     {selectedStockPlan.quantity}
                                 </Typography>
                             </Grid>
                             <Grid item xs={12}>
                                 <Box display="flex" alignItems="center">
                                     <MonetizationOn sx={{ color: '#1976d2', mr: 1 }} />
                                     <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                                         Total Cost:
                                     </Typography>
                                 </Box>
                                 <Typography variant="body1" sx={{ ml: 3 }}>
                                     RS. {selectedStockPlan.totalCost.toFixed(2)}
                                 </Typography>
                             </Grid>
                         </Grid>
                     </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', padding: 2 }}>
                    <Button onClick={handleViewClose} variant="contained" color="primary" sx={{ borderRadius: '20px' }}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
