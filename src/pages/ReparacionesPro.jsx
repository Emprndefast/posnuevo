import React, { useState, useEffect, startTransition } from 'react';
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
  ShoppingCart as ShoppingCartIcon,
  Store as StoreIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import { useAuth } from '../context/AuthContextMongo';
import { useCart } from '../context/CartContext';
import { useTelegram } from '../context/TelegramContext';
import { enqueueSnackbar } from 'notistack';

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
    'Galaxy S24 Ultra 5G',
    'Galaxy S24 Plus 5G',
    'Galaxy S24 5G',
    'Galaxy S23 FE 5G',
    'Galaxy S23 Ultra 5G',
    'Galaxy S23 Plus 5G',
    'Galaxy S23 5G',
    'Galaxy S22 Ultra 5G',
    'Galaxy S22 Plus 5G',
    'Galaxy S22 5G',
    'Galaxy S21 FE',
    'Galaxy S21 Ultra',
    'Galaxy S21 Plus',
    'Galaxy S21',
    'Galaxy S20 FE 5G',
    'Galaxy S20 Ultra 5G',
    'Galaxy S20 Plus 5G',
    'Galaxy S20 5G',
    'Galaxy S10 Lite',
    'Galaxy S10 5G',
    'Galaxy S10 Plus',
    'Galaxy S10',
    'Galaxy S10e',
    'Galaxy S9 Plus',
    'Galaxy S9',
    'Galaxy S8 Plus',
    'Galaxy S8 Active',
    'Galaxy S8',
    'Galaxy S7 Edge',
    'Galaxy S7 Active',
    'Galaxy S7',
    'Galaxy S6 Edge Plus',
    'Galaxy S6 Edge',
    'Galaxy S6 Active',
    'Galaxy S6',
    'Galaxy S5 Neo',
    'Galaxy S5 Active',
    'Galaxy S5',
    'Galaxy S4 Active',
    'Galaxy S4',
    'Galaxy S3',
    'Galaxy S3 Mini',
    'Galaxy Note 20 Ultra 5G',
    'Galaxy Note 20 5G',
    'Galaxy Note 10 Plus 5G',
    'Galaxy Note 10 Lite',
    'Galaxy Note 10',
    'Galaxy Note 9',
    'Galaxy Note 8',
    'Galaxy Note 7',
    'Galaxy Note 5',
    'Galaxy Note 4',
    'Galaxy Note 3',
    'Galaxy Note 3 Neo',
    'Galaxy Note 3 mini',
    'Galaxy Note 2',
    'J8 Plus (J805 / 2018)',
    'J8 (J810 / 2018)',
    'J7 Refine (J737 / 2018)',
    'J7 Pro (J730 / 2017)',
    'J7 Prime (G610 / 2016)',
    'J7 (J727 / 2017)',
    'J7 (J710 / 2016)',
    'J7 (J700 / 2015)',
    'J6 Plus (J610 / 2018)',
    'J6 (J600 / 2018)',
    'J5 Pro (J530 / 2017)',
    'J5 Prime (G570 / 2016)',
    'J5 (J510 / 2016)',
    'J5 (J500 / 2015)',
    'J4 Plus (J415 / 2018)',
    'J4 (J400 / 2018)',
    'J3 Pro (J330 / 2017)',
    'J3 (J337 / 2018)',
    'J3 (J327 / 2017)',
    'J3 (J320 / 2016)',
    'J2 Pro (J250 / 2018)',
    'J2 Core (J260 / 2018)',
    'J2 (J200 / 2015)',
    'J1 Ace (J110 / 2016)',
    'J1 (J120 / 2016)',
    'A90 5G (A908 /2019)',
    'A9 Pro (A910 / 2016)',
    'A9 (A920 / 2018)',
    'A80 (A805 / 2019)',
    'A8 Plus (A730 / 2018)',
    'A8s (G887 / 2018)',
    'A8 (A810 / 2016)',
    'A8 (A530 / 2018)',
    'A73 5G (A736 / 2022)',
    'A73 (A735 / 2022)',
    'A72 (A725 / 2021)',
    'A71 5G (A716 / 2020)',
    'A71 (A715 / 2020)',
    'A70 (A705 / 2019)',
    'A7 (A750 / 2018)',
    'A7 (A720 / 2017)',
    'A7 (A710 / 2016)',
    'A60 (A606 / 2019)',
    'A6 Plus (A605 / 2018)',
    'A6 (A600 / 2018)',
    'A54 5G (A546 / 2023)',
    'A53 5G (A536 / 2022)',
    'A52s (A528 / 2021)',
    'A52 5G (A526 / 2021)',
    'A52 4G (A525 / 2021)',
    'A51 5G (A516 / 2020)',
    'A51 4G (A515 / 2019)',
    'A50s (A507 / 2019)',
    'A50 (A505 / 2019)',
    'A5 (A520 / 2017)',
    'A5 (A510 / 2016)',
    'A5 (A500 / 2015)',
    'A42 5G (A426 / 2020)',
    'A41 (A415 / 2020)',
    'A40S (A407 / 2019)',
    'A40 (A405 / 2019)',
    'A34 5G (A346 / 2023)',
    'A33 5G (A336 / 2022)',
    'A32 5G (A326 / 2021)',
    'A32 4G (A325 / 2021)',
    'A31 (A315 / 2020)',
    'A30s (A307 / 2019)',
    'A30 (A305 / 2019)',
    'A3 (A320 / 2017)',
    'A3 (A310 / 2016)',
    'A3 (A300 / 2015)'
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
  const { addRepairToCart } = useCart();
  const { notifySale } = useTelegram();
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
  const [searchBrand, setSearchBrand] = useState('');

  const [formData, setFormData] = useState({
    cost: '',
    customer_name: '',
    customer_phone: '',
    status: 'pending',
    notes: ''
  });

  // Partes seleccionadas para la reparación actual (multi-selección)
  const [selectedParts, setSelectedParts] = useState([]);

  // Información extendida del dispositivo
  const [deviceInfo, setDeviceInfo] = useState({
    imei: '',
    condition: '',
    passcode: '',
    deliveryDate: '',
  });

  // Variaciones seleccionadas por parte (nombre de parte => nombre variación)
  const [selectedVariations, setSelectedVariations] = useState({});

  const handleSelectVariation = (partName, variationName) => {
    setSelectedVariations(prev => ({ ...prev, [partName]: variationName }));
  };

  const togglePartSelection = (part, variation) => {
    const variationLabel = variation ? ` (${variation.nombre})` : '';
    const partName = `${part.nombre}${variationLabel}`;
    // Intentar obtener precio de variación, luego precio_minimo (plantillas), luego cost (seeds)
    const precio = variation?.precio_minimo ?? variation?.precio ?? part.precio_minimo ?? part.precio ?? part.cost ?? 0;

    setSelectedParts(prev => {
      const exists = prev.find(p => p.nombre === partName);
      if (exists) {
        return prev.filter(p => p.nombre !== partName);
      } else {
        return [...prev, { nombre: partName, precio, cantidad: 1 }];
      }
    });

    if (!editingRepair) {
      // Activar vista de detalles si es la primera pieza
      setEditingRepair({
        brand: selectedBrand,
        device: selectedDevice,
        category: selectedCategory?.id || 'repair',
        status: 'pending'
      });
    }
  };

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
    // Validaciones
    if (!selectedCategory) {
      setError('Por favor selecciona una categoría de reparación');
      return;
    }

    if (!formData.cost || formData.cost <= 0) {
      setError('Por favor ingresa un costo válido para la reparación');
      return;
    }

    if (!formData.customer_name) {
      setError('Por favor ingresa el nombre del cliente');
      return;
    }

    // Construir datos
    const categoryId = editingRepair?.category || selectedCategory?.id || selectedCategory;

    const repairData = {
      brand: editingRepair?.brand || selectedBrand,
      device: editingRepair?.device || selectedDevice,
      category: categoryId,
      problem: formData.problem || 'Reparación',
      cost: parseFloat(formData.cost),
      precio: parseFloat(formData.cost),
      customer_name: formData.customer_name,
      customer_phone: formData.customer_phone || '',
      status: formData.status || 'pending',
      estado: formData.status || 'pending',
      notes: formData.notes || '',
      partes_reparar: editingRepair?.partes_reparar || []
    };

    try {
      if (editingRepair?._id) {
        // Actualizar reparación existente
        await api.put(`/api/repairs/${editingRepair._id}`, repairData, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        enqueueSnackbar('Reparación actualizada correctamente', { variant: 'success' });
      } else {
        // Crear nueva reparación
        const response = await api.post('/repairs', repairData, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        // Notificación de reparación: la envía el servidor tras guardar la reparación para evitar duplicados
        console.log('🔔 La notificación de reparación será enviada por el servidor (evitando duplicados).');

        enqueueSnackbar('Reparación guardada correctamente', { variant: 'success' });
      }

      // Recargar y cerrar
      fetchRepairs();
      setOpenRepairModal(false);
      setEditingRepair(null);
      resetForm();
      setError('');
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al guardar reparación';
      setError(errorMsg);
      enqueueSnackbar(errorMsg, { variant: 'error' });
      console.error('Error:', err);
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
    setSelectedParts([]);
    setDeviceInfo({
      imei: '',
      condition: '',
      passcode: '',
      deliveryDate: '',
    });
  };

  // Obtener modelos de dispositivos para una marca
  const getDeviceModels = (brand) => {
    if (!brand) return [];
    return DEVICE_MODELS[brand] || [`${brand} Generic Device`];
  };

  // Obtener reparaciones por categoría (defensivo)
  const getRepairsForCategory = (brand, category) => {
    const brandNorm = String(brand || '').toLowerCase();
    return repairs.filter(r =>
      String(r.brand || '').toLowerCase() === brandNorm &&
      r.category === category
    );
  };

  // Mapeo de id de categoría a nombres de partes en plantillas
  const CATEGORY_TO_PART_NAMES = {
    screen: ['LCD Screen', 'Display'],
    battery: ['Battery'],
    camera: ['Cameras', 'Camera lens'],
    cameralens: ['Camera lens'],
    charging: ['Charging Port'],
    button: ['Buttons'],
    speaker: ['Speakers'],
    mic: ['Microphone'],
    glass: ['Back Glass'],
    housing: ['Housing'],
    antenna: ['Antennas'],
    flexcable: ['Flex Cable'],
    motherboard: ['Motherboard service'],
    unlock: ['Unlock & Service'],
    other: ['Other']
  };

  const getDeviceTypeForModel = (brand, model) => {
    if (!brand) return '';
    if (brand === 'Samsung') return 'Galaxy';
    if (brand === 'Apple') {
      if (String(model).toLowerCase().includes('ipad')) return 'iPad';
      if (String(model).toLowerCase().includes('airpods')) return 'AirPods';
      if (String(model).toLowerCase().includes('watch')) return 'Watch';
      return 'iPhone';
    }
    if (brand === 'Google') return 'Pixel';
    if (brand === 'Motorola') return 'Edge';
    return brand;
  };

  const fetchPartsForModel = async (brand, model) => {
    try {
      const tipo = getDeviceTypeForModel(brand, model);
      const token = localStorage.getItem('token');
      const res = await api.get(`/repair-templates/brands/${encodeURIComponent(brand)}/types/${encodeURIComponent(tipo)}/models/${encodeURIComponent(model)}/parts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return res.data?.data?.partes || [];
    } catch (err) {
      // No hay plantilla, devolver vacío
      return [];
    }
  };

  // Abrir modal de categorías cuando selecciona marca
  const handleSelectBrand = (brand) => {
    setSelectedBrand(brand);
    const devices = getDeviceModels(brand);
    setSelectedDevice(devices[0]); // Seleccionar primer dispositivo por defecto
    setOpenDeviceModal(true);
  };

  // Abrir modal de reparaciones cuando selecciona categoría
  const handleSelectCategory = async (category) => {
    setSelectedCategory(category);

    // Intentar cargar partes desde plantillas si existen
    const parts = await fetchPartsForModel(selectedBrand, selectedDevice);
    const partNames = CATEGORY_TO_PART_NAMES[category.id] || [];
    const matched = parts.filter(p => partNames.includes(p.nombre));

    if (matched.length > 0) {
      // Mostrar partes (plantilla) en lugar de reparaciones seed
      setSelectedCategoryRepairs(matched);
    } else {
      const categoryRepairs = getRepairsForCategory(selectedBrand, category.id);
      setSelectedCategoryRepairs(categoryRepairs);
    }

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
          🔧 Reparaciones Profesionales
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Typography variant="subtitle1" sx={{ mb: 3, color: 'text.secondary' }}>
        Selecciona una marca de dispositivo para comenzar
      </Typography>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && (
        <>
          {/* Búsqueda de marca */}
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              placeholder="Buscar marca..."
              value={searchBrand}
              onChange={(e) => setSearchBrand(e.target.value.toLowerCase())}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Box>

          <Grid container spacing={2}>
            {DEVICE_BRANDS.filter(brand => brand.toLowerCase().includes(searchBrand)).map((brand) => {
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
        </>
      )}

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
              const selectedBrandLower = String(selectedBrand || '').toLowerCase();
              const categoryRepairsCount = repairs.filter(r =>
                String(r.brand || '').toLowerCase() === selectedBrandLower &&
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
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}
          {editingRepair ? (
            // FORMULARIO DE EDICIÓN / CREACIÓN
            // FORMULARIO DE DETALLES Y DATOS DEL DISPOSITIVO
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Alert severity="info" variant="outlined">
                📦 <strong>{selectedBrand} {selectedDevice}</strong> — Configurando reparaciones
              </Alert>

              <Box>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                  🔧 Partes a Reparar ({selectedParts.length})
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: '#fbfbfb' }}>
                  {selectedParts.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {selectedParts.map((p, idx) => (
                        <Chip 
                          key={idx} 
                          label={`${p.nombre} - RD$${p.precio}`} 
                          onDelete={() => {
                            setSelectedParts(prev => prev.filter((_, i) => i !== idx));
                          }}
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">No hay partes seleccionadas aún.</Typography>
                  )}
                  <Divider sx={{ my: 1.5 }} />
                  <Typography variant="h6" align="right" color="primary" sx={{ fontWeight: 'bold' }}>
                    Total Sugerido: RD${selectedParts.reduce((acc, p) => acc + p.precio, 0).toLocaleString()}
                  </Typography>
                </Paper>
                <Button 
                  size="small" 
                  onClick={() => setEditingRepair(null)} 
                  sx={{ mt: 1 }}
                  startIcon={<AddIcon />}
                >
                  Agregar más partes/servicios
                </Button>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nombre del Cliente"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    required
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Teléfono"
                    value={formData.customer_phone}
                    onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="IMEI / Serie"
                    value={deviceInfo.imei}
                    onChange={(e) => setDeviceInfo({ ...deviceInfo, imei: e.target.value })}
                    placeholder="Opcional"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Contraseña"
                    value={deviceInfo.passcode}
                    onChange={(e) => setDeviceInfo({ ...deviceInfo, passcode: e.target.value })}
                    placeholder="Patrón o PIN"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Condición del Equipo"
                    value={deviceInfo.condition}
                    onChange={(e) => setDeviceInfo({ ...deviceInfo, condition: e.target.value })}
                    placeholder="Rayones, golpes, mojado, etc."
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Precio Final ACORDADO"
                    value={formData.cost || selectedParts.reduce((acc, p) => acc + p.precio, 0)}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    type="number"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">RD$</InputAdornment>,
                    }}
                    required
                    size="medium"
                    color="primary"
                    focused
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="medium">
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
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Notas Técnicas"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    multiline
                    rows={2}
                    size="small"
                  />
                </Grid>
              </Grid>

              {error && <Alert severity="error">{error}</Alert>}
            </Box>
          ) : (
            // LISTA DE REPARACIONES PRECARGADAS O PLANTILLAS
            <Box>
              {selectedCategoryRepairs.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Si los items son plantillas de partes (tienen `nombre`) mostrar variaciones */}
                  {selectedCategoryRepairs[0]?.nombre ? (
                    selectedCategoryRepairs.map((part) => (
                      <Paper
                        key={part.nombre}
                        sx={{
                          p: 2,
                          cursor: 'default',
                          transition: 'all 0.2s',
                          '&:hover': { boxShadow: 2, backgroundColor: '#f5f5f5' }
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                              {part.nombre}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {part.descripcion}
                            </Typography>
                          </Box>
                          <Chip
                            label={`RD$${part.precio_minimo || '0.00'}`}
                            color="primary"
                            variant="outlined"
                            sx={{ fontWeight: 'bold' }}
                          />
                        </Box>

                        {/* Variaciones si existen */}
                        {part.variaciones && part.variaciones.length > 0 && (
                          <Box sx={{ mt: 2 }}>
                            <FormControl fullWidth size="small">
                              <InputLabel>Variación</InputLabel>
                              <Select
                                value={selectedVariations[part.nombre] || ''}
                                label="Variación"
                                onChange={(e) => handleSelectVariation(part.nombre, e.target.value)}
                              >
                                <MenuItem value=""><em>Base</em></MenuItem>
                                {part.variaciones.map(v => (
                                  <MenuItem key={v.nombre} value={v.nombre}>{v.nombre} — RD${v.precio_minimo} (stock {v.stock})</MenuItem>
                                ))}
                              </Select>
                            </FormControl>

                            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                              <Button
                                variant={selectedParts.find(p => p.nombre.startsWith(part.nombre)) ? "contained" : "outlined"}
                                color={selectedParts.find(p => p.nombre.startsWith(part.nombre)) ? "success" : "primary"}
                                onClick={() => {
                                  const selName = selectedVariations[part.nombre];
                                  const variation = part.variaciones.find(v => v.nombre === selName);
                                  togglePartSelection(part, variation);
                                }}
                              >
                                {selectedParts.find(p => p.nombre.startsWith(part.nombre)) ? "✓ Seleccionado" : "Seleccionar"}
                              </Button>
                            </Box>
                          </Box>
                        )}

                        {!part.variaciones?.length && (
                          <Box sx={{ mt: 2 }}>
                            <Button
                              variant={selectedParts.find(p => p.nombre === part.nombre) ? "contained" : "outlined"}
                              color={selectedParts.find(p => p.nombre === part.nombre) ? "success" : "primary"}
                              onClick={() => togglePartSelection(part, null)}
                            >
                              {selectedParts.find(p => p.nombre === part.nombre) ? "✓ Seleccionado" : "Seleccionar"}
                            </Button>
                          </Box>
                        )}
                      </Paper>
                    ))
                  ) : (
                    // Lista antigua basada en reparaciones seed
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
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip
                                label={`RD$${repair.cost || '0.00'}`}
                                color="primary"
                                variant="outlined"
                                sx={{ fontWeight: 'bold' }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  togglePartSelection({ nombre: repair.problem || 'Reparación', cost: repair.cost }, null);
                                }}
                              />
                              <Button 
                                size="small" 
                                variant="contained"
                                onClick={() => {
                                  togglePartSelection({ nombre: repair.problem || 'Reparación', cost: repair.cost }, null);
                                }}
                              >
                                Seleccionar
                              </Button>
                            </Box>
                          </Box>
                        </Paper>
                      ))}
                    </Box>
                  )}
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
                  const brandName = selectedBrand || '';
                  const deviceName = selectedDevice || '';
                  const categoryName = selectedCategory?.name || 'Reparación';
                  
                  // Crear nuevo objeto para activar formulario
                  setEditingRepair({
                    brand: brandName,
                    device: deviceName,
                    category: selectedCategory?.id || 'other',
                    status: 'pending'
                  });

                  // AGREGAR AUTOMÁTICAMENTE LA CATEGORÍA COMO PARTE SI LA LISTA ESTÁ VACÍA
                  if (selectedParts.length === 0) {
                    setSelectedParts([{
                      nombre: `${categoryName}`,
                      precio: 0,
                      cantidad: 1
                    }]);
                  }

                  setFormData(prev => ({
                    ...prev,
                    customer_name: prev.customer_name || '',
                    status: 'pending'
                  }));
                }}
              >
                ➕ Crear Nueva Reparación
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #eee' }}>
          {editingRepair && (
            <Button
              variant="text"
              startIcon={<ArrowBackIcon />}
              onClick={() => {
                setEditingRepair(null);
                setError('');
              }}
            >
              Volver a Partes
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
              color="success"
              size="large"
              startIcon={<ShoppingCartIcon />}
              disabled={selectedParts.length === 0 || !formData.customer_name}
              onClick={() => {
                const finalPrice = parseFloat(formData.cost) || selectedParts.reduce((acc, p) => acc + p.precio, 0);

                const repairToAdd = {
                  brand: selectedBrand,
                  device: selectedDevice,
                  category: selectedCategory?.id || 'repair',
                  problem: formData.notes || selectedParts.map(p => p.nombre).join(', '),
                  cost: finalPrice,
                  customer_name: formData.customer_name,
                  customer_phone: formData.customer_phone,
                  status: formData.status,
                  partes_reparar: selectedParts,
                  // Campos profesionales alineados con el backend
                  imei: deviceInfo.imei,
                  condicion: deviceInfo.condition,
                  clave: deviceInfo.passcode,
                };

                try {
                  addRepairToCart(repairToAdd);
                  setOpenRepairModal(false);
                  setEditingRepair(null);
                  resetForm();
                  setError('');
                  enqueueSnackbar('Reparación agregada al pedido ✓', { 
                    variant: 'success',
                    action: (key) => (
                      <Button color="inherit" onClick={() => { navigate('/pos'); }}>
                        IR AL POS
                      </Button>
                    )
                  });
                } catch (err) {
                  enqueueSnackbar('Error: ' + err.message, { variant: 'error' });
                }
              }}
            >
              Agregar al Pedido (Carrito)
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Botón Flotante para IR AL POS */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 30,
          right: 30,
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        <Button
          variant="contained"
          color="success"
          sx={{
            borderRadius: '50%',
            width: 60,
            height: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 3,
            fontSize: '1.5rem',
            '&:hover': {
              boxShadow: 6,
              transform: 'scale(1.1)',
            },
          }}
          onClick={() => startTransition(() => navigate('/pos'))}
          title="Ir al POS (Nueva Venta)"
        >
          <ShoppingCartIcon sx={{ fontSize: '1.5rem' }} />
        </Button>
        <Typography variant="caption" sx={{
          textAlign: 'center',
          backgroundColor: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: 1,
          fontSize: '0.7rem',
          whiteSpace: 'nowrap',
        }}>
          Ir a Venta
        </Typography>
      </Box>
    </Container>
  );
};

export default ReparacionesPro;
