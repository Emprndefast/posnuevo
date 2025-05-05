import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Container,
  Alert,
  Divider
} from '@mui/material';
import { testUtils } from '../utils/testUtils';
import { auth } from '../firebase/config';

function TestTrial() {
  const [userId, setUserId] = useState('');
  const [days, setDays] = useState('15');
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleModifyTrial = async () => {
    try {
      const currentUser = auth.currentUser;
      const targetUserId = userId || currentUser?.uid;

      if (!targetUserId) {
        setMessage({ type: 'error', text: 'Por favor, ingresa un ID de usuario o inicia sesión' });
        return;
      }

      await testUtils.modifyTrialDate(targetUserId, parseInt(days));
      setMessage({ type: 'success', text: 'Fecha de prueba modificada exitosamente' });
    } catch (error) {
      setMessage({ type: 'error', text: `Error: ${error.message}` });
    }
  };

  const handleRestoreTrial = async () => {
    try {
      const currentUser = auth.currentUser;
      const targetUserId = userId || currentUser?.uid;

      if (!targetUserId) {
        setMessage({ type: 'error', text: 'Por favor, ingresa un ID de usuario o inicia sesión' });
        return;
      }

      await testUtils.restoreTrialDate(targetUserId);
      setMessage({ type: 'success', text: 'Fecha de prueba restaurada exitosamente' });
    } catch (error) {
      setMessage({ type: 'error', text: `Error: ${error.message}` });
    }
  };

  const handleSimulateExpiration = async () => {
    try {
      const currentUser = auth.currentUser;
      const targetUserId = userId || currentUser?.uid;

      if (!targetUserId) {
        setMessage({ type: 'error', text: 'Por favor, ingresa un ID de usuario o inicia sesión' });
        return;
      }

      await testUtils.modifySubscriptionToExpired(targetUserId);
      setMessage({ type: 'success', text: 'Suscripción modificada para simular vencimiento' });
    } catch (error) {
      setMessage({ type: 'error', text: `Error: ${error.message}` });
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            Prueba de Período de Prueba
          </Typography>
          
          {message.text && (
            <Alert severity={message.type} sx={{ mb: 2 }}>
              {message.text}
            </Alert>
          )}

          <TextField
            fullWidth
            label="ID de Usuario (opcional)"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            margin="normal"
            helperText="Deja vacío para usar el usuario actual"
          />

          <TextField
            fullWidth
            label="Días a retroceder"
            type="number"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            margin="normal"
            helperText="Número de días para retroceder la fecha de inicio"
          />

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleModifyTrial}
              fullWidth
            >
              Modificar Fecha de Prueba
            </Button>

            <Button
              variant="outlined"
              color="secondary"
              onClick={handleRestoreTrial}
              fullWidth
            >
              Restaurar Fecha
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            Simular Vencimiento de Suscripción
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Esta opción modificará los datos de la suscripción para simular que ha vencido el período de prueba
          </Typography>

          <Button
            variant="contained"
            color="error"
            onClick={handleSimulateExpiration}
            fullWidth
          >
            Simular Vencimiento
          </Button>
        </Paper>
      </Box>
    </Container>
  );
}

export default TestTrial; 