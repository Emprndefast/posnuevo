import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Typography,
  Divider,
  Alert,
  CircularProgress,
  Tooltip,
  IconButton
} from '@mui/material';
import ConfigCard from '../ConfigCard';
import { Settings, Help, Refresh } from '@mui/icons-material';
import { TEMAS, IDIOMAS, MONEDAS } from '../../constants/configConstants';

const GeneralPreferencesCard = ({ 
  config, 
  onConfigChange 
}) => {
  const [localConfig, setLocalConfig] = useState(config);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const handleChange = async (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setLocalConfig(prev => ({
      ...prev,
      [name]: newValue
    }));

    try {
      setIsSaving(true);
      setError(null);
      await onConfigChange({
        ...localConfig,
        [name]: newValue
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefresh = () => {
    setLocalConfig(config);
    setError(null);
  };

  return (
    <ConfigCard
      icon={Settings}
      title="Preferencias Generales"
      iconColor="primary.main"
    >
      <Box sx={{ width: '100%', mt: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Tema</InputLabel>
              <Select
                name="tema"
                value={localConfig.tema || 'claro'}
                label="Tema"
                onChange={handleChange}
                disabled={isSaving}
              >
                {TEMAS.map(opcion => (
                  <MenuItem key={opcion.value} value={opcion.value}>
                    {opcion.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Idioma</InputLabel>
              <Select
                name="idioma"
                value={localConfig.idioma || 'es'}
                label="Idioma"
                onChange={handleChange}
                disabled={isSaving}
              >
                {IDIOMAS.map(opcion => (
                  <MenuItem key={opcion.value} value={opcion.value}>
                    {opcion.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Moneda</InputLabel>
              <Select
                name="moneda"
                value={localConfig.moneda || 'PEN'}
                label="Moneda"
                onChange={handleChange}
                disabled={isSaving}
              >
                {MONEDAS.map(opcion => (
                  <MenuItem key={opcion.value} value={opcion.value}>
                    {opcion.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={localConfig.notificaciones !== false}
                    onChange={handleChange}
                    name="notificaciones"
                    disabled={isSaving}
                  />
                }
                label="Notificaciones"
              />
              <Tooltip title="Recibir alertas y notificaciones del sistema">
                <IconButton size="small">
                  <Help fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={localConfig.respaldoAutomatico !== false}
                    onChange={handleChange}
                    name="respaldoAutomatico"
                    disabled={isSaving}
                  />
                }
                label="Respaldo Automático"
              />
              <Tooltip title="Realizar copias de seguridad automáticas">
                <IconButton size="small">
                  <Help fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Tooltip title="Restaurar valores">
            <IconButton 
              onClick={handleRefresh}
              disabled={isSaving}
              color="primary"
            >
              <Refresh />
            </IconButton>
          </Tooltip>
          {isSaving && (
            <CircularProgress size={24} />
          )}
        </Box>
      </Box>
    </ConfigCard>
  );
};

export default GeneralPreferencesCard; 