import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Snackbar,
  Tooltip,
  Fade,
  InputAdornment,
  Avatar,
  Chip,
  useTheme,
  alpha,
  useMediaQuery,
  Stack,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Notes as NotesIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  Money as MoneyIcon,
} from '@mui/icons-material';
import { db } from '../../firebase/config';
import api from '../../api/api';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContextMongo';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import StatCard from '../StatCard';
import { formatCurrency } from '../../utils/formatters';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const DeleteConfirmation = ({ open, onClose, onConfirm, customerName }) => (
  <Dialog 
    open={open} 
    onClose={onClose}
    PaperProps={{
      sx: {
        borderRadius: 2,
        maxWidth: 400,
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1300
      }
    }}
  >
    <DialogTitle sx={{ 
      pb: 1,
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      borderBottom: (theme) => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      backgroundColor: (theme) => alpha(theme.palette.error.light, 0.1)
    }}>
      <ErrorIcon color="error" />
      <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
        Eliminar Cliente
      </Typography>
    </DialogTitle>
    
    <DialogContent sx={{ py: 3 }}>
      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
        ¿Estás seguro de que deseas eliminar este cliente?
      </Typography>
      
      <Typography variant="body1" color="text.secondary">
        El cliente <strong>{customerName}</strong> será eliminado permanentemente.
        Esta acción no se puede deshacer.
      </Typography>
    </DialogContent>
    
    <DialogActions sx={{ 
      p: 2,
      borderTop: (theme) => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      gap: 1,
      justifyContent: 'flex-end'
    }}>
      <Button 
        onClick={onClose} 
        color="inherit"
        sx={{ 
          minWidth: 100,
          height: 40,
          borderRadius: 2,
          '&:hover': {
            backgroundColor: (theme) => alpha(theme.palette.grey[300], 0.5)
          }
        }}
      >
        Cancelar
      </Button>
      <Button 
        onClick={onConfirm} 
        variant="contained" 
        color="error"
        startIcon={<DeleteIcon />}
        sx={{ 
          minWidth: 100,
          height: 40,
          borderRadius: 2,
          '&:hover': {
            backgroundColor: (theme) => theme.palette.error.dark
          }
        }}
      >
        Eliminar
      </Button>
    </DialogActions>
  </Dialog>
);

