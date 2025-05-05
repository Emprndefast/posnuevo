import React, { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  saveTelegramConfig, 
  getTelegramConfig, 
  testTelegramConnection 
} from '../api/telegram';

const TelegramConfig = () => {
  const [config, setConfig] = useState({
    botToken: '',
    chatId: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const data = await getTelegramConfig();
      setConfig(data);
    } catch (err) {
      setError('Error al cargar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      await saveTelegramConfig(config);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Error al guardar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      await testTelegramConnection();
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Error al probar la conexión');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Configuración de Telegram
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Operación exitosa
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Token del Bot"
          name="botToken"
          value={config.botToken}
          onChange={handleChange}
          margin="normal"
          required
          helperText="Ingresa el token de tu bot de Telegram"
        />

        <TextField
          fullWidth
          label="Chat ID"
          name="chatId"
          value={config.chatId}
          onChange={handleChange}
          margin="normal"
          required
          helperText="Ingresa tu Chat ID de Telegram"
        />

        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            Guardar Configuración
          </Button>

          <Button
            variant="outlined"
            color="primary"
            onClick={handleTest}
            disabled={loading}
          >
            Probar Conexión
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default TelegramConfig; 