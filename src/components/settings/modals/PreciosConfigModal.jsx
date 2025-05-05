import React, { useState } from 'react';
import { Box, Typography, Button, Stack, FormControl, InputLabel, Select, MenuItem, TextField, Snackbar, Alert } from '@mui/material';

const PreciosConfigModal = ({ onClose }) => {
  const [form, setForm] = useState({
    currency: 'DOP',
    decimalPlaces: 2,
    cardCommission: 0
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
        Precios y Moneda
      </Typography>
      <Stack spacing={2}>
        <FormControl fullWidth size="small">
          <InputLabel>Moneda principal</InputLabel>
          <Select value={form.currency} onChange={handleChange('currency')} label="Moneda principal">
            <MenuItem value="DOP">DOP - Peso Dominicano</MenuItem>
            <MenuItem value="USD">USD - Dólar Americano</MenuItem>
            <MenuItem value="EUR">EUR - Euro</MenuItem>
          </Select>
        </FormControl>
        <TextField label="Decimales" type="number" fullWidth size="small" value={form.decimalPlaces} onChange={handleChange('decimalPlaces')} />
        <TextField label="Comisión tarjeta (%)" type="number" fullWidth size="small" value={form.cardCommission} onChange={handleChange('cardCommission')} />
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

export default PreciosConfigModal; 