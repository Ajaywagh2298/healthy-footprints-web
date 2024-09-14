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
    Alert
} from '@mui/material';
import { Refresh, AddCircleOutline, Visibility, Search, Delete } from '@mui/icons-material';
import {
      LabelImportant,
    Code,
    Description,
    ShoppingCart,
    Inventory,
    MonetizationOn,
    TrendingUp,
    Straighten,
    Layers,
    FilterFrames,
} from '@mui/icons-material';
import WarningIcon from '@mui/icons-material/Warning';
import EnergySavingsLeafIcon from '@mui/icons-material/EnergySavingsLeaf';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { BACKEND_HOST_URL, FRONTEND_HOST_URL } from '../config/config';

export default function ItemsScreen() {
    const [items, setItems] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [viewOpen, setViewOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [newItem, setNewItem] = useState({
        _id: '', // Set a valid ObjectId format
        itemName: '',
        itemCode: '',
        descript: '',
        cost: 0,
        quantity: 0,
        stockLimit: 0,
        staffUid: '',
        category: '' // Added category field
    });
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchItems();
    }, []);

    async function fetchItems() {
        setLoading(true);
        try {
            const response = await axios.get(`${BACKEND_HOST_URL}/api/items/`,
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
        } finally {
            setLoading(false);
        }
    }

    const handleItemClick = (item) => {
        setSelectedItem(item);
        setViewOpen(true);
    };

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setError(''); // Reset error on close
    };

    const handleViewClose = () => {
        setViewOpen(false);
    };

    const handleInputChange = (name, value) => {
        setNewItem({
            ...newItem,
            [name]: value,
        });
    };

    const user = JSON.parse(localStorage.getItem('user'));
    const staffUid = user ? user.user.uid : '';

    const handleSubmit = async () => {
        if (!newItem.itemName || !newItem.itemType) {
            setError('Please fill in all fields with valid values.');
            return;
        }

        try {
            delete newItem._id;
            await axios.post(`${BACKEND_HOST_URL}/api/items/`, {
                ...newItem,
                staffUid: staffUid
            },
            {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': FRONTEND_HOST_URL
            },
            withCredentials: true, // This includes cookies in the request if your backend expects them
          });
            setNewItem({
                _id: '', // Reset to a valid ObjectId format
                itemName: '',
                itemCode: '',
                descript: '',
                cost: 0,
                quantity: 0,
                stockLimit : 0,
                staffUid: '',
                category: '' // Reset category on submit
            });
            fetchItems();
            handleClose();
        } catch (error) {
            console.error('Failed to create item:', error);
        }
    };

    const handleDeleteItem = async (id) => {
        try {
            await axios.delete(`${BACKEND_HOST_URL}/api/items/${id}`,
                {
                headers: {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': FRONTEND_HOST_URL
                },
                withCredentials: true, // This includes cookies in the request if your backend expects them
              });
            fetchItems(); // Refresh the items list after deletion
        } catch (error) {
            console.error('Failed to delete item:', error);
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
        <Navbar/>
            <Container maxWidth="md">
                <Box display="flex" flexDirection="column" alignItems="center" padding={2} mt={4}>
                    <Box display="flex" alignItems="center" mb={3} width="100%">
                        <TextField
                            variant="outlined"
                            placeholder="Search Items"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            InputProps={{
                                startAdornment: <Search />,
                            }}
                            sx={{ flexGrow: 1, marginRight: 2 }}
                        />
                        <IconButton onClick={fetchItems} color="primary">
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
                                        <TableCell>Item Name</TableCell>
                                        <TableCell>View</TableCell>
                                        <TableCell></TableCell>
                                        <TableCell>Delete</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {items.length > 0 ? items.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item, index) => (
                                        <TableRow key={item._id || index}>
                                            <TableCell>{index + 1}</TableCell>
                                          
                                            <TableCell>{item.itemName}</TableCell>
                                            <TableCell>
                                                <IconButton size="small" color="primary" onClick={() => handleItemClick(item)}>
                                                    <Visibility />
                                                </IconButton>
                                            </TableCell>
                                              <TableCell>
                                            {item.totalQuantity - item.quantity > item.stockLimit ? (
                                                <IconButton size="small" color="success" title="Sufficient stock available!">
                                                    <EnergySavingsLeafIcon />
                                                </IconButton>
                                            ) : item.totalQuantity - item.quantity <= item.stockLimit && item.totalQuantity - item.quantity > 0 ? (
                                                <IconButton size="small" color="warning" title="Warning: Quantity is low!">
                                                    <WarningIcon />
                                                </IconButton>
                                            ) : null}
                                            </TableCell>
                                            <TableCell>
                                                <IconButton 
                                                    size="small" 
                                                    color="#d35400" 
                                                    onClick={() => handleDeleteItem(item._id)} 
                                                    disabled={(item.quantity > 0 && item.totalQuantity > 0) || item.totalQuantity > 0}
                                                >
                                                    <Delete />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={8}>
                                                <Typography variant="body1" align="center">No Items Found</Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25]}
                                component="div"
                                count={items.length}
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
                <DialogTitle>Create Item</DialogTitle>
                <DialogContent>
                    <Box component="form" noValidate autoComplete="off" sx={{ mt: 1 }}>
                        {error && <Alert severity="error">{error}</Alert>}
                        <TextField
                            margin="normal"
                            label="Item Name"
                            fullWidth
                            value={newItem.itemName}
                            onChange={(e) => handleInputChange('itemName', e.target.value)}
                        />
                        <TextField
                            margin="normal"
                            label="Item Code"
                            fullWidth
                            value={newItem.itemCode}
                            onChange={(e) => handleInputChange('itemCode', e.target.value)}
                        />
                        <TextField
                            margin="normal"
                            label="Description"
                            fullWidth
                            multiline
                            rows={2}
                            value={newItem.descript}
                            onChange={(e) => handleInputChange('descript', e.target.value)}
                        />
                        <TextField
                            margin="normal"
                            label="Stock Limit"
                            type="number"
                            fullWidth
                            value={newItem.stockLimit}
                            onChange={(e) => handleInputChange('stockLimit', e.target.value)}
                        />
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Category</InputLabel>
                            <Select
                                value={newItem.itemType}
                                onChange={(e) => handleInputChange('itemType', e.target.value)}
                            >
                                <MenuItem value="0">Single Use</MenuItem>
                                <MenuItem value="1">Repeated Use</MenuItem>
                                <MenuItem value="2">General</MenuItem>
                                <MenuItem value="3">Other</MenuItem>
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
                <DialogTitle>View Item Details</DialogTitle>
                <DialogContent>
                    {selectedItem && (
                       <Box sx={{ padding: 2, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
                       <Grid container spacing={3}>
           
                           {/* Item Name */}
                           <Grid item xs={6}>
                               <Box display="flex" alignItems="center">
                                   <LabelImportant sx={{ color: '#1976d2', mr: 1 }} />
                                   <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                       Item Name:
                                   </Typography>
                               </Box>
                               <Typography variant="body2" sx={{ ml: 4 }}>
                                   {selectedItem.itemName}
                               </Typography>
                           </Grid>
           
                           {/* Item Code */}
                           <Grid item xs={6}>
                               <Box display="flex" alignItems="center">
                                   <Code sx={{ color: '#1976d2', mr: 1 }} />
                                   <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                       Item Code:
                                   </Typography>
                               </Box>
                               <Typography variant="body2" sx={{ ml: 4 }}>
                                   {selectedItem.itemCode}
                               </Typography>
                           </Grid>
           
                           <Grid item xs={12}>
                               <Divider sx={{ my: 2 }} />
                           </Grid>
           
                           {/* Description */}
                           <Grid item xs={12}>
                               <Box display="flex" alignItems="center">
                                   <Description sx={{ color: '#1976d2', mr: 1 }} />
                                   <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                       Description:
                                   </Typography>
                               </Box>
                               <Typography variant="body2" sx={{ ml: 4 }}>
                                   {selectedItem.descript}
                               </Typography>
                           </Grid>
           
                           {/* Use Quantity */}
                           <Grid item xs={6}>
                               <Box display="flex" alignItems="center">
                                   <ShoppingCart sx={{ color: '#1976d2', mr: 1 }} />
                                   <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                       available Quantity:
                                   </Typography>
                               </Box>
                               <Typography variant="body2" sx={{ ml: 4 }}>
                                   {selectedItem.totalQuantity - selectedItem.quantity}
                               </Typography>
                           </Grid>
           
                           {/* Total Quantity */}
                           <Grid item xs={6}>
                               <Box display="flex" alignItems="center">
                                   <Inventory sx={{ color: '#1976d2', mr: 1 }} />
                                   <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                       Total Quantity:
                                   </Typography>
                               </Box>
                               <Typography variant="body2" sx={{ ml: 4 }}>
                                   {selectedItem.totalQuantity}
                               </Typography>
                           </Grid>
           
                           <Grid item xs={12}>
                               <Divider sx={{ my: 2 }} />
                           </Grid>
           
                           {/* Stock Limit */}
                           <Grid item xs={6}>
                               <Box display="flex" alignItems="center">
                                   <TrendingUp sx={{ color: '#1976d2', mr: 1 }} />
                                   <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                       Stock Limit:
                                   </Typography>
                               </Box>
                               <Typography variant="body2" sx={{ ml: 4 }}>
                                   {selectedItem.stockLimit}
                               </Typography>
                           </Grid>
           
                           <Grid item xs={12}>
                               <Divider sx={{ my: 2 }} />
                           </Grid>
           
                           {/* Total Cost */}
                           <Grid item xs={12}>
                               <Box display="flex" alignItems="center">
                                   <MonetizationOn sx={{ color: '#1976d2', mr: 1 }} />
                                   <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                       Total Cost:
                                   </Typography>
                               </Box>
                               <Typography variant="body2" sx={{ ml: 4 }}>
                                   RS. {selectedItem.totalCost.toFixed(2)}
                               </Typography>
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
