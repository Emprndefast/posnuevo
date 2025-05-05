import React, { useState } from 'react';
import { Box, Typography, Button, Stack, TextField, Switch, FormControlLabel, Snackbar, Alert } from '@mui/material';

const SeguridadConfigModal = ({ onClose }) => {
  const [form, setForm] = useState({
    twoFactorAuth: false,
    sessionTimeout: 30
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  };

  const handleSave = () => {
    setSnackbar({ open: true, message: 'Configuración guardada correctamente', severity: 'success' });
    onClose();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Configuración de Seguridad
      </Typography>
      <Stack spacing={2}>
        <FormControlLabel control={<Switch checked={form.twoFactorAuth} onChange={handleChange('twoFactorAuth')} />} label="Autenticación de dos factores" />
        <TextField label="Tiempo de sesión (minutos)" type="number" fullWidth size="small" value={form.sessionTimeout} onChange={handleChange('sessionTimeout')} />
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Button variant="contained" onClick={handleSave}>Guardar</Button>
          <Button variant="outlined" onClick={onClose}>Cerrar</Button>
        </Stack>
      </Stack>
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default SeguridadConfigModal; 