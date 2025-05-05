import React, { useState } from 'react';
import { Box, Typography, Button, Stack, FormControl, InputLabel, Select, MenuItem, Snackbar, Alert } from '@mui/material';

const IdiomaConfigModal = ({ onClose }) => {
  const [form, setForm] = useState({
    language: 'es',
    region: 'DO'
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
        Idioma y Región
      </Typography>
      <Stack spacing={2}>
        <FormControl fullWidth size="small">
          <InputLabel>Idioma</InputLabel>
          <Select value={form.language} onChange={handleChange('language')} label="Idioma">
            <MenuItem value="es">Español</MenuItem>
            <MenuItem value="en">Inglés</MenuItem>
            <MenuItem value="pt">Portugués</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth size="small">
          <InputLabel>Región</InputLabel>
          <Select value={form.region} onChange={handleChange('region')} label="Región">
            <MenuItem value="DO">República Dominicana</MenuItem>
            <MenuItem value="MX">México</MenuItem>
            <MenuItem value="CO">Colombia</MenuItem>
            <MenuItem value="ES">España</MenuItem>
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

export default IdiomaConfigModal; 