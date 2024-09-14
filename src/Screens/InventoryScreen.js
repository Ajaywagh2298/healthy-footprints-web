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
import { Inventory, MonetizationOn, DateRange } from '@mui/icons-material';
import axios from 'axios';
import Navbar from '../components/Navbar';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { BACKEND_HOST_URL, FRONTEND_HOST_URL } from '../config/config';

export default function InventoryScreen() {
    const user = JSON.parse(localStorage.getItem('user'));
    const staffUid = user ? user.user.uid : '';

    const [stockPlans, setStockPlans] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [viewOpen, setViewOpen] = useState(false);
    const [selectedStockPlan, setSelectedStockPlan] = useState(null);
    const [newStockPlan, setNewStockPlan] = useState({
        useDate: '',
        useTime: '',
        inventories: [],
        staffUid: staffUid,
    });



    const [openStockForm, setOpenStockForm] = useState(false);
    const [stockData, setStockData] = useState({
        itemUid: "",
        Note: "",
        quantity: 0,
        availableQuantity: 0,
        totalQuantity: 0,
    });

    const [items, setItems] = useState([]);
    const [page, setPage] = useState(0);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [itemUid, setItemUid] = useState('');
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        const currentDate = new Date();
        const priorDate = new Date().setDate(currentDate.getDate() - 7);
        setFromDate(new Date(priorDate).toISOString().split('T')[0]);
        setToDate(currentDate.toISOString().split('T')[0]);
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
    const handleFilter = () => {
        fetchStockPlans();
    };
    async function fetchStockPlans() {
        setLoading(true);
        try {
            const response = await axios.get(`${BACKEND_HOST_URL}/api/inventory`,
                {
                    params: {
                        fromDate,
                        toDate,
                        itemUid
                    },
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': FRONTEND_HOST_URL
                    },
                    withCredentials: true, // This includes cookies in the request if your backend expects them
                });
            response.data.sort((a, b) => new Date(b.date) - new Date(a.date));
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
            useDate: '',
            useTime: '',
            inventories: [],
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
        const updatedStocks = newStockPlan.inventories.filter((_, i) => i !== index);
        setNewStockPlan((prev) => ({
            ...prev,
            inventories: updatedStocks,
        }));
    };

    const handleStockFormOpen = () => {
        setStockData({
            itemUid: "",
            Note: "",
            quantity: 0,
            availableQuantity: 0,
            totalQuantity: 0,
        });
        setOpenStockForm(true);
    };

    const handleStockFormClose = () => {
        setOpenStockForm(false);
    };

    const handleStockDataChange = (field, value) => {
        setStockData((prev) => {
            let updatedData = { ...prev, [field]: value };

            if (field === 'quantity') {
                const quantity = parseInt(updatedData.quantity) || 0;
                const tempItem = items.find((data) => data.uid === updatedData.itemUid);
                const oldStock = parseInt(tempItem.quantity) || 0;
                const totalQuantity = parseInt(tempItem.totalQuantity) || 0;
                updatedData.availableQuantity = (totalQuantity - (oldStock + quantity));
                updatedData.totalQuantity = tempItem.totalQuantity;
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
            inventories: [...prev.inventories, stockData]
        }));
        handleStockFormClose();
    };

    const handleEditStock = (index) => {
        setStockData(newStockPlan.inventories[index]);
        setOpenStockForm(true);
    };

    const handleSubmit = async () => {
        try {
            if (newStockPlan.inventories.length === 0) {
                alert('Please add at least one stock before submitting the plan.');
                return; // Prevent further execution
            }

            // Ensure itemUid is a valid ObjectId format
            const stocksWithValidItemUid = newStockPlan.inventories.map(inventories => ({
                ...inventories,
                // itemUid: stock.itemUid && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(stock.itemUid) ? stock.itemUid : null // Validate UUID format
            }));

            await axios.post(`${BACKEND_HOST_URL}/api/inventory/`, {
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
                useDate: '',
                useTime: '',
                inventories: [],
                staffUid: "",
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

    return (
        <>
            <Navbar />
            <Container maxWidth="md">
                <Box display="flex" flexDirection="column" alignItems="center" padding={2} mt={4} mb={2}>
                    <Box display="flex" alignItems="center" mb={3} width="100%">
                        {/* <TextField
                            variant="outlined"
                            placeholder="Search Stock Plan"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            InputProps={{
                                startAdornment: <Search />,
                            }}
                            sx={{ flexGrow: 1, marginRight: 2 }}
                        /> */}
                        {/* <IconButton onClick={fetchStockPlans} color="primary">
                            <Refresh />
                        </IconButton> */}
                    </Box>
                    <Grid container spacing={2} alignItems="center" justifyContent="flex-start">
                        <Grid item>
                            <TextField
                                label="From Date"
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item>
                            <TextField
                                label="To Date"
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item>
                            <Select
                                label="Product Name"
                                value={itemUid}
                                onChange={(e) => setItemUid(e.target.value)}
                                displayEmpty
                            >
                                <MenuItem value="">
                                    <em>All Items</em>
                                </MenuItem>
                                {items.map((item) => (
                                    <MenuItem key={item.uid} value={item.uid}>
                                        {item.itemName}
                                    </MenuItem>
                                ))}
                            </Select>
                        </Grid>
                        <Grid item>
                            <Button variant="contained" color="success" onClick={handleFilter}>
                            <FilterAltIcon /> Filter
                            </Button>
                            {/* <FilterAltIcon onClick={handleFilter} variant="contained" color="primary"/>
                            <IconButton onClick={fetchStockPlans} color="primary">
                            <Refresh />
                        </IconButton> */}
                        </Grid>
                    </Grid>
                    {loading ? (
                        <CircularProgress />
                    ) : (
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Index</TableCell>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {stockPlans.length > 0 ? stockPlans.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((stockPlan, index) => (
                                        <TableRow key={stockPlan.uid || index}> {/* Changed uid to _id */}
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{new Date(stockPlan.date).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <IconButton size="small" color="primary" onClick={() => handleStockPlanClick(stockPlan)}>
                                                    <Visibility />
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

            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" mb={4}>
                <DialogTitle>Create Stock Plan</DialogTitle>
                <DialogContent>
                    <Box component="form" noValidate autoComplete="off" sx={{ mt: 1 }}>
                        <TextField
                            margin="normal"
                            label="Use Date"
                            type="date"
                            fullWidth
                            value={newStockPlan.useDate}
                            onChange={(e) => handleInputChange('useDate', e.target.value)}
                        />
                        <TextField
                            margin="normal"
                            label="Use Time"
                            type="time"
                            fullWidth
                            value={newStockPlan.useTime}
                            onChange={(e) => handleInputChange('useTime', e.target.value)}
                        />
                        <Box mt={3}>
                            <Typography variant="h6">Stocks</Typography>
                            {newStockPlan.inventories.length > 0 ? (
                                <TableContainer component={Paper}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Items Name</TableCell>
                                                <TableCell>Quantity</TableCell>
                                                <TableCell>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody sx={{ fontSize: 14 }}>
                                            {newStockPlan.inventories.map((stock, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{items.find(d => d.uid == stock.itemUid)?.itemName || 'Unknown'}</TableCell>
                                                    <TableCell>{stock.quantity}</TableCell>
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
                                <Typography variant="body2">No Inventory Added</Typography>
                            )}
                            <Button onClick={handleStockFormOpen} variant="outlined" sx={{ mt: 2 }}>
                                Add Use Inventory
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
                        label="Use Quantity"
                        value={stockData.quantity}
                        onChange={(e) => handleStockDataChange('quantity', e.target.value)}
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
                                    Daily Inventory Details
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
                                            Inventory Date:
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2">
                                        {selectedStockPlan.date}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    {selectedStockPlan.useItems && selectedStockPlan.useItems.length > 0 ? (
                                        <TableContainer component={Paper}>
                                            <Table>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Index</TableCell>
                                                        <TableCell>Item</TableCell>
                                                        <TableCell>Quantity</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {selectedStockPlan.useItems.map((item, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell>
                                                                <Typography variant="body2">{index + 1}</Typography>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Box display="flex" alignItems="center">
                                                                    <Typography variant="body2">{items.find((data) => data.uid === item.itemUid).itemName}</Typography> {/* Assuming you have itemName */}
                                                                </Box>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Typography variant="body2">{item.quantity}</Typography>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    ) : (
                                        <Typography variant="body2" color="textSecondary">
                                            No items available.
                                        </Typography>
                                    )}
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
