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
  const [view, setView] = useState('list'); // list, create, details
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedRepair, setSelectedRepair] = useState(null);
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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  const [formData, setFormData] = useState({
    brand: '',
    device: '',
    category: '',
    problem: '',
    status: 'pending',
    cost: '',
    notes: '',
    customer_name: '',
    customer_phone: '',
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
    if (!formData.brand || !formData.device || !formData.category) {
      setError('Por favor completa los campos requeridos');
      return;
    }

    try {
      await api.post('/api/repairs', formData, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      fetchRepairs();
      resetForm();
      setView('list');
      setError('');
    } catch (err) {
      setError('Error al crear reparación: ' + err.message);
    }
  };

  const handleUpdateRepair = async () => {
    if (!selectedRepair?._id) return;

    try {
      await api.put(`/api/repairs/${selectedRepair._id}`, formData, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      fetchRepairs();
      resetForm();
      setView('list');
      setSelectedRepair(null);
      setError('');
    } catch (err) {
      setError('Error al actualizar reparación: ' + err.message);
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
      brand: '',
      device: '',
      category: '',
      problem: '',
      status: 'pending',
      cost: '',
      notes: '',
      customer_name: '',
      customer_phone: '',
    });
  };

  // Obtener modelos de dispositivos para una marca
  const getDeviceModels = (brand) => {
    return DEVICE_MODELS[brand] || [`${brand} Generic Device`];
  };

  const handleBackClick = () => {
    setView('list');
    setSelectedBrand(null);
    resetForm();
  };

  const getRepairsForBrand = () => {
    if (!selectedBrand) return [];
    return repairs.filter(r => r.brand?.toLowerCase() === selectedBrand.toLowerCase());
  };

  const getRepairsForCategory = () => {
    const brandRepairs = getRepairsForBrand();
    if (!selectedRepair) return brandRepairs;
    return brandRepairs.filter(r => r.category === selectedRepair);
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

  // Vista: Listado de Marcas
  if (view === 'list' && !selectedBrand) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Reparaciones
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setView('create')}
          >
            Nueva Reparación
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Typography variant="subtitle1" sx={{ mb: 2, color: 'text.secondary' }}>
          Selecciona una marca para ver reparaciones
        </Typography>

        <Grid container spacing={2}>
          {DEVICE_BRANDS.map((brand) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={brand}>
              <Card
                onClick={() => setSelectedBrand(brand)}
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3,
                  },
                }}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {brand}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {getRepairsForBrand().length} reparaciones
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  // Vista: Reparaciones por Marca
  if (view === 'list' && selectedBrand && !selectedRepair) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <IconButton onClick={handleBackClick}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Reparaciones - {selectedBrand}
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
          <TextField
            placeholder="Buscar..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            sx={{ flex: 1 }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Estado</InputLabel>
            <Select
              value={filterStatus}
              label="Estado"
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              {REPAIR_STATUSES.map(s => (
                <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => {
              setFormData({ ...formData, brand: selectedBrand });
              setView('create');
            }}
          >
            Agregar
          </Button>
        </Box>

        <Grid container spacing={2}>
          {REPAIR_CATEGORIES.map((category) => {
            const categoryRepairs = getRepairsForBrand().filter(
              r => r.category === category.id
            );

            if (categoryRepairs.length === 0) return null;

            return (
              <Grid item xs={12} key={category.id}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                    {category.name} ({categoryRepairs.length})
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                          <TableCell>Modelo</TableCell>
                          <TableCell>Problema</TableCell>
                          <TableCell>Cliente</TableCell>
                          <TableCell>Costo</TableCell>
                          <TableCell>Estado</TableCell>
                          <TableCell align="right">Acciones</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {categoryRepairs.map((repair) => (
                          <TableRow key={repair._id}>
                            <TableCell>{repair.device}</TableCell>
                            <TableCell>{repair.problem}</TableCell>
                            <TableCell>{repair.customer_name || '-'}</TableCell>
                            <TableCell>${repair.cost || '0.00'}</TableCell>
                            <TableCell>
                              <Chip
                                label={getStatusLabel(repair.status)}
                                color={getStatusColor(repair.status)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="right">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setSelectedRepair(repair);
                                  setFormData(repair);
                                  setView('create');
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteRepair(repair._id)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    );
  }

  // Vista: Crear/Editar Reparación
  if (view === 'create') {
    return (
      <Container maxWidth="sm" sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <IconButton onClick={handleBackClick}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            {selectedRepair ? 'Editar Reparación' : 'Nueva Reparación'}
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth required>
              <InputLabel>Marca</InputLabel>
              <Select
                value={formData.brand}
                label="Marca"
                onChange={(e) => {
                  setFormData({ 
                    ...formData, 
                    brand: e.target.value,
                    device: '' // Reset device when brand changes
                  });
                }}
              >
                {DEVICE_BRANDS.map(brand => (
                  <MenuItem key={brand} value={brand}>{brand}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {formData.brand && (
              <FormControl fullWidth required>
                <InputLabel>Modelo de Dispositivo</InputLabel>
                <Select
                  value={formData.device}
                  label="Modelo de Dispositivo"
                  onChange={(e) => setFormData({ ...formData, device: e.target.value })}
                >
                  {getDeviceModels(formData.brand).map(model => (
                    <MenuItem key={model} value={model}>{model}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <FormControl fullWidth required>
              <InputLabel>Categoría de Reparación</InputLabel>
              <Select
                value={formData.category}
                label="Categoría de Reparación"
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {REPAIR_CATEGORIES.map(cat => (
                  <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Problema/Descripción"
              value={formData.problem}
              onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
              multiline
              rows={3}
              placeholder="Describe el problema del dispositivo..."
            />

            <TextField
              fullWidth
              label="Nombre del Cliente"
              value={formData.customer_name}
              onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
            />

            <TextField
              fullWidth
              label="Teléfono del Cliente"
              value={formData.customer_phone}
              onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
              type="tel"
            />

            <TextField
              fullWidth
              label="Costo de Reparación"
              value={formData.cost}
              onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
              type="number"
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
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

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={handleBackClick}
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={selectedRepair ? handleUpdateRepair : handleCreateRepair}
              >
                {selectedRepair ? 'Actualizar' : 'Crear'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    );
  }

  return null;
};

export default ReparacionesPro;
