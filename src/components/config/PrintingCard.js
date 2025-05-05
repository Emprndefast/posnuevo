import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
  Divider,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Switch
} from '@mui/material';
import ConfigCard from '../ConfigCard';
import { 
  Print, 
  BluetoothConnected, 
  BluetoothDisabled, 
  Refresh,
  Help,
  Delete,
  Check,
  Close
} from '@mui/icons-material';
import { TAMANOS_ETIQUETA, TIPOS_PAPEL, IMPRESORAS } from '../../constants/configConstants';

const PrintingCard = ({ 
  config, 
  onConfigChange,
  onConnectBluetooth,
  bluetoothStatus,
  bluetoothPrinter
}) => {
  const [localConfig, setLocalConfig] = useState(config);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [testPrinting, setTestPrinting] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    onConfirm: null
  });

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const handleChange = async (e) => {
    const { name, value } = e.target;
    
    setLocalConfig(prev => ({
      ...prev,
      [name]: value
    }));

    try {
      setIsSaving(true);
      setError(null);
      await onConfigChange({
        ...localConfig,
        [name]: value
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestPrint = () => {
    setConfirmDialog({
      open: true,
      title: 'Imprimir prueba',
      message: '¿Deseas imprimir una página de prueba?',
      onConfirm: async () => {
        setTestPrinting(true);
        try {
          // Simulación de impresión de prueba
          await new Promise(resolve => setTimeout(resolve, 2000));
          setError(null);
        } catch (err) {
          setError('Error al imprimir la prueba');
        } finally {
          setTestPrinting(false);
        }
      }
    });
  };

  const handleConnectBluetooth = async () => {
    try {
      setError(null);
      await onConnectBluetooth();
    } catch (err) {
      setError('Error al conectar con la impresora Bluetooth');
    }
  };

  const handleCloseDialog = () => {
    setConfirmDialog(prev => ({ ...prev, open: false }));
  };

  const handleConfirmAction = () => {
    if (confirmDialog.onConfirm) {
      confirmDialog.onConfirm();
    }
    handleCloseDialog();
  };

  return (
    <ConfigCard
      icon={Print}
      title="Configuración de Impresión"
      iconColor="success.main"
    >
      <Box sx={{ width: '100%', mt: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Tamaño de Etiqueta</InputLabel>
              <Select
                name="tamanoEtiqueta"
                value={localConfig.tamanoEtiqueta || 'mediano'}
                label="Tamaño de Etiqueta"
                onChange={handleChange}
                disabled={isSaving}
              >
                {TAMANOS_ETIQUETA.map(opcion => (
                  <MenuItem key={opcion.value} value={opcion.value}>
                    {opcion.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Tipo de Papel</InputLabel>
              <Select
                name="tipoPapel"
                value={localConfig.tipoPapel || 'termico'}
                label="Tipo de Papel"
                onChange={handleChange}
                disabled={isSaving}
              >
                {TIPOS_PAPEL.map(opcion => (
                  <MenuItem key={opcion.value} value={opcion.value}>
                    {opcion.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>
          
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Impresora Bluetooth
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2">
                    Estado: {bluetoothStatus === 'conectado' ? 'Conectado' : 
                            bluetoothStatus === 'conectando' ? 'Conectando...' : 
                            bluetoothStatus === 'error' ? 'Error de conexión' : 'Desconectado'}
                  </Typography>
                  {bluetoothPrinter && (
                    <Typography variant="body2" color="text.secondary">
                      Dispositivo: {bluetoothPrinter.name || 'Desconocido'}
                    </Typography>
                  )}
                </Box>
                
                <Tooltip title={bluetoothStatus === 'conectado' ? 'Desconectar' : 'Conectar'}>
                  <IconButton 
                    color={bluetoothStatus === 'conectado' ? 'success' : 'primary'}
                    onClick={handleConnectBluetooth}
                    disabled={bluetoothStatus === 'conectando' || isSaving}
                  >
                    {bluetoothStatus === 'conectado' ? <BluetoothConnected /> : <BluetoothDisabled />}
                  </IconButton>
                </Tooltip>
              </Box>
              
              {bluetoothStatus === 'conectado' && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  Impresora Bluetooth conectada correctamente
                </Alert>
              )}
              
              {bluetoothStatus === 'error' && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  No se pudo conectar a la impresora. Verifica que esté encendida y visible.
                </Alert>
              )}
            </Paper>
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>
          
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Impresoras Configuradas
              </Typography>
              
              <List>
                {IMPRESORAS.map(impresora => (
                  <ListItem key={impresora.value}>
                    <ListItemText 
                      primary={impresora.label}
                      secondary={impresora.value === localConfig.impresora ? 'Predeterminada' : ''}
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={impresora.value === localConfig.impresora}
                        onChange={() => handleChange({
                          target: {
                            name: 'impresora',
                            value: impresora.value
                          }
                        })}
                        disabled={isSaving}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={() => {/* Función para buscar impresoras */}}
                  disabled={isSaving}
                >
                  Buscar Impresoras
                </Button>
                
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={testPrinting ? <CircularProgress size={20} /> : <Print />}
                  onClick={handleTestPrint}
                  disabled={testPrinting || isSaving}
                >
                  {testPrinting ? 'Imprimiendo...' : 'Imprimir Prueba'}
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Box>

      <Dialog
        open={confirmDialog.open}
        onClose={handleCloseDialog}
        aria-labelledby="confirm-dialog-title"
      >
        <DialogTitle id="confirm-dialog-title">
          {confirmDialog.title}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {confirmDialog.message}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleConfirmAction} color="primary" variant="contained" autoFocus>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </ConfigCard>
  );
};

export default PrintingCard; 