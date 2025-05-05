import React, { useState } from 'react';
import { Box, Typography, Button, Stack, TextField, Snackbar, Alert } from '@mui/material';

const BancosConfigModal = ({ onClose }) => {
  const [form, setForm] = useState({
    bankName: '',
    accountNumber: '',
    interBankCode: '',
    notifyPaymentTo: ''
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
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Datos Bancarios
      </Typography>
      <Stack spacing={2}>
        <TextField label="Nombre del banco" fullWidth size="small" value={form.bankName} onChange={handleChange('bankName')} />
        <TextField label="Número de cuenta" fullWidth size="small" value={form.accountNumber} onChange={handleChange('accountNumber')} />
        <TextField label="Código interbancario" fullWidth size="small" value={form.interBankCode} onChange={handleChange('interBankCode')} />
        <TextField label="Notificar pago a" fullWidth size="small" value={form.notifyPaymentTo} onChange={handleChange('notifyPaymentTo')} />
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

export default BancosConfigModal; 