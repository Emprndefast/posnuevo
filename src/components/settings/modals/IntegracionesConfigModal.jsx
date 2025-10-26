import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContextMongo';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import StoreIcon from '@mui/icons-material/Store';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AddCircleIcon from '@mui/icons-material/AddCircle';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002/api';

const IntegracionesConfigModal = ({ onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  // Whabot Configuration
  const [whabotEnabled, setWhabotEnabled] = useState(false);
  const [whabotInstanceId, setWhabotInstanceId] = useState('');
  const [whabotApiKey, setWhabotApiKey] = useState('');
  const [whabotWebhookUrl, setWhabotWebhookUrl] = useState('');

  // Store APIs
  const [storeApis, setStoreApis] = useState([
    {
      name: '',
      apiUrl: '',
      apiKey: '',
      apiSecret: '',
      enabled: true,
    }
  ]);

  // Load current configuration
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/whabot/config`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        const config = response.data.data;
        console.log('Loaded Whabot config:', config);
        
        if (config.whabot) {
          setWhabotEnabled(config.whabot.enabled || false);
          setWhabotInstanceId(config.whabot.instanceId || '');
          setWhabotApiKey(config.whabot.apiKey || '');
          setWhabotWebhookUrl(config.whabot.webhookUrl || '');
        }
        
        // Load store APIs if they exist
        if (config.storeApis && Array.isArray(config.storeApis) && config.storeApis.length > 0) {
          console.log('Loading store APIs:', config.storeApis);
          setStoreApis(config.storeApis);
        } else {
          console.log('No store APIs found in config');
          // Keep default empty store API if none exist
          if (storeApis.length === 0) {
            setStoreApis([{
              name: '',
              apiUrl: '',
              apiKey: '',
              apiSecret: '',
              enabled: true,
            }]);
          }
        }
      }
    } catch (error) {
      console.error('Error loading config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStoreApi = () => {
    setStoreApis([
      ...storeApis,
      {
        name: '',
        apiUrl: '',
        apiKey: '',
        apiSecret: '',
        enabled: true,
      }
    ]);
  };

  const handleRemoveStoreApi = (index) => {
    setStoreApis(storeApis.filter((_, i) => i !== index));
  };

  const handleUpdateStoreApi = (index, field, value) => {
    const updated = [...storeApis];
    updated[index][field] = value;
    setStoreApis(updated);
  };

  const handleTestWhabot = async () => {
    setAlert(null);
    setLoading(true);

    try {
      const testData = {
        instanceId: whabotInstanceId,
        apiKey: whabotApiKey,
      };

      const response = await axios.post(`${API_URL}/whabot/test`, testData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        setAlert({ type: 'success', message: 'Conexión con Whabot exitosa' });
      } else {
        setAlert({ type: 'error', message: 'Error al conectar con Whabot' });
      }
    } catch (error) {
      setAlert({
        type: 'error',
        message: error.response?.data?.message || 'Error al probar conexión con Whabot'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestStoreApi = async (index) => {
    const storeApi = storeApis[index];
    if (!storeApi.apiUrl || !storeApi.apiKey) {
      setAlert({ type: 'error', message: 'Complete todos los campos de la API de tienda' });
      return;
    }

    setLoading(true);
    setAlert(null);

    try {
      const response = await axios.post(`${API_URL}/whabot/test-store-api`, {
        apiUrl: storeApi.apiUrl,
        apiKey: storeApi.apiKey,
        apiSecret: storeApi.apiSecret,
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        setAlert({ type: 'success', message: 'Conexión con la API de tienda exitosa' });
      } else {
        setAlert({ type: 'error', message: 'Error al conectar con la API de tienda' });
      }
    } catch (error) {
      setAlert({
        type: 'error',
        message: error.response?.data?.message || 'Error al probar conexión con API de tienda'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setAlert(null);

    try {
      const configData = {
        whabot: {
          enabled: whabotEnabled,
          instanceId: whabotInstanceId,
          apiKey: whabotApiKey,
          webhookUrl: whabotWebhookUrl,
        },
        storeApis: storeApis.filter(api => api.name && api.apiUrl && api.apiKey),
      };

      const response = await axios.post(`${API_URL}/whabot/config`, configData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        setAlert({ type: 'success', message: 'Configuración guardada exitosamente' });
        setTimeout(() => onClose(), 1500);
      } else {
        setAlert({ type: 'error', message: 'Error al guardar configuración' });
      }
    } catch (error) {
      setAlert({
        type: 'error',
        message: error.response?.data?.message || 'Error al guardar configuración'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4, minWidth: 600 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
        Integraciones con APIs Externas
      </Typography>

      {alert && (
        <Alert severity={alert.type} sx={{ mb: 3 }} onClose={() => setAlert(null)}>
          {alert.message}
        </Alert>
      )}

      {loading && !alert && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Whabot Configuration */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <WhatsAppIcon sx={{ fontSize: 32, color: '#25D366' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Integración Whabot Pro
          </Typography>
        </Box>

        <FormControlLabel
          control={
            <Switch
              checked={whabotEnabled}
              onChange={(e) => setWhabotEnabled(e.target.checked)}
              color="success"
            />
          }
          label="Habilitar integración con Whabot Pro"
          sx={{ mb: 2 }}
        />

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Instance ID de Whabot"
              value={whabotInstanceId}
              onChange={(e) => setWhabotInstanceId(e.target.value)}
              placeholder="Tu Instance ID de Whabot"
              size="small"
              helperText="ID único de tu instancia de Whabot Pro"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="API Key"
              value={whabotApiKey}
              onChange={(e) => setWhabotApiKey(e.target.value)}
              placeholder="Tu API Key"
              type="password"
              size="small"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Webhook URL (Opcional)"
              value={whabotWebhookUrl}
              onChange={(e) => setWhabotWebhookUrl(e.target.value)}
              placeholder="https://tu-dominio.com/webhook"
              size="small"
              helperText="URL para recibir órdenes de Whabot"
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="outlined"
              startIcon={<StoreIcon />}
              onClick={handleTestWhabot}
              disabled={!whabotInstanceId || !whabotApiKey}
              sx={{ mr: 2 }}
            >
              Probar Conexión
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Store APIs Configuration */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <StoreIcon sx={{ fontSize: 32, color: '#7C3AED' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              APIs de Tienda Externa
            </Typography>
          </Box>
          <Button
            startIcon={<AddCircleIcon />}
            onClick={handleAddStoreApi}
            variant="outlined"
            size="small"
          >
            Agregar API
          </Button>
        </Box>

        {storeApis.map((storeApi, index) => (
          <Box
            key={index}
            sx={{
              p: 3,
              mb: 2,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              bgcolor: 'background.paper',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                API de Tienda {index + 1}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Probar conexión">
                  <IconButton
                    size="small"
                    onClick={() => handleTestStoreApi(index)}
                    disabled={!storeApi.apiUrl || !storeApi.apiKey}
                  >
                    <CheckCircleIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Eliminar API">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleRemoveStoreApi(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nombre de la tienda"
                  value={storeApi.name}
                  onChange={(e) => handleUpdateStoreApi(index, 'name', e.target.value)}
                  placeholder="Mi Tienda"
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="URL de la API"
                  value={storeApi.apiUrl}
                  onChange={(e) => handleUpdateStoreApi(index, 'apiUrl', e.target.value)}
                  placeholder="https://tu-tienda.com/api"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="API Key"
                  value={storeApi.apiKey}
                  onChange={(e) => handleUpdateStoreApi(index, 'apiKey', e.target.value)}
                  placeholder="Tu API Key"
                  type="password"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="API Secret (Opcional)"
                  value={storeApi.apiSecret}
                  onChange={(e) => handleUpdateStoreApi(index, 'apiSecret', e.target.value)}
                  placeholder="Tu API Secret"
                  type="password"
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={storeApi.enabled}
                      onChange={(e) => handleUpdateStoreApi(index, 'enabled', e.target.checked)}
                      color="success"
                    />
                  }
                  label="API habilitada"
                />
              </Grid>
            </Grid>
          </Box>
        ))}
      </Box>

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 2, mt: 4, justifyContent: 'flex-end' }}>
        <Button variant="outlined" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={loading}
          startIcon={<CheckCircleIcon />}
        >
          Guardar Configuración
        </Button>
      </Box>
    </Box>
  );
};

export default IntegracionesConfigModal;

