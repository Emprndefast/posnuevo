import React, { useState, useEffect } from 'react';
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
  Divider,
  Chip,
  alpha
} from '@mui/material';
import api from '../../../api/api';
import { useAuth } from '../../../context/AuthContextMongo';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import SettingsIcon from '@mui/icons-material/Settings';

const WhatsAppConfigModal = ({ onClose }) => {
  const { user } = useAuth() || {};
  const [alert, setAlert] = useState(null);

  // Whabot configuration
  const [whabotEnabled, setWhabotEnabled] = useState(false);
  const [whabotApiKey, setWhabotApiKey] = useState('');
  const [whabotLoading, setWhabotLoading] = useState(false);
  const [whabotConfigLoaded, setWhabotConfigLoaded] = useState(false);

  // Generar un API ID aleatorio estilo SaaS (pt_live_XXXXX)
  const generateApiKey = () => {
    return 'pt_live_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  // Cargar la configuración de MONGODB (WhabotConfig) al montar
  useEffect(() => {
    if (user && !whabotConfigLoaded) {
      loadWhabotConfig();
    }
  }, [user]);

  const loadWhabotConfig = async () => {
    try {
      setWhabotLoading(true);
      const res = await api.get('/whabot/config');
      if (res.data.success && res.data.data) {
        setWhabotEnabled(res.data.data.whabot?.enabled || false);
        setWhabotApiKey(res.data.data.whabot?.apiKey || '');
        setWhabotConfigLoaded(true);
      }
    } catch (error) {
      console.error('Error cargando config de Whabot:', error);
    } finally {
      setWhabotLoading(false);
    }
  };

  const handleSaveWhabot = async () => {
    setAlert(null);
    let keyToSave = whabotApiKey;
    
    // Si lo habilitan pero no hay API Key, generamos una
    if (whabotEnabled && !keyToSave) {
      keyToSave = generateApiKey();
      setWhabotApiKey(keyToSave);
    }

    setWhabotLoading(true);
    try {
      // Guardar en MONGODB (WhabotConfig)
      await api.post('/whabot/config', {
        whabot: {
          enabled: whabotEnabled,
          apiKey: keyToSave
        }
      });
      
      setAlert({ type: 'success', message: '¡Integración con WhatsApp / Whabot Pro guardada exitosamente!' });
      
    } catch (error) {
      console.error('Error al guardar configuración de Whabot:', error);
      setAlert({ type: 'error', message: 'Error al conectar con el servidor POSENT.' });
    } finally {
      setWhabotLoading(false);
    }
  };

  const copiarApiKey = () => {
    navigator.clipboard.writeText(whabotApiKey);
    setAlert({ type: 'success', message: 'API Key copiada al portapapeles. Ahora pégala en Whabot.' });
  };

  return (
    <Box sx={{ minWidth: 500, p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <WhatsAppIcon color="success" sx={{ fontSize: 32 }} />
          Configuración de WhatsApp
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Gestiona cómo se comunica POSENT con tus clientes vía WhatsApp a través de Whabot Pro.
        </Typography>
      </Box>

      {alert && (
        <Alert severity={alert.type} sx={{ mb: 3 }} onClose={() => setAlert(null)}>
          {alert.message}
        </Alert>
      )}

      {whabotLoading && !whabotConfigLoaded ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Sincronización Inteligente:</strong> Esta integración permite que POSENT envíe 
              mensajes automáticos, recibos y notificaciones de pedidos a través de Whabot Pro.
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
            label={
              <Typography sx={{ fontWeight: 600 }}>
                Habilitar Integración con Whabot Pro
              </Typography>
            }
            sx={{ mb: 3 }}
          />

          {whabotEnabled && (
            <Box sx={{ animation: 'fadeIn 0.3s' }}>
              {/* API KEY SECTION */}
              <Box sx={{ mt: 2, p: 3, border: '1px solid #e0e0e0', borderRadius: 3, bgcolor: '#f9f9f9', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
                <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700, mb: 1 }}>
                  1. Tu API Key Maestra
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Copia esta llave y pégala en el panel de **Whabot Pro** -> Integración POSENT.
                </Typography>
                
                {whabotApiKey ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 'bold', bgcolor: 'white', p: 2, borderRadius: 2, border: '2px solid #ddd', flexGrow: 1, color: '#333', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
                      {whabotApiKey}
                    </Box>
                    <Button variant="contained" color="primary" onClick={copiarApiKey} sx={{ py: 1.5, px: 3, borderRadius: 2, fontWeight: 700 }}>
                      Copiar
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ p: 2, textAlign: 'center', bgcolor: alpha('#7C3AED', 0.05), borderRadius: 2, border: '1px dashed #7C3AED' }}>
                    <Typography variant="body2" color="primary" sx={{ fontStyle: 'italic' }}>
                      Pulsar en "Guardar" para generar tu llave.
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* WEBHOOK URL SECTION */}
              <Box sx={{ mt: 3, p: 3, border: '1px solid #e0e0e0', borderRadius: 3, bgcolor: '#f9f9f9', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
                <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700, mb: 1 }}>
                  2. Webhook URL de POSENT
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Usa esta URL en **Whabot Pro** para que las órdenes lleguen a POSENT.
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ fontFamily: 'monospace', fontSize: '0.9rem', bgcolor: 'white', p: 2, borderRadius: 2, border: '1px solid #ddd', flexGrow: 1, color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {`${window.location.origin.replace('3000', '3002')}/api/whabot/webhook`}
                  </Box>
                  <Button size="small" variant="outlined" onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin.replace('3000', '3002')}/api/whabot/webhook`);
                    setAlert({ type: 'success', message: 'Webhook URL copiada.' });
                  }}>
                    Copiar
                  </Button>
                </Box>
              </Box>

              <Box sx={{ mt: 3, p: 2, borderRadius: 2, bgcolor: '#e8f5e9', border: '1px solid #2e7d32', display: 'flex', gap: 2, alignItems: 'center' }}>
                <SettingsIcon color="success" />
                <Typography variant="body2" color="#1b5e20">
                  <strong>¡Sincronización Total!</strong> Al guardar, POSENT comenzará a recibir pedidos y actualizar stock reservado automáticamente.
                </Typography>
              </Box>
            </Box>
          )}

          <Divider sx={{ my: 4 }} />

          <DialogActions sx={{ px: 0, pb: 0 }}>
            <Button onClick={onClose} variant="outlined" color="inherit" sx={{ borderRadius: 2, px: 4 }}>
              Cerrar
            </Button>
            <Button
              variant="contained"
              onClick={handleSaveWhabot}
              disabled={whabotLoading}
              sx={{ 
                borderRadius: 2, 
                px: 5, 
                py: 1, 
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            >
              {whabotLoading ? <CircularProgress size={24} color="inherit" /> : 'Guardar Cambios'}
            </Button>
          </DialogActions>
        </Box>
      )}
    </Box>
  );
};

export default WhatsAppConfigModal;