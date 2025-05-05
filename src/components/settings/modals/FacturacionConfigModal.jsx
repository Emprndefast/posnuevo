import React, { useState } from 'react';
import { Box, Typography, Button, Stack, TextField, Snackbar, Alert } from '@mui/material';

const FacturacionConfigModal = ({ onClose }) => {
  const [form, setForm] = useState({
    invoiceSerial: '',
    nextInvoiceNumber: 1,
    taxRegime: '',
    defaultIVA: 18
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
        Configuración de Facturación
      </Typography>
      <Stack spacing={2}>
        <TextField label="Serie de factura" fullWidth size="small" value={form.invoiceSerial} onChange={handleChange('invoiceSerial')} />
        <TextField label="Próximo número de factura" type="number" fullWidth size="small" value={form.nextInvoiceNumber} onChange={handleChange('nextInvoiceNumber')} />
        <TextField label="Régimen fiscal" fullWidth size="small" value={form.taxRegime} onChange={handleChange('taxRegime')} />
        <TextField label="IVA por defecto (%)" type="number" fullWidth size="small" value={form.defaultIVA} onChange={handleChange('defaultIVA')} />
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

export default FacturacionConfigModal; 