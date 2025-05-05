import React, { useState } from 'react';
import { Box, Typography, Button, Stack, TextField, FormControl, InputLabel, Select, MenuItem, Snackbar, Alert } from '@mui/material';

const ImpresoraConfigModal = ({ onClose }) => {
  const [form, setForm] = useState({
    type: 'thermal',
    connection: 'usb',
    paperSize: '80mm',
    copies: 1
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
        Configuración de Impresora
      </Typography>
      <Stack spacing={2}>
        <FormControl fullWidth size="small">
          <InputLabel>Tipo de impresora</InputLabel>
          <Select value={form.type} onChange={handleChange('type')} label="Tipo de impresora">
            <MenuItem value="thermal">Térmica</MenuItem>
            <MenuItem value="inkjet">Inyección de tinta</MenuItem>
            <MenuItem value="laser">Láser</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth size="small">
          <InputLabel>Conexión</InputLabel>
          <Select value={form.connection} onChange={handleChange('connection')} label="Conexión">
            <MenuItem value="usb">USB</MenuItem>
            <MenuItem value="network">Red</MenuItem>
            <MenuItem value="bluetooth">Bluetooth</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth size="small">
          <InputLabel>Tamaño de papel</InputLabel>
          <Select value={form.paperSize} onChange={handleChange('paperSize')} label="Tamaño de papel">
            <MenuItem value="58mm">58mm</MenuItem>
            <MenuItem value="80mm">80mm</MenuItem>
            <MenuItem value="A4">A4</MenuItem>
          </Select>
        </FormControl>
        <TextField label="Copias" type="number" fullWidth size="small" value={form.copies} onChange={handleChange('copies')} />
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

export default ImpresoraConfigModal; 