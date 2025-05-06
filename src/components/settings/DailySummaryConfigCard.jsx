import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  TextField,
  Alert,
  Stack
} from '@mui/material';

// Simulación de consulta de configuración y canales disponibles
const fetchUserNotificationConfig = async (userId) => {
  // Aquí deberías consultar al backend
  return {
    enabled: false,
    hour: '21:00',
    channel: '', // 'whatsapp', 'telegram', 'both'
    hasWhatsapp: false,
    hasTelegram: false
  };
};

const saveUserNotificationConfig = async (userId, config) => {
  // Aquí deberías guardar en el backend
  return true;
};

const DailySummaryConfigCard = ({ user }) => {
  const [config, setConfig] = useState({ enabled: false, hour: '21:00', channel: '', hasWhatsapp: false, hasTelegram: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user?.uid) {
      fetchUserNotificationConfig(user.uid).then(cfg => {
        setConfig(cfg);
        setLoading(false);
      });
    }
  }, [user]);

  const handleChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    setError('');
    setSuccess('');
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    if (!config.hasWhatsapp && !config.hasTelegram) {
      setError('Debes configurar WhatsApp o Telegram antes de activar el resumen diario.');
      setSaving(false);
      return;
    }
    if (!config.channel) {
      setError('Selecciona al menos un canal para recibir el resumen.');
      setSaving(false);
      return;
    }
    await saveUserNotificationConfig(user.uid, config);
    setSuccess('¡Configuración guardada!');
    setSaving(false);
  };

  if (loading) return <Card><CardContent><Typography>Cargando configuración...</Typography></CardContent></Card>;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Resumen Diario Automático
        </Typography>
        <FormControlLabel
          control={<Switch checked={config.enabled} onChange={e => handleChange('enabled', e.target.checked)} />}
          label="Activar envío automático"
        />
        <Stack spacing={2} sx={{ mt: 2 }}>
          <TextField
            label="Hora de envío"
            type="time"
            value={config.hour}
            onChange={e => handleChange('hour', e.target.value)}
            disabled={!config.enabled}
            InputLabelProps={{ shrink: true }}
            inputProps={{ step: 300 }}
          />
          <FormControl fullWidth disabled={!config.enabled}>
            <InputLabel id="canal-label">Canal</InputLabel>
            <Select
              labelId="canal-label"
              value={config.channel}
              label="Canal"
              onChange={e => handleChange('channel', e.target.value)}
            >
              {config.hasWhatsapp && <MenuItem value="whatsapp">WhatsApp</MenuItem>}
              {config.hasTelegram && <MenuItem value="telegram">Telegram</MenuItem>}
              {config.hasWhatsapp && config.hasTelegram && <MenuItem value="both">Ambos</MenuItem>}
            </Select>
          </FormControl>
          {(!config.hasWhatsapp || !config.hasTelegram) && (
            <Alert severity="warning">
              Debes configurar {(!config.hasWhatsapp && !config.hasTelegram) ? 'WhatsApp o Telegram' : (!config.hasWhatsapp ? 'WhatsApp' : 'Telegram')} para activar esta función.
              <Button variant="outlined" size="small" sx={{ ml: 2 }} href="/configuracion">Configurar</Button>
            </Alert>
          )}
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={saving || !config.enabled}
          >
            Guardar configuración
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default DailySummaryConfigCard; 