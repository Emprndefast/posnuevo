import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  Paper,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import {
  Print as PrintIcon,
  Help as HelpIcon,
  Check as CheckIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { printerService } from '../../services/printerService';

const PRINTER_TYPES = [
  { value: 'thermal', label: 'Impresora Térmica' },
  { value: 'dot_matrix', label: 'Impresora Matricial' },
  { value: 'inkjet', label: 'Impresora de Inyección' }
];

const COMMON_MODELS = [
  { value: 'epson_tm20', label: 'Epson TM-20' },
  { value: 'epson_tm88', label: 'Epson TM-88' },
  { value: 'star_tsp100', label: 'Star TSP100' },
  { value: 'custom_q3', label: 'Custom Q3' },
  { value: 'other', label: 'Otro modelo' }
];

export default function StepPrinterSetup({ data = {}, onNext, onBack }) {
  const [form, setForm] = useState({
    printerType: data?.printerType || 'thermal',
    model: data?.model || '',
    connection: data?.connection || 'usb',
    ipAddress: data?.ipAddress || '',
    port: data?.port || '9100',
    paperWidth: data?.paperWidth || '80',
    testMode: data?.testMode || true,
    autocut: data?.autocut || true,
    customName: data?.customName || ''
  });

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [searching, setSearching] = useState(false);
  const [availablePrinters, setAvailablePrinters] = useState({ usb: [], network: [] });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value !== undefined ? value : checked
    }));
  };

  const searchPrinters = async () => {
    setSearching(true);
    setError(null);
    try {
      const printers = await printerService.searchPrinters();
      setAvailablePrinters(printers);
    } catch (error) {
      setError('Error al buscar impresoras: ' + error.message);
      console.error('Error buscando impresoras:', error);
    } finally {
      setSearching(false);
    }
  };

  const testPrinter = async () => {
    setTesting(true);
    setError(null);
    try {
      await printerService.configurePrinter(form);
      await printerService.testPrint();
      setTestResult({ success: true, message: 'Impresora configurada y probada correctamente' });
    } catch (error) {
      setTestResult({ success: false, message: error.message });
      console.error('Error al probar impresora:', error);
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    searchPrinters();
  }, []);

  const renderPrinterList = (printers, type) => (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        {type === 'usb' ? 'Impresoras USB' : 'Impresoras de Red'}
      </Typography>
      <Paper variant="outlined" sx={{ p: 2 }}>
        {printers.length > 0 ? (
          printers.map((printer, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                py: 1,
                borderBottom: index < printers.length - 1 ? '1px solid' : 'none',
                borderColor: 'divider',
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: 'action.hover'
                }
              }}
              onClick={() => {
                if (type === 'usb') {
                  setForm(prev => ({
                    ...prev,
                    connection: 'usb',
                    port: printer.path
                  }));
                } else {
                  setForm(prev => ({
                    ...prev,
                    connection: 'network',
                    ipAddress: printer.ip,
                    port: printer.port.toString()
                  }));
                }
              }}
            >
              <Box>
                <Typography variant="body2">{printer.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {type === 'usb' ? printer.path : `${printer.ip}:${printer.port}`}
                </Typography>
              </Box>
              {((type === 'usb' && form.port === printer.path) ||
                (type === 'network' && form.ipAddress === printer.ip)) && (
                <CheckIcon color="success" />
              )}
            </Box>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary" align="center">
            No se encontraron impresoras {type === 'usb' ? 'USB' : 'de red'}
          </Typography>
        )}
      </Paper>
    </Box>
  );

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Configuración de Impresora
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Configura tu impresora para tickets y documentos
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mt: 3 }}>
        <TextField
          select
          fullWidth
          label="Tipo de Impresora"
          name="printerType"
          value={form.printerType}
          onChange={handleChange}
          margin="normal"
        >
          {PRINTER_TYPES.map(option => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          fullWidth
          label="Modelo"
          name="model"
          value={form.model}
          onChange={handleChange}
          margin="normal"
        >
          {COMMON_MODELS.map(option => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        {form.model === 'other' && (
          <TextField
            fullWidth
            label="Nombre personalizado"
            name="customName"
            value={form.customName}
            onChange={handleChange}
            margin="normal"
          />
        )}

        <TextField
          select
          fullWidth
          label="Tipo de conexión"
          name="connection"
          value={form.connection}
          onChange={handleChange}
          margin="normal"
        >
          <MenuItem value="usb">USB</MenuItem>
          <MenuItem value="network">Red</MenuItem>
          <MenuItem value="bluetooth">Bluetooth</MenuItem>
        </TextField>

        {form.connection === 'network' && (
          <>
            <TextField
              fullWidth
              label="Dirección IP"
              name="ipAddress"
              value={form.ipAddress}
              onChange={handleChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Puerto"
              name="port"
              value={form.port}
              onChange={handleChange}
              margin="normal"
            />
          </>
        )}

        <TextField
          select
          fullWidth
          label="Ancho del papel"
          name="paperWidth"
          value={form.paperWidth}
          onChange={handleChange}
          margin="normal"
        >
          <MenuItem value="58">58mm</MenuItem>
          <MenuItem value="80">80mm</MenuItem>
        </TextField>

        <Box sx={{ mt: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={form.autocut}
                onChange={handleChange}
                name="autocut"
              />
            }
            label="Corte automático"
          />
        </Box>

        <Box sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="subtitle1">
              Impresoras detectadas
            </Typography>
            <Button
              startIcon={<RefreshIcon />}
              onClick={searchPrinters}
              disabled={searching}
              variant="outlined"
              size="small"
            >
              Actualizar
            </Button>
          </Box>

          {searching ? (
            <Box display="flex" alignItems="center" justifyContent="center" p={3}>
              <CircularProgress size={24} sx={{ mr: 2 }} />
              <Typography>Buscando impresoras...</Typography>
            </Box>
          ) : (
            <>
              {renderPrinterList(availablePrinters.usb, 'usb')}
              {renderPrinterList(availablePrinters.network, 'network')}
            </>
          )}
        </Box>

        {testResult && (
          <Alert 
            severity={testResult.success ? "success" : "error"}
            sx={{ mt: 2 }}
            icon={testResult.success ? <CheckIcon /> : <ErrorIcon />}
          >
            {testResult.message}
          </Alert>
        )}

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Button onClick={onBack} variant="outlined">
            Atrás
          </Button>
          <Box>
            <Button
              variant="outlined"
              onClick={testPrinter}
              disabled={testing || !form.connection || (!form.port && !form.ipAddress)}
              startIcon={testing ? <CircularProgress size={20} /> : <PrintIcon />}
              sx={{ mr: 1 }}
            >
              Probar Impresora
            </Button>
            <Button
              variant="contained"
              onClick={() => onNext(form)}
              disabled={testing || !testResult?.success}
            >
              Siguiente
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
} 