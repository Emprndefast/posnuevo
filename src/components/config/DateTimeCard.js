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
  Paper
} from '@mui/material';
import ConfigCard from '../ConfigCard';
import { AccessTime, CalendarToday, Help, Refresh } from '@mui/icons-material';
import { ZONAS_HORARIAS, FORMATOS_FECHA, FORMATOS_HORA } from '../../constants/configConstants';

const DateTimeCard = ({ 
  config, 
  onConfigChange 
}) => {
  const [localConfig, setLocalConfig] = useState(config);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [previewDate, setPreviewDate] = useState(new Date());

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  useEffect(() => {
    const timer = setInterval(() => {
      setPreviewDate(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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

  const handleRefresh = () => {
    setLocalConfig(config);
    setError(null);
  };

  const formatPreviewDate = () => {
    try {
      const date = new Date();
      const timeZone = localConfig.zonaHoraria || 'America/Lima';
      
      const dateStr = date.toLocaleDateString('es-ES', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });

      const timeStr = date.toLocaleTimeString('es-ES', {
        timeZone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: localConfig.formatoHora === '12h'
      });

      return { date: dateStr, time: timeStr };
    } catch (err) {
      return { date: 'Error', time: 'Error' };
    }
  };

  const { date: previewDateStr, time: previewTimeStr } = formatPreviewDate();

  return (
    <ConfigCard
      icon={AccessTime}
      title="Fecha y Hora"
      iconColor="secondary.main"
    >
      <Box sx={{ width: '100%', mt: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Zona Horaria</InputLabel>
              <Select
                name="zonaHoraria"
                value={localConfig.zonaHoraria || 'America/Lima'}
                label="Zona Horaria"
                onChange={handleChange}
                disabled={isSaving}
              >
                {ZONAS_HORARIAS.map(opcion => (
                  <MenuItem key={opcion.value} value={opcion.value}>
                    {opcion.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Formato de Fecha</InputLabel>
              <Select
                name="formatoFecha"
                value={localConfig.formatoFecha || 'dd/mm/yyyy'}
                label="Formato de Fecha"
                onChange={handleChange}
                disabled={isSaving}
              >
                {FORMATOS_FECHA.map(opcion => (
                  <MenuItem key={opcion.value} value={opcion.value}>
                    {opcion.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Formato de Hora</InputLabel>
              <Select
                name="formatoHora"
                value={localConfig.formatoHora || '24h'}
                label="Formato de Hora"
                onChange={handleChange}
                disabled={isSaving}
              >
                {FORMATOS_HORA.map(opcion => (
                  <MenuItem key={opcion.value} value={opcion.value}>
                    {opcion.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <Paper 
              elevation={2}
              sx={{ 
                p: 2, 
                mt: 2,
                bgcolor: 'background.paper',
                borderRadius: 1
              }}
            >
              <Typography variant="subtitle2" gutterBottom>
                Vista previa:
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarToday fontSize="small" color="action" />
                  <Typography variant="body2">
                    {previewDateStr}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTime fontSize="small" color="action" />
                  <Typography variant="body2">
                    {previewTimeStr}
                  </Typography>
                </Box>
              </Box>
            </Paper>
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

export default DateTimeCard; 