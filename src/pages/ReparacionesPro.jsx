import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  InputAdornment,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import { useAuth } from '../context/AuthContextMongo';

// Marcas de dispositivos profesionales
const DEVICE_BRANDS = [
  'Apple',
  'Samsung',
  'Motorola',
  'Google',
  'OnePlus',
  'Xiaomi',
  'Huawei',
  'Honor',
  'HTC',
  'Oppo',
  'Realme',
  'Revi',
  'Zte',
  'Alcatel',
  'LG',
  'Nokia',
  'Sony',
  'TLC',
  'Amazon',
  'Microsoft'
];

// Modelos por marca (expansión de Apple como ejemplo)
const DEVICE_MODELS = {
  'Apple': [
    'iPhone 17 Pro Max',
    'iPhone 17 Pro',
    'iPhone 17 Air',
    'iPhone 17',
    'iPhone 16 Pro Max',
    'iPhone 16 Pro',
    'iPhone 16 Plus',
    'iPhone 16',
    'iPhone 15 Pro Max',
    'iPhone 15 Pro',
    'iPhone 15 Plus',
    'iPhone 15',
    'iPhone 14 Pro Max',
    'iPhone 14 Pro',
    'iPhone 14 Plus',
    'iPhone 14',
    'iPhone 13 Pro Max',
    'iPhone 13 Pro',
    'iPhone 13',
    'iPhone 13 Mini',
    'iPhone SE (2022)',
    'iPhone 12 Pro Max',
    'iPhone 12 Pro',
    'iPhone 12',
    'iPhone 12 Mini',
    'iPhone 11 Pro Max',
    'iPhone 11 Pro',
    'iPhone 11',
    'iPhone XS Max',
    'iPhone XS',
    'iPhone XR',
    'iPhone X',
    'iPhone SE (2020)',
    'iPhone 8 Plus',
    'iPhone 8',
    'iPhone 7 Plus',
    'iPhone 7',
    'iPad Pro 12.9" 6th Gen (2022)',
    'iPad Pro 12.9" 5th Gen (2021)',
    'iPad Pro 12.9" 4th Gen (2020)',
    'iPad Pro 12.9" 3rd Gen (2018)',
    'iPad Air 5 (2022)',
    'iPad Air 4 (2020)',
    'iPad Mini 6 (2021)',
    'iPad Mini 5 (2019)',
    'Apple Watch Ultra 2 (49MM)',
    'Apple Watch Series 10 (46MM)',
    'Apple Watch Series 9 (45MM)',
    'AirPods Pro 2',
    'AirPods Max',
    'AirPods 4',
    'iMac 27"',
    'MacBook Pro'
  ],
  'Samsung': [
    'Galaxy S24 Ultra',
    'Galaxy S24+',
    'Galaxy S24',
    'Galaxy S23 Ultra',
    'Galaxy S23',
    'Galaxy S23 FE',
    'Galaxy S22 Ultra',
    'Galaxy S22',
    'Galaxy Z Fold 6',
    'Galaxy Z Flip 6'
  ],
  'Google': [
    'Pixel 9 Pro XL',
    'Pixel 9 Pro',
    'Pixel 9 Pro Fold',
    'Pixel 9',
    'Pixel 8 Pro',
    'Pixel 8'
  ],
  'Motorola': [
    'Edge 50 Ultra',
    'Edge 50 Pro',
    'Edge 50',
    'Moto G24',
    'Moto G54'
  ]
};

// Categorías de reparación profesionales - expandidas
const REPAIR_CATEGORIES = [
  { id: 'screen', name: 'LCD Screen' },
  { id: 'battery', name: 'Battery' },
  { id: 'camera', name: 'Cameras' },
  { id: 'charging', name: 'Charging Port' },
  { id: 'button', name: 'Buttons' },
  { id: 'speaker', name: 'Speakers' },
  { id: 'mic', name: 'Microphone' },
  { id: 'glass', name: 'Back Glass' },
  { id: 'housing', name: 'Housing' },
  { id: 'antenna', name: 'Antennas' },
  { id: 'flexcable', name: 'Flex Cable' },
  { id: 'motherboard', name: 'Motherboard service' },
  { id: 'unlock', name: 'Unlock & Service' },
  { id: 'cameralens', name: 'Camera lens' },
  { id: 'other', name: 'Other' },
];

const REPAIR_STATUSES = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'in_progress', label: 'En Progreso' },
  { value: 'completed', label: 'Completado' },
  { value: 'cancelled', label: 'Cancelado' },
];

