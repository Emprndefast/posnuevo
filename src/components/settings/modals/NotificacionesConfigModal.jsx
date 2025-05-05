import React, { useState } from 'react';
import { Box, Typography, Button, Stack, Switch, FormControlLabel, Snackbar, Alert } from '@mui/material';

const NotificacionesConfigModal = ({ onClose }) => {
  const [form, setForm] = useState({
    sales: true,
    lowStock: true,
    newOrders: false
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.checked });
  };

  const handleSave = () => {
    setSnackbar({ open: true, message: 'Configuración guardada correctamente', severity: 'success' });
    onClose();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Configuración de Notificaciones
      </Typography>
      <Stack spacing={2}>
        <FormControlLabel control={<Switch checked={form.sales} onChange={handleChange('sales')} />} label="Ventas" />
        <FormControlLabel control={<Switch checked={form.lowStock} onChange={handleChange('lowStock')} />} label="Stock bajo" />
        <FormControlLabel control={<Switch checked={form.newOrders} onChange={handleChange('newOrders')} />} label="Nuevos pedidos" />
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

export default NotificacionesConfigModal; 