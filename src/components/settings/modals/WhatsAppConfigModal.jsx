import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Alert, 
  CircularProgress, 
  DialogActions, 
  Switch, 
  FormControlLabel,
  Tab,
  Tabs,
  Divider,
  Chip,
  Grid
} from '@mui/material';
import axios from 'axios';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { useAuth } from '../../../context/AuthContextMongo';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import SettingsIcon from '@mui/icons-material/Settings';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002/api';

const WhatsAppConfigModal = ({ onClose }) => {
  const [tab, setTab] = useState(0);
  const [useGlobal, setUseGlobal] = useState(true);
  const [instanceId, setInstanceId] = useState('');
  const [token, setToken] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const { user, reloadUser } = useAuth() || {};

  // Whabot configuration
  const [whabotEnabled, setWhabotEnabled] = useState(false);
  const [whabotUrl, setWhabotUrl] = useState('');
  const [whabotApiKey, setWhabotApiKey] = useState('');
  const [whabotLoading, setWhabotLoading] = useState(false);

  const validatePhone = (number) => /^\+[1-9]\d{10,14}$/.test(number);

  const handleTest = async () => {
    setAlert(null);
    if (!validatePhone(phone)) {
      setAlert({ type: 'error', message: 'Número de WhatsApp inválido (usa formato internacional)' });
      return;
    }
    if (!useGlobal) {
      if (!instanceId.trim()) {
        setAlert({ type: 'error', message: 'Instance ID es requerido' });
        return;
      }
      if (!token.trim()) {
        setAlert({ type: 'error', message: 'Token es requerido' });
        return;
      }
    }
    setLoading(true);
    try {
      const payload = {
        phone: phone.replace(/\D/g, '')
      };
      if (!useGlobal) {
        payload.instanceId = instanceId;
        payload.token = token;
      }
      console.log('Enviando prueba de WhatsApp:', payload);
      const response = await axios.post(`${API_URL}/api/notifications/test-whatsapp`, payload);
      console.log('Respuesta del servidor:', response.data);
      if (response.data.success) {
        setAlert({ type: 'success', message: 'Mensaje de prueba enviado correctamente' });
      } else {
        setAlert({ type: 'error', message: response.data.error || 'Error al enviar mensaje' });
      }
    } catch (error) {
      console.error('Error en la petición:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      setAlert({ 
        type: 'error', 
        message: error.response?.data?.error || error.message || 'Error al enviar mensaje' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setAlert(null);
    if (!validatePhone(phone)) {
      setAlert({ type: 'error', message: 'Número de WhatsApp inválido (usa formato internacional)' });
      return;
    }
    if (!user?.uid) {
      setAlert({ type: 'error', message: 'Usuario no autenticado' });
      return;
    }
    if (!useGlobal) {
      if (!instanceId.trim()) {
        setAlert({ type: 'error', message: 'Instance ID es requerido' });
        return;
      }
      if (!token.trim()) {
        setAlert({ type: 'error', message: 'Token es requerido' });
        return;
      }
    }
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        whatsapp: {
          useGlobal,
          instanceId: useGlobal ? '' : instanceId,
          token: useGlobal ? '' : token,
          number: phone
        }
      });
      console.log('Configuración de WhatsApp guardada en Firestore');
      if (typeof reloadUser === 'function') {
        await reloadUser();
        console.log('Usuario tras reloadUser:', user);
      }
      setTimeout(() => {
        window.location.reload();
      }, 500);
      setAlert({ type: 'success', message: 'Configuración guardada correctamente' });
    } catch (error) {
      console.error('Error al guardar configuración de WhatsApp:', error);
      setAlert({ type: 'error', message: 'Error al guardar configuración' });
    }
  };

  const handleSaveWhabot = async () => {
    if (!whabotUrl.trim()) {
      setAlert({ type: 'error', message: 'La URL de Whabot es requerida' });
      return;
    }
    if (!whabotApiKey.trim()) {
      setAlert({ type: 'error', message: 'La API Key es requerida' });
      return;
    }

    setWhabotLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        whabot: {
          enabled: whabotEnabled,
          url: whabotUrl,
          apiKey: whabotApiKey
        }
      });
      
      setAlert({ type: 'success', message: 'Configuración de Whabot guardada correctamente' });
      
      if (typeof reloadUser === 'function') {
        await reloadUser();
      }
    } catch (error) {
      console.error('Error al guardar configuración de Whabot:', error);
      setAlert({ type: 'error', message: 'Error al guardar configuración de Whabot' });
    } finally {
      setWhabotLoading(false);
    }
  };

  return (
    <Box sx={{ minWidth: 500 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)}>
          <Tab 
            icon={<WhatsAppIcon />} 
            iconPosition="start" 
            label="UltraMsg" 
            sx={{ textTransform: 'none', fontWeight: 600 }}
          />
          <Tab 
            icon={<SettingsIcon />} 
            iconPosition="start" 
            label="Whabot Pro" 
            sx={{ textTransform: 'none', fontWeight: 600 }}
          />
        </Tabs>
      </Box>

      {alert && (
        <Alert severity={alert.type} sx={{ mb: 2 }} onClose={() => setAlert(null)}>
          {alert.message}
        </Alert>
      )}

      {tab === 0 && (
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <WhatsAppIcon color="success" />
            Configuración UltraMsg
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={useGlobal}
                onChange={e => setUseGlobal(e.target.checked)}
                color="primary"
              />
            }
            label="Usar la instancia global de WhatsApp (recomendado)"
            sx={{ mb: 2 }}
          />

          {!useGlobal && (
            <>
              <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                Si deseas usar tu propia cuenta de UltraMsg, ingresa los datos aquí:
              </Typography>
              <TextField
                fullWidth
                label="Instance ID"
                value={instanceId}
                onChange={e => setInstanceId(e.target.value)}
                margin="normal"
                placeholder="tu-instance-id"
              />
              <TextField
                fullWidth
                label="Token"
                value={token}
                onChange={e => setToken(e.target.value)}
                margin="normal"
                type="password"
                placeholder="tu-token-secreto"
              />
            </>
          )}

          <TextField
            fullWidth
            label="Número de WhatsApp"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="+18091234567"
            margin="normal"
            helperText="Formato internacional con código de país"
          />

          <DialogActions sx={{ mt: 3, px: 0 }}>
            <Button onClick={onClose} color="inherit">Cerrar</Button>
            <Button
              variant="outlined"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} /> : 'Guardar'}
            </Button>
            <Button
              variant="contained"
              onClick={handleTest}
              disabled={loading}
              startIcon={<WhatsAppIcon />}
            >
              {loading ? <CircularProgress size={20} /> : 'Probar Mensaje'}
            </Button>
          </DialogActions>
        </Box>
      )}

      {tab === 1 && (
        <Box sx={{ p: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <SettingsIcon color="primary" />
              Configuración Whabot Pro
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Conecta POSENT con tu instancia de Whabot Pro para enviar mensajes de WhatsApp
            </Typography>
          </Box>

          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Información importante:</strong> Esta integración permite que POSENT se conecte 
              con Whabot Pro para enviar mensajes de WhatsApp. Asegúrate de que Whabot Pro esté 
              configurado correctamente.
            </Typography>
          </Alert>

          <FormControlLabel
            control={
              <Switch
                checked={whabotEnabled}
                onChange={e => setWhabotEnabled(e.target.checked)}
                color="primary"
              />
            }
            label="Habilitar integración con Whabot Pro"
            sx={{ mb: 3 }}
          />

          {whabotEnabled && (
            <>
              <TextField
                fullWidth
                label="URL de Whabot Pro"
                value={whabotUrl}
                onChange={e => setWhabotUrl(e.target.value)}
                margin="normal"
                placeholder="https://tu-whabot-pro.com"
                helperText="URL completa de tu instancia de Whabot Pro"
              />

              <TextField
                fullWidth
                label="API Key"
                value={whabotApiKey}
                onChange={e => setWhabotApiKey(e.target.value)}
                margin="normal"
                type="password"
                placeholder="tu-api-key-secreta"
                helperText="API Key para autenticar con Whabot Pro"
              />

              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Para obtener tu API Key, ve a la configuración de Whabot Pro → 
                  Integraciones → Generar API Key
                </Typography>
              </Alert>
            </>
          )}

          <DialogActions sx={{ mt: 3, px: 0 }}>
            <Button onClick={onClose} color="inherit">Cerrar</Button>
            <Button
              variant="contained"
              onClick={handleSaveWhabot}
              disabled={whabotLoading || !whabotEnabled}
              startIcon={<SettingsIcon />}
            >
              {whabotLoading ? <CircularProgress size={20} /> : 'Guardar Configuración'}
            </Button>
          </DialogActions>
        </Box>
      )}
    </Box>
  );
};

export default WhatsAppConfigModal;