import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Stack, FormControl, InputLabel, Select, MenuItem, Snackbar, Alert, FormControlLabel, Switch } from '@mui/material';

const GeneralConfigModal = ({ onClose }) => {
  const [form, setForm] = useState({
    businessType: '',
    reportHeader: '',
    backupPath: '',
    decimalPlaces: 2,
    cardCommission: 0,
    autoBackup: false
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  };

  const handleSave = () => {
    // Aquí iría la lógica de guardado real (Firestore, etc.)
    setSnackbar({ open: true, message: 'Configuración guardada correctamente', severity: 'success' });
    onClose();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Configuración General
      </Typography>
      <Stack spacing={2}>
        <FormControl fullWidth size="small">
          <InputLabel>Giro comercial</InputLabel>
          <Select value={form.businessType} onChange={handleChange('businessType')} label="Giro comercial">
            <MenuItem value="ACCESORIOS">ACCESORIOS</MenuItem>
            <MenuItem value="ROPA">ROPA</MenuItem>
            <MenuItem value="ALIMENTOS">ALIMENTOS</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth size="small">
          <InputLabel>Encabezado de reportes</InputLabel>
          <Select value={form.reportHeader} onChange={handleChange('reportHeader')} label="Encabezado de reportes">
            <MenuItem value="USAR INFORMACIÓN DE EMPRESA">USAR INFORMACIÓN DE EMPRESA</MenuItem>
            <MenuItem value="PERSONALIZADO">PERSONALIZADO</MenuItem>
          </Select>
        </FormControl>
        <TextField label="Ruta para respaldo" fullWidth size="small" value={form.backupPath} onChange={handleChange('backupPath')} />
        <TextField label="Decimales de moneda" type="number" fullWidth size="small" value={form.decimalPlaces} onChange={handleChange('decimalPlaces')} />
        <TextField label="% comisión Tarjeta" type="number" fullWidth size="small" value={form.cardCommission} onChange={handleChange('cardCommission')} />
        <FormControlLabel control={<Switch checked={form.autoBackup} onChange={handleChange('autoBackup')} />} label="Siempre Respaldar BD al salir" />
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

export default GeneralConfigModal; 