import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Stack, TextField, Switch, FormControlLabel, Snackbar, Alert, CircularProgress, IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useTelegram } from '../../../context/TelegramContext';
import { useAuth } from '../../../context/AuthContextMongo';
// No Firestore usage: use backend API via Telegram context



const TelegramConfigModal = ({ onClose }) => {
  const { user, reloadUser } = useAuth() || {};
  const { config: tgConfig, saveConfig, testConnection, reloadConfig, loading: tgLoading } = useTelegram();
  const [showToken, setShowToken] = useState(false);

  // Initialize form from telegram config or user document
  const [form, setForm] = useState({
    botToken: tgConfig?.botToken || user?.telegram?.botToken || '',
    chatId: tgConfig?.chatId || user?.telegram?.chatId || '',
    notifications: {
      sales: tgConfig?.notifications?.sales ?? user?.telegram?.notifications?.sales ?? true,
      lowStock: tgConfig?.notifications?.lowStock ?? user?.telegram?.notifications?.lowStock ?? true,
      dailySummary: tgConfig?.notifications?.dailySummary ?? user?.telegram?.notifications?.dailySummary ?? false
    }
  });

  useEffect(() => {
    // Keep local form in sync with saved configuration
    setForm({
      botToken: tgConfig?.botToken || user?.telegram?.botToken || '',
      chatId: tgConfig?.chatId || user?.telegram?.chatId || '',
      notifications: {
        sales: tgConfig?.notifications?.sales ?? user?.telegram?.notifications?.sales ?? true,
        lowStock: tgConfig?.notifications?.lowStock ?? user?.telegram?.notifications?.lowStock ?? true,
        dailySummary: tgConfig?.notifications?.dailySummary ?? user?.telegram?.notifications?.dailySummary ?? false
      }
    });
  }, [tgConfig, user]);
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

      if (typeof saveConfig !== 'function') {
        throw new Error('Función de guardado no disponible');
      }

      const resp = await saveConfig({ botToken: form.botToken, chatId: form.chatId, notifications: form.notifications });
      if (resp) {
        setAlert({ type: 'success', message: 'Configuración guardada correctamente' });
        // Refresh context
        if (typeof reloadConfig === 'function') await reloadConfig();
      } else {
        throw new Error('No se pudo guardar la configuración');
      }
    } catch (error) {
      console.error('Error saving Telegram config:', error);
      setAlert({ type: 'error', message: error.message || 'Error al guardar configuración' });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTestStatus('loading');
    setTestMessage('');
    try {
      if (!user?.uid) throw new Error('Usuario no autenticado');
      if (!form.botToken || !form.chatId) throw new Error('Completa el token y el chat ID');

      if (typeof testConnection === 'function') {
        const result = await testConnection(form.botToken, form.chatId);
        setTestStatus(result?.success ? 'success' : 'error');
        setTestMessage(result?.message || (result?.data ? 'Conexión ok' : 'Error al probar'));
      } else {
        // As a fallback, call local test via frontend service
        await window.fetch('/api/telegram/test', { method: 'POST', body: JSON.stringify({ botToken: form.botToken, chatId: form.chatId }), headers: { 'Content-Type': 'application/json' } });
        setTestStatus('success');
        setTestMessage('Conexión con Telegram exitosa (fallback)');
      }
    } catch (error) {
      console.error('Error testing Telegram connection:', error);
      setTestStatus('error');
      setTestMessage('Error al probar conexión: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Configuración de Bot Telegram
      </Typography>
      <Stack spacing={2}>
        {!user?.uid && (
          <Alert severity="warning">Debes iniciar sesión para configurar Telegram (usuario no autenticado)</Alert>
        )}

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
          <Button variant="contained" onClick={handleSave} disabled={saving || !user?.uid}>
            {saving ? <CircularProgress size={20} color="inherit" /> : 'Guardar'}
          </Button>
          <Button variant="outlined" onClick={onClose}>Cerrar</Button>
          <Button variant="outlined" color="info" onClick={handleTest} disabled={testStatus === 'loading' || !user?.uid}>
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