import React, { useState } from 'react';
import { Box, Typography, Button, Stack, FormControl, InputLabel, Select, MenuItem, Snackbar, Alert } from '@mui/material';

const BasculaConfigModal = ({ onClose }) => {
  const [form, setForm] = useState({
    port: 'COM1',
    baudRate: 9600
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
        Configuración de Báscula
      </Typography>
      <Stack spacing={2}>
        <FormControl fullWidth size="small">
          <InputLabel>Puerto COM</InputLabel>
          <Select value={form.port} onChange={handleChange('port')} label="Puerto COM">
            <MenuItem value="COM1">COM1</MenuItem>
            <MenuItem value="COM2">COM2</MenuItem>
            <MenuItem value="COM3">COM3</MenuItem>
            <MenuItem value="COM4">COM4</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth size="small">
          <InputLabel>Velocidad</InputLabel>
          <Select value={form.baudRate} onChange={handleChange('baudRate')} label="Velocidad">
            <MenuItem value={9600}>9600</MenuItem>
            <MenuItem value={19200}>19200</MenuItem>
            <MenuItem value={38400}>38400</MenuItem>
          </Select>
        </FormControl>
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

export default BasculaConfigModal; 