const ReparacionesPro = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCategoryRepairs, setSelectedCategoryRepairs] = useState([]);
  const [repairs, setRepairs] = useState([
    // Datos de ejemplo para que siempre haya algo visible
    {
      _id: 'example-1',
      usuario_id: 'current',
      brand: 'Apple',
      device: 'iPhone 15',
      category: 'screen',
      problem: 'Pantalla rota',
      customer_name: 'Ejemplo',
      cost: 0,
      status: 'pending'
    }
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDeviceModal, setOpenDeviceModal] = useState(false);
  const [openRepairModal, setOpenRepairModal] = useState(false);
  const [editingRepair, setEditingRepair] = useState(null);

  const [formData, setFormData] = useState({
    cost: '',
    customer_name: '',
    customer_phone: '',
    status: 'pending',
    notes: '',
  });

  useEffect(() => {
    if (user) {
      fetchRepairs();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchRepairs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/repairs');
        const data = response.data?.data || response.data || [];
        if (Array.isArray(data) && data.length > 0) {
          setRepairs(data);
        }
        setError('');
      } catch (apiErr) {
        console.log('API unavailable, using local data');
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRepair = async () => {
    if (!editingRepair && (!selectedBrand || !selectedDevice || !selectedCategory)) {
      setError('Por favor completa los campos requeridos');
      return;
    }

    const repairData = editingRepair ? {
      ...editingRepair,
      ...formData
    } : {
      brand: selectedBrand,
      device: selectedDevice,
      category: selectedCategory,
      problem: formData.problem || 'Reparación',
      cost: formData.cost || 0,
      customer_name: formData.customer_name || '',
      customer_phone: formData.customer_phone || '',
      status: formData.status,
      notes: formData.notes || '',
    };

    try {
      if (editingRepair?._id) {
        // Actualizar
        await api.put(`/api/repairs/${editingRepair._id}`, repairData, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
      } else {
        // Crear nueva
        await api.post('/api/repairs', repairData, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
      }
      
      fetchRepairs();
      setOpenRepairModal(false);
      setEditingRepair(null);
      resetForm();
      setError('');
    } catch (err) {
      setError('Error al guardar reparación: ' + err.message);
    }
  };

  const handleDeleteRepair = async (id) => {
    if (!window.confirm('¿Eliminar esta reparación?')) return;

    try {
      await api.delete(`/api/repairs/${id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      fetchRepairs();
      setError('');
    } catch (err) {
      setError('Error al eliminar reparación: ' + err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      cost: '',
      customer_name: '',
      customer_phone: '',
      status: 'pending',
      notes: '',
    });
  };

  // Obtener modelos de dispositivos para una marca
  const getDeviceModels = (brand) => {
    return DEVICE_MODELS[brand] || [`${brand} Generic Device`];
  };

  // Obtener reparaciones por categoría
  const getRepairsForCategory = (brand, category) => {
    return repairs.filter(r => 
      r.brand?.toLowerCase() === brand.toLowerCase() && 
      r.category === category
    );
  };

  // Abrir modal de categorías cuando selecciona marca
  const handleSelectBrand = (brand) => {
    setSelectedBrand(brand);
    const devices = getDeviceModels(brand);
    setSelectedDevice(devices[0]); // Seleccionar primer dispositivo por defecto
    setOpenDeviceModal(true);
  };

  // Abrir modal de reparaciones cuando selecciona categoría
  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    const categoryRepairs = getRepairsForCategory(selectedBrand, category.id);
    setSelectedCategoryRepairs(categoryRepairs);
    setOpenRepairModal(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      in_progress: 'info',
      completed: 'success',
      cancelled: 'error',
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pendiente',
      in_progress: 'En Progreso',
      completed: 'Completado',
      cancelled: 'Cancelado',
    };
    return labels[status] || status;
  };

  // VISTA PRINCIPAL: Grid de Marcas
  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Reparaciones Profesionales
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Typography variant="subtitle1" sx={{ mb: 3, color: 'text.secondary' }}>
        Selecciona una marca de dispositivo para comenzar
      </Typography>

      <Grid container spacing={2}>
        {DEVICE_BRANDS.map((brand) => {
          const brandRepairsCount = repairs.filter(r => r.brand?.toLowerCase() === brand.toLowerCase()).length;
          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={brand}>
              <Card
                onClick={() => handleSelectBrand(brand)}
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent sx={{ textAlign: 'center', flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {brand}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {brandRepairsCount} reparaciones
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* MODAL: Categorías de Reparación por Marca */}
      <Dialog
        open={openDeviceModal}
        onClose={() => setOpenDeviceModal(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.5rem' }}>
          {selectedBrand} - Selecciona Dispositivo
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          {/* Selector de dispositivo */}
          <Box sx={{ mb: 4, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
              Dispositivo a reparar: <span style={{ color: '#1976d2' }}>{selectedDevice}</span>
            </Typography>
            <FormControl fullWidth size="small">
              <InputLabel>Cambiar dispositivo</InputLabel>
              <Select
                value={selectedDevice}
                label="Cambiar dispositivo"
                onChange={(e) => setSelectedDevice(e.target.value)}
              >
                {getDeviceModels(selectedBrand).map(model => (
                  <MenuItem key={model} value={model}>{model}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Grid de Categorías */}
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
            Categorías de Reparación
          </Typography>
          <Grid container spacing={2}>
            {REPAIR_CATEGORIES.map((category) => {
              const categoryRepairsCount = repairs.filter(r =>
                r.brand?.toLowerCase() === selectedBrand.toLowerCase() &&
                r.category === category.id
              ).length;

              return (
                <Grid item xs={12} sm={6} md={4} key={category.id}>
                  <Card
                    onClick={() => handleSelectCategory(category)}
                    sx={{
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 3,
                        backgroundColor: '#f9f9f9',
                      },
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {category.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        RD$0.00 - RD$0.00
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#4caf50', fontWeight: 'bold', display: 'block', mt: 1 }}>
                        ✓ En stock para {categoryRepairsCount || 'varias'} variaciones
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDeviceModal(false)}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL: Reparaciones para la Categoría Seleccionada */}
      <Dialog
        open={openRepairModal}
        onClose={() => setOpenRepairModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {selectedBrand} - {selectedDevice} - {selectedCategory?.name}
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          {editingRepair ? (
            // FORMULARIO DE EDICIÓN
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Nombre del Cliente"
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                placeholder="Ingresa nombre del cliente"
              />

              <TextField
                fullWidth
                label="Teléfono del Cliente"
                value={formData.customer_phone}
                onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                type="tel"
                placeholder="+34 600 000 000"
              />

              <TextField
                fullWidth
                label="Costo de Reparación"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                type="number"
                InputProps={{
                  startAdornment: <InputAdornment position="start">RD$</InputAdornment>,
                }}
              />

              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={formData.status}
                  label="Estado"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  {REPAIR_STATUSES.map(s => (
                    <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Notas"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                multiline
                rows={2}
                placeholder="Notas adicionales..."
              />
            </Box>
          ) : (
            // LISTA DE REPARACIONES PRECARGADAS
            <Box>
              {selectedCategoryRepairs.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {selectedCategoryRepairs.map((repair) => (
                    <Paper
                      key={repair._id}
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          boxShadow: 2,
                          backgroundColor: '#f5f5f5',
                        },
                      }}
                      onClick={() => {
                        setEditingRepair(repair);
                        setFormData({
                          cost: repair.cost || '',
                          customer_name: repair.customer_name || '',
                          customer_phone: repair.customer_phone || '',
                          status: repair.status || 'pending',
                          notes: repair.notes || '',
                        });
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                            {repair.device}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {repair.problem}
                          </Typography>
                        </Box>
                        <Chip
                          label={`RD$${repair.cost || '0.00'}`}
                          color="primary"
                          variant="outlined"
                          sx={{ fontWeight: 'bold' }}
                        />
                      </Box>
                    </Paper>
                  ))}
                </Box>
              ) : (
                <Typography color="text.secondary" align="center" sx={{ py: 3 }}>
                  No hay reparaciones precargadas. Crea una nueva.
                </Typography>
              )}

              <Button
                fullWidth
                variant="outlined"
                startIcon={<AddIcon />}
                sx={{ mt: 2 }}
                onClick={() => {
                  setEditingRepair(null);
                  resetForm();
                  setFormData({
                    ...formData,
                    cost: '0',
                  });
                }}
              >
                Crear Nueva Reparación
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          {editingRepair && (
            <Button
              variant="text"
              onClick={() => {
                setEditingRepair(null);
                resetForm();
              }}
            >
              Atrás
            </Button>
          )}
          <Button onClick={() => {
            setOpenRepairModal(false);
            setEditingRepair(null);
            resetForm();
          }}>
            Cerrar
          </Button>
          {editingRepair && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleCreateRepair}
            >
              Guardar
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ReparacionesPro;
