import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Alert,
  Snackbar
} from '@mui/material';
import printerService from '../../services/printerService';

const PrinterSettings = () => {
  const [config, setConfig] = useState({
    printerType: '',
    model: '',
    connection: '',
    ipAddress: '',
    port: '',
    vendorId: '',
    deviceName: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const savedConfig = await printerService.getPrinterConfig('current-user');
      if (savedConfig) {
        setConfig(savedConfig);
      }
    } catch (error) {
      setError('Error al cargar la configuración');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTestConnection = async () => {
    setLoading(true);
    setError('');
    try {
      switch (config.connection) {
        case 'usb':
          await printerService.printViaUSB('Test de conexión', config);
          break;
        case 'network':
          await printerService.printViaNetwork('Test de conexión', config);
          break;
        case 'bluetooth':
          await printerService.printViaBluetooth('Test de conexión', config);
          break;
        default:
          throw new Error('Tipo de conexión no válido');
      }
      setSuccess('Conexión exitosa');
    } catch (error) {
      setError('Error al probar la conexión: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      await printerService.savePrinterConfig('current-user', config);
      setSuccess('Configuración guardada exitosamente');
    } catch (error) {
      setError('Error al guardar la configuración');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Configuración de Impresora
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Tipo de Impresora</InputLabel>
            <Select
              name="printerType"
              value={config.printerType}
              onChange={handleChange}
              label="Tipo de Impresora"
            >
              <MenuItem value="thermal">Térmica</MenuItem>
              <MenuItem value="laser">Láser</MenuItem>
              <MenuItem value="inkjet">Inyección de Tinta</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            name="model"
            label="Modelo"
            value={config.model}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Tipo de Conexión</InputLabel>
            <Select
              name="connection"
              value={config.connection}
              onChange={handleChange}
              label="Tipo de Conexión"
            >
              <MenuItem value="usb">USB</MenuItem>
              <MenuItem value="network">Red</MenuItem>
              <MenuItem value="bluetooth">Bluetooth</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {config.connection === 'network' && (
          <>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="ipAddress"
                label="Dirección IP"
                value={config.ipAddress}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="port"
                label="Puerto"
                value={config.port}
                onChange={handleChange}
              />
            </Grid>
          </>
        )}

        {config.connection === 'usb' && (
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              name="vendorId"
              label="ID del Fabricante"
              value={config.vendorId}
              onChange={handleChange}
            />
          </Grid>
        )}

        {config.connection === 'bluetooth' && (
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              name="deviceName"
              label="Nombre del Dispositivo"
              value={config.deviceName}
              onChange={handleChange}
            />
          </Grid>
        )}
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          onClick={handleTestConnection}
          disabled={loading}
        >
          Probar Conexión
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={loading}
        >
          Guardar Configuración
        </Button>
      </Box>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
      >
        <Alert severity="error">{error}</Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess('')}
      >
        <Alert severity="success">{success}</Alert>
      </Snackbar>
    </Box>
  );
};

export default PrinterSettings; 