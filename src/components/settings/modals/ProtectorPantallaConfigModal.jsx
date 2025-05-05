import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Stack, Switch, FormControlLabel, Snackbar, Alert, InputAdornment } from '@mui/material';
import PantallaBloqueo from '../PantallaBloqueo';

const ProtectorPantallaConfigModal = ({ onClose, initialConfig = {}, onSave }) => {
  const [enabled, setEnabled] = useState(initialConfig.enabled || false);
  const [pin, setPin] = useState(initialConfig.pin || '');
  const [timeout, setTimeoutValue] = useState(initialConfig.timeout || 5);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [testing, setTesting] = useState(false);

  const handleSave = () => {
    if (enabled && (!pin || pin.length < 4)) {
      setSnackbarMsg('El PIN debe tener al menos 4 dígitos');
      setSnackbarSeverity('error');
      setShowSnackbar(true);
      return;
    }
    if (enabled && (timeout < 1 || timeout > 120)) {
      setSnackbarMsg('El tiempo debe ser entre 1 y 120 minutos');
      setSnackbarSeverity('error');
      setShowSnackbar(true);
      return;
    }

    const config = { enabled, pin, timeout };
    
    // Guardar en localStorage
    try {
      localStorage.setItem('protectorPantalla', JSON.stringify(config));
      if (onSave) onSave(config);
      setSnackbarMsg('Configuración guardada correctamente');
      setSnackbarSeverity('success');
      setShowSnackbar(true);
      setTimeout(() => onClose(), 800);
    } catch (error) {
      console.error('Error guardando configuración:', error);
      setSnackbarMsg('Error al guardar la configuración');
      setSnackbarSeverity('error');
      setShowSnackbar(true);
    }
  };

  const handleTest = () => {
    if (!pin || pin.length < 4) {
      setSnackbarMsg('El PIN debe tener al menos 4 dígitos para probar');
      setSnackbarSeverity('error');
      setShowSnackbar(true);
      return;
    }
    setTesting(true);
  };

  const handleUnlock = () => {
    setTesting(false);
  };

  const handleLogout = () => {
    setTesting(false);
  };

  return (
    <Box sx={{ p: 3, minWidth: 320 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Configuración de Protector de Pantalla
      </Typography>
      <Stack spacing={2}>
        <FormControlLabel
          control={<Switch checked={enabled} onChange={e => setEnabled(e.target.checked)} />}
          label="Activar bloqueo por inactividad"
        />
        <TextField
          label="PIN de desbloqueo"
          type="password"
          value={pin}
          onChange={e => setPin(e.target.value.replace(/[^0-9]/g, ''))}
          inputProps={{ maxLength: 8 }}
          disabled={!enabled}
          fullWidth
          helperText="Mínimo 4 dígitos"
        />
        <TextField
          label="Tiempo de inactividad (minutos)"
          type="number"
          value={timeout}
          onChange={e => setTimeoutValue(Number(e.target.value))}
          InputProps={{ endAdornment: <InputAdornment position="end">min</InputAdornment> }}
          disabled={!enabled}
          fullWidth
          helperText="Entre 1 y 120 minutos"
        />
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Button variant="contained" onClick={handleSave}>Guardar</Button>
          <Button variant="outlined" onClick={onClose}>Cerrar</Button>
          {enabled && pin.length >= 4 && (
            <Button 
              variant="outlined" 
              color="secondary" 
              onClick={handleTest}
              sx={{ ml: 'auto' }}
            >
              Probar Pantalla
            </Button>
          )}
        </Stack>
      </Stack>
      <Snackbar open={showSnackbar} autoHideDuration={3000} onClose={() => setShowSnackbar(false)}>
        <Alert severity={snackbarSeverity}>{snackbarMsg}</Alert>
      </Snackbar>

      {testing && (
        <PantallaBloqueo
          pinGuardado={pin}
          onUnlock={handleUnlock}
          onLogout={handleLogout}
        />
      )}
    </Box>
  );
};

export default ProtectorPantallaConfigModal; 