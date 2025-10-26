import React, { useState } from 'react';
import { Box, Typography, Button, Stack, TextField, Switch, FormControlLabel, Snackbar, Alert, CircularProgress, IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useTelegram } from '../../../context/TelegramContext';
import { useAuth } from '../../../context/AuthContextMongo';
import { db } from '../../../firebase/config';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

const TelegramConfigModal = ({ onClose }) => {
  const { user, reloadUser } = useAuth() || {};
  const [showToken, setShowToken] = useState(false);
  const { reloadConfig } = useTelegram();
  const [form, setForm] = useState({
    botToken: user?.telegram?.botToken || '',
    chatId: user?.telegram?.chatId || '',
    notifications: {
      sales: user?.telegram?.notifications?.sales ?? true,
      lowStock: user?.telegram?.notifications?.lowStock ?? true,
      dailySummary: user?.telegram?.notifications?.dailySummary ?? false
    }
  });
  const [saving, setSaving] = useState(false);
  const [testStatus, setTestStatus] = useState('idle');
  const [testMessage, setTestMessage] = useState('');
  const [alert, setAlert] = useState(null);

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };
  const handleNotifChange = (notif) => (e) => {
    setForm(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [notif]: e.target.checked
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setAlert(null);
    try {
      if (!user?.uid) throw new Error('Usuario no autenticado');
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { telegram: form });
      if (typeof reloadUser === 'function') await reloadUser();
      if (typeof reloadConfig === 'function') await reloadConfig();
      setAlert({ type: 'success', message: 'Configuración guardada correctamente' });
    } catch (error) {
      setAlert({ type: 'error', message: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTestStatus('loading');
    setTestMessage('');
    try {
      if (!form.botToken || !form.chatId) throw new Error('Completa el token y el chat ID');
      // Aquí deberías llamar a tu API o función para probar la conexión
      // Simulación:
      await new Promise(res => setTimeout(res, 1000));
      setTestStatus('success');
      setTestMessage('Conexión con Telegram exitosa');
    } catch (error) {
      setTestStatus('error');
      setTestMessage('Error al probar conexión: ' + error.message);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Configuración de Bot Telegram
      </Typography>
      <Stack spacing={2}>
        {alert && <Alert severity={alert.type}>{alert.message}</Alert>}
        <TextField
          label="Token del Bot"
          fullWidth
          size="small"
          type={showToken ? 'text' : 'password'}
          value={form.botToken}
          onChange={handleChange('botToken')}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label={showToken ? 'Ocultar token' : 'Mostrar token'}
                  onClick={() => setShowToken((v) => !v)}
                  edge="end"
                  size="small"
                >
                  {showToken ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        <TextField label="Chat ID" fullWidth size="small" value={form.chatId} onChange={handleChange('chatId')} />
        <Typography variant="subtitle2">Notificaciones</Typography>
        <FormControlLabel control={<Switch checked={form.notifications.sales} onChange={handleNotifChange('sales')} />} label="Ventas" />
        <FormControlLabel control={<Switch checked={form.notifications.lowStock} onChange={handleNotifChange('lowStock')} />} label="Stock bajo" />
        <FormControlLabel control={<Switch checked={form.notifications.dailySummary} onChange={handleNotifChange('dailySummary')} />} label="Resumen diario" />
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? <CircularProgress size={20} color="inherit" /> : 'Guardar'}
          </Button>
          <Button variant="outlined" onClick={onClose}>Cerrar</Button>
          <Button variant="outlined" color="info" onClick={handleTest} disabled={testStatus === 'loading'}>
            {testStatus === 'loading' ? <CircularProgress size={20} color="inherit" /> : 'Probar conexión'}
          </Button>
        </Stack>
        {testStatus !== 'idle' && (
          <Alert severity={testStatus === 'success' ? 'success' : 'error'} sx={{ mt: 1 }}>
            {testMessage}
          </Alert>
        )}
      </Stack>
    </Box>
  );
};

export default TelegramConfigModal; 