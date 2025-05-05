import React, { useState } from 'react';
import { Stack, TextField, Button, Snackbar, Alert } from '@mui/material';

const TicketsAutomatico = ({ disabled, onClose }) => {
  const [form, setForm] = useState({
    emailContacto: '',
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSave = () => {
    setSnackbar({ open: true, message: 'Configuración guardada correctamente', severity: 'success' });
    onClose();
  };

  return (
    <Stack spacing={2}>
      <TextField label="Correo de contacto" value={form.emailContacto} onChange={handleChange('emailContacto')} disabled={disabled} fullWidth size="small" />
      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
        <Button variant="contained" onClick={handleSave} disabled={disabled}>Guardar</Button>
        <Button variant="outlined" onClick={onClose}>Cerrar</Button>
      </Stack>
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Stack>
  );
};

export default TicketsAutomatico; 