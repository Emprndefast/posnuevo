import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Alert,
  CircularProgress,
  Tooltip,
  IconButton,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  Divider
} from '@mui/material';
import ConfigCard from '../ConfigCard';
import { 
  Settings, 
  Refresh, 
  Help, 
  Delete, 
  Check, 
  Close,
  Warning,
  Storage,
  Security,
  Speed
} from '@mui/icons-material';
import { 
  FRECUENCIAS_RESPALDO, 
  FORMATOS_IMPRESION,
  CONFIG_DEFAULT 
} from '../../constants/configConstants';

const AdvancedCard = ({ 
  config, 
  onConfigChange,
  onExportConfig,
  onImportConfig,
  onRestoreDefault
}) => {
  const [localConfig, setLocalConfig] = useState(config);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
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

  const handleExport = async () => {
    try {
      setError(null);
      await onExportConfig();
    } catch (err) {
      setError('Error al exportar la configuración');
    }
  };

  const handleImport = async (event) => {
    try {
      setError(null);
      const file = event.target.files[0];
      if (file) {
        await onImportConfig(file);
      }
    } catch (err) {
      setError('Error al importar la configuración');
    }
  };

  const handleRestoreDefault = () => {
    setConfirmDialog({
      open: true,
      title: 'Restaurar configuración predeterminada',
      message: '¿Estás seguro de que deseas restaurar la configuración predeterminada? Esta acción no se puede deshacer.',
      onConfirm: async () => {
        try {
          setError(null);
          await onRestoreDefault();
        } catch (err) {
          setError('Error al restaurar la configuración predeterminada');
        }
      }
    });
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
      icon={Settings}
      title="Configuración Avanzada"
      iconColor="warning.main"
    >
      <Box sx={{ width: '100%', mt: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Respaldo Automático
              </Typography>
              
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Frecuencia de Respaldo</InputLabel>
                <Select
                  name="frecuenciaRespaldo"
                  value={localConfig.frecuenciaRespaldo || 'diario'}
                  label="Frecuencia de Respaldo"
                  onChange={handleChange}
                  disabled={isSaving}
                >
                  {FRECUENCIAS_RESPALDO.map(opcion => (
                    <MenuItem key={opcion.value} value={opcion.value}>
                      {opcion.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Storage fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  Los respaldos se guardarán automáticamente según la frecuencia seleccionada
                </Typography>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Formato de Impresión
              </Typography>
              
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Formato</InputLabel>
                <Select
                  name="formatoImpresion"
                  value={localConfig.formatoImpresion || '80mm'}
                  label="Formato"
                  onChange={handleChange}
                  disabled={isSaving}
                >
                  {FORMATOS_IMPRESION.map(opcion => (
                    <MenuItem key={opcion.value} value={opcion.value}>
                      {opcion.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Speed fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  Selecciona el formato de papel para tus impresiones
                </Typography>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Gestión de Configuración
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemText 
                    primary="Exportar Configuración"
                    secondary="Guarda tu configuración actual en un archivo"
                  />
                  <ListItemSecondaryAction>
                    <Button
                      variant="outlined"
                      startIcon={<Storage />}
                      onClick={handleExport}
                      disabled={isSaving}
                    >
                      Exportar
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
                
                <Divider />
                
                <ListItem>
                  <ListItemText 
                    primary="Importar Configuración"
                    secondary="Carga una configuración desde un archivo"
                  />
                  <ListItemSecondaryAction>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<Storage />}
                      disabled={isSaving}
                    >
                      Importar
                      <input
                        type="file"
                        hidden
                        accept=".json"
                        onChange={handleImport}
                      />
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
                
                <Divider />
                
                <ListItem>
                  <ListItemText 
                    primary="Restaurar Configuración Predeterminada"
                    secondary="Vuelve a la configuración inicial del sistema"
                  />
                  <ListItemSecondaryAction>
                    <Button
                      variant="outlined"
                      color="warning"
                      startIcon={<Refresh />}
                      onClick={handleRestoreDefault}
                      disabled={isSaving}
                    >
                      Restaurar
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
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
          <DialogContentText>
            {confirmDialog.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirmAction} 
            color="warning" 
            variant="contained" 
            autoFocus
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </ConfigCard>
  );
};

export default AdvancedCard; 