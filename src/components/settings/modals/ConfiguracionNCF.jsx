import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Stack, FormControlLabel, Checkbox, Grid, Paper, Divider } from '@mui/material';

const tiposNCF = [
  { label: 'CRÉDITO FISCAL', code: 'B01' },
  { label: 'CONSUMO', code: 'B02' },
  { label: 'RÉGIMEN ESPECIAL', code: 'B14' },
  { label: 'GUBERNAMENTAL', code: 'B15' },
];

const defaultForm = {
  razonSocial: '',
  rnc: '',
  nombreComercial: '',
  mostrarImpuesto: false,
  vencimiento: '',
  rangos: {
    B01: { desde: '', hasta: '' },
    B02: { desde: '', hasta: '' },
    B14: { desde: '', hasta: '' },
    B15: { desde: '', hasta: '' },
  },
};

const VistaPreviaNCF = ({ form }) => (
  <Paper sx={{ p: 2, bgcolor: '#f8f8f8', border: '1px solid #eee', minWidth: 320 }}>
    <Typography align="center" fontWeight="bold" fontSize={16}>
      {form.razonSocial || 'NOMBRE O RAZÓN SOCIAL'}
    </Typography>
    <Typography align="center" fontSize={13}>{form.rnc ? `RNC: ${form.rnc}` : 'RNC: 000000000'}</Typography>
    {form.nombreComercial && (
      <Typography align="center" fontSize={13}>{form.nombreComercial}</Typography>
    )}
    <Divider sx={{ my: 1 }} />
    <Typography align="center" fontWeight="bold" fontSize={15} sx={{ letterSpacing: 4 }}>E J E M P L O</Typography>
    <Grid container spacing={1} sx={{ mt: 1 }}>
      <Grid item xs={5}><Typography fontWeight="bold">CRÉDITO FISCAL:</Typography></Grid>
      <Grid item xs={3}><Typography color="primary">B01</Typography></Grid>
      <Grid item xs={2}><Typography color="error">{form.rangos.B01.desde || '00000001'}</Typography></Grid>
      <Grid item xs={2}><Typography color="error">{form.rangos.B01.hasta || '00000100'}</Typography></Grid>
    </Grid>
    <Divider sx={{ my: 1 }} />
    <Typography fontSize={13}>
      Vencimiento: {form.vencimiento || 'dd/mm/aaaa'}
    </Typography>
    {form.mostrarImpuesto && (
      <Typography fontSize={12} color="text.secondary">Identificador de tipo de impuesto por producto: SÍ</Typography>
    )}
  </Paper>
);

const ConfiguracionNCF = ({ onClose }) => {
  const [form, setForm] = useState(defaultForm);

  const handleChange = (field) => (e) => {
    setForm({
      ...form,
      [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value
    });
  };

  const handleRangoChange = (tipo, campo) => (e) => {
    setForm({
      ...form,
      rangos: {
        ...form.rangos,
        [tipo]: {
          ...form.rangos[tipo],
          [campo]: e.target.value
        }
      }
    });
  };

  return (
    <Box sx={{ p: 3, minWidth: { xs: 320, md: 700 } }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Facturación Electrónica - Configurar NCF
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Stack spacing={2}>
            <TextField label="Nombre o razón social" value={form.razonSocial} onChange={handleChange('razonSocial')} fullWidth size="small" required />
            <TextField label="RNC" value={form.rnc} onChange={handleChange('rnc')} fullWidth size="small" required />
            <TextField label="Nombre comercial" value={form.nombreComercial} onChange={handleChange('nombreComercial')} fullWidth size="small" />
            <FormControlLabel control={<Checkbox checked={form.mostrarImpuesto} onChange={handleChange('mostrarImpuesto')} />} label="Mostrar identificador de tipo de impuesto por producto" />
            <TextField label="Fecha de vencimiento" type="date" value={form.vencimiento} onChange={handleChange('vencimiento')} fullWidth size="small" InputLabelProps={{ shrink: true }} />
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle1">Rangos de NCF por tipo</Typography>
            {tiposNCF.map(tipo => (
              <Grid container spacing={1} key={tipo.code} alignItems="center" sx={{ mb: 1 }}>
                <Grid item xs={4}><Typography fontWeight="bold">{tipo.label}:</Typography></Grid>
                <Grid item xs={2}><Typography color="primary">{tipo.code}</Typography></Grid>
                <Grid item xs={3}><TextField label="Desde" value={form.rangos[tipo.code].desde} onChange={handleRangoChange(tipo.code, 'desde')} size="small" /></Grid>
                <Grid item xs={3}><TextField label="Hasta" value={form.rangos[tipo.code].hasta} onChange={handleRangoChange(tipo.code, 'hasta')} size="small" /></Grid>
              </Grid>
            ))}
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button variant="contained" color="primary">Guardar</Button>
              <Button variant="outlined" onClick={onClose}>Cerrar</Button>
            </Stack>
          </Stack>
        </Grid>
        <Grid item xs={12} md={5}>
          <VistaPreviaNCF form={form} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ConfiguracionNCF; 