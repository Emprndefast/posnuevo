import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Alert, CircularProgress, DialogActions, Switch, FormControlLabel } from '@mui/material';
import axios from 'axios';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { useAuth } from '../../../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const WhatsAppConfigModal = ({ onClose }) => {
  const [useGlobal, setUseGlobal] = useState(true);
  const [instanceId, setInstanceId] = useState('');
  const [token, setToken] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const { user, reloadUser } = useAuth() || {};

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

  return (
    <Box sx={{ p: 3, minWidth: 350 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Configuración de WhatsApp
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
      {alert && (
        <Alert severity={alert.type} sx={{ mb: 2 }}>
          {alert.message}
        </Alert>
      )}
      {!useGlobal && (
        <>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Si deseas usar tu propia cuenta de UltraMsg, ingresa los datos aquí:
          </Typography>
          <TextField
            fullWidth
            label="Instance ID"
            value={instanceId}
            onChange={e => setInstanceId(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Token"
            value={token}
            onChange={e => setToken(e.target.value)}
            margin="normal"
            type="password"
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
      />
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
        <Button
          variant="outlined"
          onClick={handleSave}
          disabled={loading}
        >
          Guardar
        </Button>
        <Button
          variant="contained"
          onClick={handleTest}
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} /> : 'Enviar Mensaje de Prueba'}
        </Button>
      </DialogActions>
    </Box>
  );
};

export default WhatsAppConfigModal;