export const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [customerForm, setCustomerForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    type: 'individual',
    notes: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [filterType, setFilterType] = useState('all');
  const [stats, setStats] = useState({
    totalCustomers: 0,
    individualCustomers: 0,
    businessCustomers: 0,
    totalPurchases: 0
  });
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    customerId: null,
    customerName: ''
  });

  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  useEffect(() => {
    // Preferir backend si el usuario está autenticado por el backend (token)
    fetchCustomers();
  }, [user]);


  useEffect(() => {
    // Permitir que otros componentes abran el modal de nuevo cliente
    window.openCustomerModal = () => handleOpenDialog();
    return () => { window.openCustomerModal = undefined; };
  }, []);

  const fetchCustomers = async () => {
    try {
      setRefreshing(true);

      // Si hay token, preferir backend
      const token = localStorage.getItem('token');
      if (token) {
        const res = await api.get('/customers');
        if (res.data && res.data.success) {
          const customersData = res.data.data.map(c => ({ id: c._id, ...c }));
          setCustomers(customersData);

          const total = customersData.length;
          const individual = customersData.filter(c => c.type === 'individual').length;
          const business = customersData.filter(c => c.type === 'business').length;
          const totalPurchases = customersData.reduce((sum, c) => sum + (c.totalPurchases || 0), 0);

          setStats({ totalCustomers: total, individualCustomers: individual, businessCustomers: business, totalPurchases });
          return;
        }
      }

      // Fallback a Firestore si existe
      if (!db || !user?.uid) {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const q = query(collection(db, 'customers'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const customersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCustomers(customersData);

      const total = customersData.length;
      const individual = customersData.filter(c => c.type === 'individual').length;
      const business = customersData.filter(c => c.type === 'business').length;
      const totalPurchases = customersData.reduce((sum, c) => sum + (c.totalPurchases || 0), 0);

      setStats({ totalCustomers: total, individualCustomers: individual, businessCustomers: business, totalPurchases });
    } catch (err) {
      setError('Error al cargar los clientes: ' + (err.message || err.response?.data?.message));
      setSnackbar({ open: true, message: 'Error al cargar los clientes', severity: 'error' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleOpenDialog = (customer = null) => {
    if (customer) {
      setEditingCustomer(customer);
      setCustomerForm({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address || '',
        type: customer.type || 'individual',
        notes: customer.notes || ''
      });
    } else {
      setEditingCustomer(null);
      setCustomerForm({
        name: '',
        email: '',
        phone: '',
        address: '',
        type: 'individual',
        notes: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCustomer(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones locales
    if (!customerForm.name || !customerForm.name.trim()) {
      setSnackbar({ open: true, message: 'El nombre del cliente es requerido', severity: 'error' });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const customerData = { ...customerForm, updatedAt: new Date() };

      if (token) {
        // Backend flow
        console.log('Enviando cliente al backend con token:', token.substring(0, 20) + '...');
        
        if (editingCustomer) {
          await api.put(`/customers/${editingCustomer.id}`, customerData);
          setSnackbar({ open: true, message: 'Cliente actualizado exitosamente', severity: 'success' });
        } else {
          const res = await api.post('/customers', customerData);
          if (res.data && res.data.success) {
            setSnackbar({ open: true, message: 'Cliente agregado exitosamente', severity: 'success' });
          } else {
            setSnackbar({ open: true, message: res.data?.message || 'Error al agregar cliente', severity: 'error' });
            return;
          }
        }
      } else {
        // Fallback a Firestore
        console.warn('No hay token, usando Firestore');
        if (!user?.uid) {
          setSnackbar({ open: true, message: 'Debes iniciar sesión para agregar clientes', severity: 'error' });
          return;
        }

        if (editingCustomer) {
          await updateDoc(doc(db, 'customers', editingCustomer.id), customerData);
          setSnackbar({ open: true, message: 'Cliente actualizado exitosamente', severity: 'success' });
        } else {
          customerData.createdAt = new Date();
          customerData.totalPurchases = 0;
          await addDoc(collection(db, 'customers'), customerData);
          setSnackbar({ open: true, message: 'Cliente agregado exitosamente', severity: 'success' });
        }
      }

      handleCloseDialog();
      fetchCustomers();
    } catch (err) {
      console.error('Error detallado al guardar cliente:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Error desconocido';
      setSnackbar({ open: true, message: 'Error: ' + errorMsg, severity: 'error' });
    }
  };

  const handleDelete = async (customerId, customerName) => {
    setDeleteDialog({
      open: true,
      customerId,
      customerName
    });
  };

  const handleConfirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await api.delete(`/customers/${deleteDialog.customerId}`);
      } else {
        await deleteDoc(doc(db, 'customers', deleteDialog.customerId));
      }

      setSnackbar({ open: true, message: 'Cliente eliminado exitosamente', severity: 'success' });
      fetchCustomers();
    } catch (err) {
      console.error('Error al eliminar cliente:', err);
      setSnackbar({ open: true, message: 'Error al eliminar cliente', severity: 'error' });
    } finally {
      setDeleteDialog({ open: false, customerId: null, customerName: '' });
    }
  };

  const filteredCustomers = useMemo(() => {
    let result = [...customers];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(c => 
        c.name?.toLowerCase().includes(term) || 
        c.email?.toLowerCase().includes(term) ||
        c.phone?.toLowerCase().includes(term)
      );
    }
    
    if (filterType !== 'all') {
      result = result.filter(c => c.type === filterType);
    }
    
    return result;
  }, [customers, searchTerm, filterType]);

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
        mb: 3,
        gap: 2
      }}>
         <Typography 
            variant="h5" 
            sx={{ 
              mb: 1, 
              fontWeight: 700,
              fontSize: { xs: '1.5rem', sm: '2rem' },
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'primary.main'
            }}
          >
            Gestión de clientes
          </Typography>
          <Typography 
            variant="subtitle1" 
            color="text.secondary"
            sx={{ 
              fontSize: { xs: '0.875rem', sm: '1rem' },
              maxWidth: '600px',
              mx: 'auto'
            }}
          >
            Administra y monitorea tu inventario en tiempo real
          </Typography>
        <Box sx={{ 
          display: 'flex', 
          gap: 1,
          width: { xs: '100%', sm: 'auto' },
          justifyContent: { xs: 'space-between', sm: 'flex-end' }
        }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ 
              whiteSpace: 'nowrap',
              minWidth: { xs: 'auto', sm: 'auto' }
            }}
          >
            Nuevo Cliente
          </Button>
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={fetchCustomers}
            sx={{ 
              whiteSpace: 'nowrap',
              minWidth: { xs: 'auto', sm: 'auto' }
            }}
          >
            Actualizar
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate('/crm/customers')}
            sx={{
              whiteSpace: 'nowrap',
              fontWeight: 700
            }}
          >
            Ir al CRM
          </Button>
        </Box>
      </Box>

      {/* Tarjetas de estadísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <Card
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ y: -5 }}
            sx={{
              p: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              background: theme => theme.palette.primary.main,
              color: 'white',
              borderRadius: 2,
              position: 'relative',
              overflow: 'hidden',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography 
                variant="overline" 
                sx={{ 
                  opacity: 0.7,
                  fontSize: { xs: '0.625rem', sm: '0.75rem' },
                  display: 'block',
                  mb: 1
                }}
              >
                Total Clientes
              </Typography>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: { xs: '1.5rem', sm: '2rem' },
                  mb: 1
                }}
              >
                {stats.totalCustomers}
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mt: 1,
                gap: 1
              }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    opacity: 0.7,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }}
                >
                  +15% vs mes anterior
                </Typography>
              </Box>
              <Typography 
                variant="body2" 
                sx={{ 
                  opacity: 0.7,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  mt: 0.5
                }}
              >
                Tasa de crecimiento: 8.5%
              </Typography>
            </Box>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                right: -20,
                transform: 'translateY(-50%)',
                opacity: 0.1
              }}
            >
              <PersonIcon sx={{ fontSize: { xs: 60, sm: 80 } }} />
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ y: -5 }}
            sx={{
              p: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              background: theme => theme.palette.success.main,
              color: 'white',
              borderRadius: 2,
              position: 'relative',
              overflow: 'hidden',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography 
                variant="overline" 
                sx={{ 
                  opacity: 0.7,
                  fontSize: { xs: '0.625rem', sm: '0.75rem' },
                  display: 'block',
                  mb: 1
                }}
              >
                Clientes Individuales
              </Typography>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: { xs: '1.5rem', sm: '2rem' },
                  mb: 1
                }}
              >
                {stats.individualCustomers}
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mt: 1,
                gap: 1
              }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    opacity: 0.7,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }}
                >
                  Personas
                </Typography>
              </Box>
              <Typography 
                variant="body2" 
                sx={{ 
                  opacity: 0.7,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  mt: 0.5
                }}
              >
                Valor promedio: $450
              </Typography>
            </Box>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                right: -20,
                transform: 'translateY(-50%)',
                opacity: 0.1
              }}
            >
              <PersonIcon sx={{ fontSize: { xs: 60, sm: 80 } }} />
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ y: -5 }}
            sx={{
              p: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              background: theme => theme.palette.info.main,
              color: 'white',
              borderRadius: 2,
              position: 'relative',
              overflow: 'hidden',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography 
                variant="overline" 
                sx={{ 
                  opacity: 0.7,
                  fontSize: { xs: '0.625rem', sm: '0.75rem' },
                  display: 'block',
                  mb: 1
                }}
              >
                Clientes Empresariales
              </Typography>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: { xs: '1.5rem', sm: '2rem' },
                  mb: 1
                }}
              >
                {stats.businessCustomers}
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mt: 1,
                gap: 1
              }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    opacity: 0.7,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }}
                >
                  Empresas
                </Typography>
              </Box>
              <Typography 
                variant="body2" 
                sx={{ 
                  opacity: 0.7,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  mt: 0.5
                }}
              >
                Valor promedio: $1,250
              </Typography>
            </Box>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                right: -20,
                transform: 'translateY(-50%)',
                opacity: 0.1
              }}
            >
              <BusinessIcon sx={{ fontSize: { xs: 60, sm: 80 } }} />
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ y: -5 }}
            sx={{
              p: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              background: theme => theme.palette.warning.main,
              color: 'white',
              borderRadius: 2,
              position: 'relative',
              overflow: 'hidden',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography 
                variant="overline" 
                sx={{ 
                  opacity: 0.7,
                  fontSize: { xs: '0.625rem', sm: '0.75rem' },
                  display: 'block',
                  mb: 1
                }}
              >
                Compras Totales
              </Typography>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: { xs: '1.5rem', sm: '2rem' },
                  mb: 1
                }}
              >
                {formatCurrency(stats.totalPurchases)}
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mt: 1,
                gap: 1
              }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    opacity: 0.7,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }}
                >
                  +22% vs mes anterior
                </Typography>
              </Box>
              <Typography 
                variant="body2" 
                sx={{ 
                  opacity: 0.7,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  mt: 0.5
                }}
              >
                Promedio por cliente: $850
              </Typography>
            </Box>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                right: -20,
                transform: 'translateY(-50%)',
                opacity: 0.1
              }}
            >
              <MoneyIcon sx={{ fontSize: { xs: 60, sm: 80 } }} />
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Filtros y búsqueda */}
      <Card sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} lg={4}>
              <TextField
                fullWidth
                label="Buscar clientes"
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} lg={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Tipo de Cliente</InputLabel>
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  label="Tipo de Cliente"
                >
                  <MenuItem value="all">Todos los tipos</MenuItem>
                  <MenuItem value="individual">Individual</MenuItem>
                  <MenuItem value="business">Empresa</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} lg={4} sx={{ textAlign: 'right' }}>
              <Tooltip title="Actualizar">
                <IconButton 
                  onClick={fetchCustomers} 
                color="primary"
                  disabled={refreshing}
                >
                  <RefreshIcon sx={{ 
                    animation: refreshing ? 'spin 1s linear infinite' : 'none',
                    '@keyframes spin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' }
                    }
                  }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Exportar">
                <IconButton color="primary">
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabla de clientes */}
      <TableContainer 
        component={Paper} 
        sx={{ 
          borderRadius: 2,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          overflow: 'auto',
          maxWidth: '100%',
          '& .MuiTable-root': {
            minWidth: { xs: 'auto', sm: 650 },
            tableLayout: 'fixed'
          }
        }}
      >
        {loading ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            p: 4,
            minHeight: 200
          }}>
            <CircularProgress />
          </Box>
        ) : filteredCustomers.length === 0 ? (
          <Box sx={{ 
            p: 4, 
            textAlign: 'center',
            minHeight: 200,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <PersonIcon sx={{ 
              fontSize: { xs: 36, sm: 48 }, 
              color: 'text.secondary', 
              mb: 2 
            }} />
            <Typography 
              variant="h6" 
              color="text.secondary" 
              gutterBottom
              sx={{ 
                fontSize: { xs: '1rem', sm: '1.25rem' }
              }}
            >
              No se encontraron clientes
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                maxWidth: 400,
                mx: 'auto'
              }}
            >
              {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Agrega tu primer cliente haciendo clic en el botón "Nuevo Cliente"'}
            </Typography>
          </Box>
        ) : (
          <>
            <Table 
              size={isMobile ? "small" : "medium"} 
              sx={{ 
                minWidth: { xs: 'auto', sm: 650 },
                '& .MuiTableCell-root': {
                  py: { xs: 1, sm: 1.5 },
                  px: { xs: 1, sm: 2 },
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                }
              }}
            >
              <TableHead sx={{ 
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                '& .MuiTableCell-root': {
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }
              }}>
            <TableRow>
                  <TableCell 
                    sx={{ 
                      width: { xs: '40%', sm: '30%' }
                    }}
                  >
                    Cliente
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      width: { xs: '30%', sm: '25%' },
                      display: { xs: 'none', sm: 'table-cell' }
                    }}
                  >
                    Contacto
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      width: { xs: '30%', sm: '20%' },
                      display: { xs: 'none', sm: 'table-cell' }
                    }}
                  >
                    Tipo
                  </TableCell>
                  <TableCell 
                    align="right" 
                    sx={{ 
                      width: { xs: '30%', sm: '15%' }
                    }}
                  >
                    Compras
                  </TableCell>
                  <TableCell 
                    align="center" 
                    sx={{ 
                      width: { xs: '30%', sm: '15%' }
                    }}
                  >
                    Acciones
                  </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow 
                    key={customer.id}
                    hover
                    sx={{ 
                      '&:hover': { 
                        backgroundColor: alpha(theme.palette.primary.main, 0.04) 
                      },
                      transition: 'background-color 0.2s'
                    }}
                  >
                <TableCell>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        maxWidth: '100%'
                      }}>
                        <Avatar 
                          sx={{ 
                            width: { xs: 24, sm: 32 }, 
                            height: { xs: 24, sm: 32 }, 
                            bgcolor: theme.palette.primary.main,
                            fontSize: { xs: '0.75rem', sm: '0.875rem' }
                          }}
                        >
                          {customer.name?.[0]?.toUpperCase() || 'C'}
                        </Avatar>
                        <Box sx={{ 
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          <Typography 
                            variant="body2"
                            sx={{
                              fontWeight: 500,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {customer.name}
                          </Typography>
                          {isMobile && (
                            <Typography 
                              variant="caption" 
                              color="text.secondary"
                              sx={{ 
                                display: 'block',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {customer.email}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        display: { xs: 'none', sm: 'table-cell' }
                      }}
                    >
                      <Stack spacing={0.5}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography 
                            variant="body2"
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {customer.email}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography 
                            variant="body2"
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {customer.phone}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        display: { xs: 'none', sm: 'table-cell' }
                      }}
                    >
                      <Chip
                        label={customer.type === 'individual' ? 'Individual' : 'Empresa'}
                        size="small"
                        color={customer.type === 'individual' ? 'primary' : 'secondary'}
                        sx={{ 
                          minWidth: 85,
                          fontWeight: 500,
                          borderRadius: 1,
                          fontSize: { xs: '0.75rem', sm: '0.875rem' }
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 600,
                          fontSize: { xs: '0.75rem', sm: '0.875rem' }
                        }}
                      >
                        {formatCurrency(customer.totalPurchases)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ 
                        display: 'flex', 
                        gap: 1, 
                        justifyContent: 'center',
                        '& .MuiIconButton-root': {
                          padding: { xs: 0.5, sm: 1 }
                        }
                      }}>
                        <Tooltip title="Ver detalles">
                          <IconButton 
                            size="small"
                            sx={{
                              color: theme.palette.primary.main,
                              '&:hover': {
                                backgroundColor: theme.palette.primary.lighter
                              }
                            }}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar">
                  <IconButton 
                    size="small" 
                    onClick={() => handleOpenDialog(customer)}
                            sx={{
                              color: theme.palette.secondary.main,
                              '&:hover': {
                                backgroundColor: theme.palette.secondary.lighter
                              }
                            }}
                          >
                            <EditIcon fontSize="small" />
                  </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                  <IconButton 
                    size="small" 
                    onClick={() => handleDelete(customer.id, customer.name)}
                            sx={{
                              color: theme.palette.error.main,
                              '&:hover': {
                                backgroundColor: theme.palette.error.lighter
                              }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                  </IconButton>
                        </Tooltip>
                      </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
          </>
        )}
      </TableContainer>

      {/* Diálogo de cliente */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            {editingCustomer ? 'Editar Cliente' : 'Nuevo Cliente'}
          </Typography>
          <IconButton onClick={handleCloseDialog} size="small">
            <DeleteIcon />
          </IconButton>
        </DialogTitle>
        
        <form onSubmit={handleSubmit}>
          <DialogContent dividers>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nombre"
                  name="name"
                  value={customerForm.name}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={customerForm.email}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Teléfono"
                  name="phone"
                  value={customerForm.phone}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Dirección"
                  name="address"
                  value={customerForm.address}
                  onChange={handleInputChange}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Tipo de Cliente</InputLabel>
                  <Select
                    name="type"
                    value={customerForm.type}
                    onChange={handleInputChange}
                    label="Tipo de Cliente"
                    startAdornment={
                      <InputAdornment position="start">
                        <BusinessIcon color="action" />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="individual">Individual</MenuItem>
                    <MenuItem value="business">Empresa</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notas"
                  name="notes"
                  value={customerForm.notes}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <NotesIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseDialog} color="inherit">
              Cancelar
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
            >
              {editingCustomer ? 'Actualizar' : 'Guardar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Agregar el componente DeleteConfirmation */}
      <DeleteConfirmation
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, customerId: null, customerName: '' })}
        onConfirm={handleConfirmDelete}
        customerName={deleteDialog.customerName}
      />
    </Box>
  );
}; 