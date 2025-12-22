import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  Grid,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  IconButton,
  Divider
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import RepairDeviceSelector from '../components/repairs/RepairDeviceSelector';
import api from '../api/api';

const ReparacionesNuevo = () => {
  const navigate = useNavigate();
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [selectedParts, setSelectedParts] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [problemDescription, setProblemDescription] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleDeviceSelect = (device) => {
    setSelectedDevice(device);
  };

  const handlePartSelect = (part) => {
    // Si la parte ya está seleccionada, la removemos
    const index = selectedParts.findIndex(p => p.nombre === part.nombre);
    if (index >= 0) {
      setSelectedParts(selectedParts.filter((_, i) => i !== index));
    } else {
      // Agregar la parte con precio por defecto
      const price = part.precio_minimo > 0 ? part.precio_minimo : (part.precio_maximo > 0 ? part.precio_maximo : 0);
      setSelectedParts([
        ...selectedParts,
        {
          nombre: part.nombre,
          precio: price,
          cantidad: 1
        }
      ]);
    }
  };

  const handleRemovePart = (partName) => {
    setSelectedParts(selectedParts.filter(p => p.nombre !== partName));
  };

  const handleUpdatePartPrice = (partName, newPrice) => {
    setSelectedParts(selectedParts.map(p =>
      p.nombre === partName ? { ...p, precio: newPrice } : p
    ));
  };

  const calculateTotal = () => {
    return selectedParts.reduce((sum, part) => sum + (part.precio * (part.cantidad || 1)), 0);
  };

  const handleCreateRepair = async () => {
    if (!selectedDevice) {
      setError('Por favor selecciona un dispositivo');
      return;
    }

    if (selectedParts.length === 0) {
      setError('Por favor selecciona al menos una parte a reparar');
      return;
    }

    if (!customerName.trim()) {
      setError('Por favor ingresa el nombre del cliente');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const repairData = {
        cliente: customerName,
        marca: selectedDevice.marca,
        tipo_dispositivo: selectedDevice.tipo_dispositivo,
        modelo: selectedDevice.modelo,
        partes_reparar: selectedParts,
        descripcion_problema: problemDescription,
        precio: calculateTotal(),
        estado: 'pendiente',
        fecha_entrega_estimada: estimatedDelivery || null,
        notas: notes
      };

      const response = await api.post('/repairs', repairData);

      if (response.data.success) {
        setSuccess('Reparación creada exitosamente');
        setTimeout(() => {
          navigate('/reparaciones');
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear la reparación');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => startTransition(() => navigate('/reparaciones'))} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Nueva Reparación
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Columna izquierda: Selector de dispositivos y partes */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Seleccionar Dispositivo y Partes
              </Typography>
              <RepairDeviceSelector
                onDeviceSelect={handleDeviceSelect}
                onPartSelect={handlePartSelect}
                selectedDevice={selectedDevice}
                selectedParts={selectedParts}
              />
            </Paper>
          </Grid>

          {/* Columna derecha: Resumen y datos del cliente */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
              <Typography variant="h6" gutterBottom>
                Información de la Reparación
              </Typography>

              <Box sx={{ mb: 3 }}>
                {selectedDevice && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Dispositivo para reparar
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {selectedDevice.marca} {selectedDevice.modelo}
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => {
                        setSelectedDevice(null);
                        setSelectedParts([]);
                      }}
                      sx={{ mt: 1 }}
                    >
                      Cambiar
                    </Button>
                  </Box>
                )}

                <Divider sx={{ my: 2 }} />

                <TextField
                  fullWidth
                  label="Nombre del Cliente"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  margin="normal"
                  required
                />

                <TextField
                  fullWidth
                  label="Descripción del Problema"
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  margin="normal"
                  multiline
                  rows={3}
                />

                <TextField
                  fullWidth
                  label="Fecha de Entrega Estimada"
                  type="date"
                  value={estimatedDelivery}
                  onChange={(e) => setEstimatedDelivery(e.target.value)}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />

                <TextField
                  fullWidth
                  label="Notas"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  margin="normal"
                  multiline
                  rows={2}
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" gutterBottom>
                Partes Seleccionadas ({selectedParts.length})
              </Typography>

              {selectedParts.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No hay partes seleccionadas
                </Typography>
              ) : (
                <Box sx={{ mb: 2 }}>
                  {selectedParts.map((part, index) => (
                    <Card key={index} sx={{ mb: 1 }}>
                      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight="bold">
                              {part.nombre}
                            </Typography>
                            <TextField
                              size="small"
                              type="number"
                              label="Precio"
                              value={part.precio}
                              onChange={(e) => handleUpdatePartPrice(part.nombre, parseFloat(e.target.value) || 0)}
                              InputProps={{
                                startAdornment: 'RD$'
                              }}
                              sx={{ mt: 1, width: '100%' }}
                            />
                          </Box>
                          <IconButton
                            size="small"
                            onClick={() => handleRemovePart(part.nombre)}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h6" color="primary" fontWeight="bold">
                  RD${calculateTotal().toFixed(2)}
                </Typography>
              </Box>

              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<SaveIcon />}
                onClick={handleCreateRepair}
                disabled={loading || !selectedDevice || selectedParts.length === 0 || !customerName.trim()}
              >
                {loading ? 'Guardando...' : 'Crear Reparación'}
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default ReparacionesNuevo;

