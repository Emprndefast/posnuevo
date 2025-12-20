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
];

// Categorías de reparación profesionales
const REPAIR_CATEGORIES = [
  { id: 'screen', name: 'Pantalla/Display' },
  { id: 'battery', name: 'Batería' },
  { id: 'camera', name: 'Cámara' },
  { id: 'charging', name: 'Puerto de Carga' },
  { id: 'button', name: 'Botones' },
  { id: 'speaker', name: 'Altavoz' },
  { id: 'mic', name: 'Micrófono' },
  { id: 'glass', name: 'Cristal Trasero' },
  { id: 'housing', name: 'Carcasa' },
  { id: 'antenna', name: 'Antena' },
  { id: 'flexcable', name: 'Flex Cable' },
  { id: 'motherboard', name: 'Placa Madre' },
  { id: 'unlock', name: 'Desbloqueo y Servicio' },
  { id: 'other', name: 'Otro' },
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
  const [repairs, setRepairs] = useState([]);
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
    fetchRepairs();
  }, []);

  const fetchRepairs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/repairs', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setRepairs(response.data || []);
      setError('');
    } catch (err) {
      console.log('Reparaciones:', err);
      setRepairs([]);
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

  const getDeviceModels = () => {
    if (!selectedBrand) return [];
    // Aquí puedes agregar modelos específicos por marca
    return [
      `${selectedBrand} X1`,
      `${selectedBrand} Pro`,
      `${selectedBrand} Pro Max`,
      `${selectedBrand} Air`,
      `${selectedBrand} Ultra`,
    ];
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
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              >
                {DEVICE_BRANDS.map(brand => (
                  <MenuItem key={brand} value={brand}>{brand}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Modelo de Dispositivo"
              value={formData.device}
              onChange={(e) => setFormData({ ...formData, device: e.target.value })}
              placeholder="ej: iPhone 16 Plus"
              required
            />

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
