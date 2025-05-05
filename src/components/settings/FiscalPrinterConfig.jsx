import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress
} from '@mui/material';
import { fiscalPrinterService } from '../../services/fiscalPrinterService';
import { useSnackbar } from '../../context/SnackbarContext';

const FiscalPrinterConfig = () => {
  const [printerConfig, setPrinterConfig] = useState({
    id: '',
    model: '',
    port: '',
    brand: '',
    status: 'inactive'
  });
  const [loading, setLoading] = useState(false);
  const { showSnackbar } = useSnackbar();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPrinterConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await fiscalPrinterService.configurePrinter(printerConfig);
      showSnackbar('Configuración guardada exitosamente', 'success');
    } catch (error) {
      showSnackbar('Error al guardar configuración', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTestPrinter = async () => {
    try {
      setLoading(true);
      const status = await fiscalPrinterService.getPrinterStatus(printerConfig.id);
      showSnackbar(`Estado de impresora: ${status.status}`, 'info');
    } catch (error) {
      showSnackbar('Error al probar impresora', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Configuración de Impresora Fiscal
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Marca</InputLabel>
              <Select
                name="brand"
                value={printerConfig.brand}
                onChange={handleInputChange}
                label="Marca"
              >
                <MenuItem value="Hasar">Hasar</MenuItem>
                <MenuItem value="Epson">Epson</MenuItem>
                <MenuItem value="Bematech">Bematech</MenuItem>
                <MenuItem value="Other">Otra</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Modelo</InputLabel>
              <Select
                name="model"
                value={printerConfig.model}
                onChange={handleInputChange}
                label="Modelo"
              >
                <MenuItem value="715">715</MenuItem>
                <MenuItem value="715-C">715-C</MenuItem>
                <MenuItem value="320">320</MenuItem>
                <MenuItem value="Other">Otro</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="ID de Impresora"
              name="id"
              value={printerConfig.id}
              onChange={handleInputChange}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Puerto"
              name="port"
              value={printerConfig.port}
              onChange={handleInputChange}
              placeholder="Ej: COM1, USB, etc."
            />
          </Grid>

          <Grid item xs={12}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Asegúrese de que la impresora esté conectada y encendida antes de guardar la configuración.
            </Alert>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                Guardar Configuración
              </Button>
              <Button
                variant="outlined"
                onClick={handleTestPrinter}
                disabled={loading}
              >
                Probar Impresora
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default FiscalPrinterConfig; 