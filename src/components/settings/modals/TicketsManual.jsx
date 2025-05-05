import React, { useState } from 'react';
import { Stack, TextField, Switch, FormControlLabel, Button, Snackbar, Alert } from '@mui/material';

const TicketsManual = ({ disabled, onClose }) => {
  const [form, setForm] = useState({
    showLot: false,
    showColor: true,
    showBarcode: false,
    fontType: 'Consolas',
    fontSize: 8,
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
    <Stack spacing={2}>
      <FormControlLabel control={<Switch checked={form.showLot} onChange={handleChange('showLot')} disabled={disabled} />} label="Mostrar número de lote" />
      <FormControlLabel control={<Switch checked={form.showColor} onChange={handleChange('showColor')} disabled={disabled} />} label="Mostrar color" />
      <FormControlLabel control={<Switch checked={form.showBarcode} onChange={handleChange('showBarcode')} disabled={disabled} />} label="Mostrar código de barras" />
      <TextField label="Tipo de letra" value={form.fontType} onChange={handleChange('fontType')} disabled={disabled} fullWidth size="small" />
      <TextField label="Tamaño de letra" type="number" value={form.fontSize} onChange={handleChange('fontSize')} disabled={disabled} fullWidth size="small" />
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

export default TicketsManual; 