import React, { useState, useEffect } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  CircularProgress,
  Alert,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Edit as EditIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import api from '../../api/api';

const RepairDeviceSelector = ({ onDeviceSelect, onPartSelect, selectedDevice, selectedParts = [] }) => {
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [selectedDeviceType, setSelectedDeviceType] = useState('');
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [priceDialogOpen, setPriceDialogOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState(null);
  const [priceData, setPriceData] = useState({
    precio_minimo: '',
    precio_maximo: '',
    stock: ''
  });

  // Cargar marcas al iniciar
  useEffect(() => {
    loadBrands();
  }, []);

  // Cargar tipos cuando se selecciona marca
  useEffect(() => {
    if (selectedBrand) {
      loadDeviceTypes(selectedBrand);
    } else {
      setDeviceTypes([]);
      setModels([]);
    }
  }, [selectedBrand]);

  // Cargar modelos cuando se selecciona tipo
  useEffect(() => {
    if (selectedBrand && selectedDeviceType) {
      loadModels(selectedBrand, selectedDeviceType);
    } else {
      setModels([]);
      setParts([]);
    }
  }, [selectedBrand, selectedDeviceType]);

  // Cargar partes cuando se selecciona modelo
  useEffect(() => {
    if (selectedModel) {
      loadParts(selectedBrand, selectedDeviceType, selectedModel.modelo);
    } else {
      setParts([]);
    }
  }, [selectedModel]);

  const loadBrands = async () => {
    try {
      setLoading(true);
      const response = await api.get('/repair-templates/brands');
      if (response.data.success) {
        setBrands(response.data.data);
        // Si hay una marca en el dispositivo seleccionado, seleccionarla
        if (selectedDevice?.marca) {
          setSelectedBrand(selectedDevice.marca);
        }
      }
    } catch (err) {
      setError('Error al cargar marcas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadDeviceTypes = async (marca) => {
    try {
      setLoading(true);
      const response = await api.get(`/repair-templates/brands/${marca}/types`);
      if (response.data.success) {
        setDeviceTypes(response.data.data);
        if (selectedDevice?.tipo_dispositivo) {
          setSelectedDeviceType(selectedDevice.tipo_dispositivo);
        }
      }
    } catch (err) {
      setError('Error al cargar tipos de dispositivos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadModels = async (marca, tipo) => {
    try {
      setLoading(true);
      const response = await api.get(`/repair-templates/brands/${marca}/types/${tipo}/models`);
      if (response.data.success) {
        setModels(response.data.data);
        if (selectedDevice?.modelo) {
          const model = response.data.data.find(m => m.modelo === selectedDevice.modelo);
          if (model) {
            setSelectedModel(model);
          }
        }
      }
    } catch (err) {
      setError('Error al cargar modelos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadParts = async (marca, tipo, modelo) => {
    try {
      setLoading(true);
      const response = await api.get(`/repair-templates/brands/${marca}/types/${tipo}/models/${modelo}/parts`);
      if (response.data.success) {
        setParts(response.data.data.partes || []);
        // Notificar selección de dispositivo
        if (onDeviceSelect) {
          onDeviceSelect({
            marca,
            tipo_dispositivo: tipo,
            modelo
          });
        }
      }
    } catch (err) {
      setError('Error al cargar partes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPriceDialog = (part) => {
    setSelectedPart(part);
    setPriceData({
      precio_minimo: part.precio_minimo || '',
      precio_maximo: part.precio_maximo || part.precio_minimo || '',
      stock: part.stock || ''
    });
    setPriceDialogOpen(true);
  };

  const handleSavePrice = async () => {
    if (!selectedPart || !selectedModel) return;

    try {
      setLoading(true);
      const response = await api.put(
        `/repair-templates/brands/${selectedBrand}/types/${selectedDeviceType}/models/${selectedModel.modelo}/parts/${selectedPart.nombre}`,
        {
          precio_minimo: parseFloat(priceData.precio_minimo) || 0,
          precio_maximo: parseFloat(priceData.precio_maximo) || parseFloat(priceData.precio_minimo) || 0,
          stock: parseInt(priceData.stock) || 0
        }
      );

      if (response.data.success) {
        // Recargar partes
        await loadParts(selectedBrand, selectedDeviceType, selectedModel.modelo);
        setPriceDialogOpen(false);
      }
    } catch (err) {
      setError('Error al guardar precio');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePartSelect = (part) => {
    if (onPartSelect) {
      onPartSelect(part);
    }
  };

  const isPartSelected = (partName) => {
    return selectedParts.some(p => p.nombre === partName);
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Tabs de Marcas */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2, overflowX: 'auto' }}>
        <Tabs
          value={selectedBrand}
          onChange={(e, newValue) => {
            setSelectedBrand(newValue);
            setSelectedDeviceType('');
            setSelectedModel(null);
            setModels([]);
            setParts([]);
          }}
          variant="scrollable"
          scrollButtons="auto"
        >
          {brands.map((brand) => (
            <Tab key={brand} label={brand} value={brand} />
          ))}
        </Tabs>
      </Box>

      {/* Lista de Tipos de Dispositivos */}
      {selectedBrand && deviceTypes.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Tipo de Dispositivo</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {deviceTypes.map((type) => (
              <Chip
                key={type}
                label={type}
                onClick={() => {
                  setSelectedDeviceType(type);
                  setSelectedModel(null);
                  setParts([]);
                }}
                color={selectedDeviceType === type ? 'primary' : 'default'}
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Lista de Modelos */}
      {selectedBrand && selectedDeviceType && models.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Modelos</Typography>
          <Grid container spacing={1}>
            {models.map((model) => (
              <Grid item xs={12} sm={6} md={4} key={model._id || model.modelo}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    border: selectedModel?.modelo === model.modelo ? 2 : 1,
                    borderColor: selectedModel?.modelo === model.modelo ? 'primary.main' : 'divider',
                    '&:hover': { borderColor: 'primary.main' }
                  }}
                  onClick={() => setSelectedModel(model)}
                >
                  <CardContent>
                    <Typography variant="body2">{model.modelo}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Lista de Partes */}
      {selectedModel && parts.length > 0 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Partes disponibles: {selectedModel.modelo}
            </Typography>
          </Box>
          <Grid container spacing={2}>
            {parts.map((part) => (
              <Grid item xs={12} sm={6} md={4} key={part.nombre}>
                <Card
                  sx={{
                    border: isPartSelected(part.nombre) ? 2 : 1,
                    borderColor: isPartSelected(part.nombre) ? 'primary.main' : 'divider',
                    cursor: 'pointer',
                    '&:hover': { borderColor: 'primary.main' }
                  }}
                  onClick={() => handlePartSelect(part)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {part.nombre}
                      </Typography>
                      {isPartSelected(part.nombre) && (
                        <CheckIcon color="primary" />
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {part.precio_minimo > 0 || part.precio_maximo > 0
                        ? `RD$${part.precio_minimo.toFixed(2)} - RD$${part.precio_maximo.toFixed(2)}`
                        : 'RD$0.00 - RD$0.00'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {part.stock} en stock
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenPriceDialog(part);
                        }}
                        color="primary"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Dialog para editar precios */}
      <Dialog open={priceDialogOpen} onClose={() => setPriceDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Precios: {selectedPart?.nombre}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Precio Mínimo"
              type="number"
              value={priceData.precio_minimo}
              onChange={(e) => setPriceData({ ...priceData, precio_minimo: e.target.value })}
              InputProps={{
                startAdornment: <InputAdornment position="start">RD$</InputAdornment>
              }}
              fullWidth
            />
            <TextField
              label="Precio Máximo"
              type="number"
              value={priceData.precio_maximo}
              onChange={(e) => setPriceData({ ...priceData, precio_maximo: e.target.value })}
              InputProps={{
                startAdornment: <InputAdornment position="start">RD$</InputAdornment>
              }}
              fullWidth
            />
            <TextField
              label="Stock"
              type="number"
              value={priceData.stock}
              onChange={(e) => setPriceData({ ...priceData, stock: e.target.value })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPriceDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleSavePrice} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
};

export default RepairDeviceSelector;

