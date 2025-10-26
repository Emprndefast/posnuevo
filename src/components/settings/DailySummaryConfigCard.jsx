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
  Stack,
  Dialog
} from '@mui/material';
import WhatsAppConfigModal from './modals/WhatsAppConfigModal';
import TelegramConfigModal from './modals/TelegramConfigModal';
import { db } from '../../firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContextMongo';

// Consulta real de configuración y canales disponibles
const fetchUserNotificationConfig = async (userId) => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  let hasWhatsapp = false;
  let hasTelegram = false;
  let whatsapp = {};
  let telegram = {};
  let config = {
    enabled: false,
    hour: '21:00',
    channel: '',
    hasWhatsapp: false,
    hasTelegram: false
  };
  if (userSnap.exists()) {
    whatsapp = userSnap.data().whatsapp || {};
    telegram = userSnap.data().telegram || {};
    hasWhatsapp = !!whatsapp.number;
    hasTelegram = !!telegram.botToken && !!telegram.chatId;
    if (userSnap.data().dailySummaryConfig) {
      config = {
        ...config,
        ...userSnap.data().dailySummaryConfig
      };
    }
  }
  config.hasWhatsapp = hasWhatsapp;
  config.hasTelegram = hasTelegram;
  return config;
};

const saveUserNotificationConfig = async (userId, config) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    dailySummaryConfig: {
      enabled: config.enabled,
      hour: config.hour,
      channel: config.channel
    }
  });
};

const DailySummaryConfigCard = ({ user }) => {
  const [config, setConfig] = useState({ enabled: false, hour: '21:00', channel: '', hasWhatsapp: false, hasTelegram: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openWhatsApp, setOpenWhatsApp] = useState(false);
  const [openTelegram, setOpenTelegram] = useState(false);

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

  const handleConfigClick = () => {
    if (!config.hasWhatsapp && !config.hasTelegram) {
      setOpenWhatsApp(true);
    } else if (!config.hasWhatsapp) {
      setOpenWhatsApp(true);
    } else if (!config.hasTelegram) {
      setOpenTelegram(true);
    }
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
              <Button variant="outlined" size="small" sx={{ ml: 2 }} onClick={handleConfigClick}>Configurar</Button>
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
        <Dialog open={openWhatsApp} onClose={() => setOpenWhatsApp(false)} maxWidth="xs" fullWidth>
          <WhatsAppConfigModal onClose={() => setOpenWhatsApp(false)} />
        </Dialog>
        <Dialog open={openTelegram} onClose={() => setOpenTelegram(false)} maxWidth="xs" fullWidth>
          <TelegramConfigModal onClose={() => setOpenTelegram(false)} />
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default DailySummaryConfigCard; 