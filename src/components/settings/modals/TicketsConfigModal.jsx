import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Stack, Switch, FormControlLabel, Divider, Select, MenuItem, InputLabel, FormControl, Checkbox, Grid, Paper } from '@mui/material';

const ejemploFactura = ({ config, empresaData, plan }) => {
  const empresa = empresaData || {
    businessName: 'TORO COMUNICACIONES',
    address: 'SANTO DOMINGO, REP. DOM.',
    ruc: 'RNC: 123456789',
    phone: 'Tel: 809-999-9999',
    email: 'correo@empresa.com',
  };
  const isPlanBasico = !plan || plan === 'free' || plan === 'basico';
  return (
    <Box sx={{ fontFamily: 'monospace', fontSize: config.fontSize || 8, bgcolor: '#fff', p: 2, borderRadius: 1, border: '1px solid #eee', minWidth: 220 }}>
      <Typography align="center" fontWeight="bold" fontSize={config.fontSize + 2}>{empresa.businessName}</Typography>
      <Typography align="center" fontSize={config.fontSize}>{empresa.address}</Typography>
      <Typography align="center" fontSize={config.fontSize}>{empresa.ruc}</Typography>
      <Typography align="center" fontSize={config.fontSize}>{empresa.phone}</Typography>
      {empresa.email && <Typography align="center" fontSize={config.fontSize}>{empresa.email}</Typography>}
      <Divider sx={{ my: 1 }} />
      <Typography fontSize={config.fontSize}>TICKET # 900844</Typography>
      <Typography fontSize={config.fontSize}>CAJERO: ALFONSO CALDERON</Typography>
      <Typography fontSize={config.fontSize}>F. PAGO: 891 EFECTIVO</Typography>
      <Divider sx={{ my: 1 }} />
      <Typography fontSize={config.fontSize}>NOMBRE DE ARTICULO</Typography>
      <Typography fontSize={config.fontSize}>CANT | PRECIO UNIT | IMPORTE</Typography>
      <Typography fontSize={config.fontSize}>2    | $12.93     | $25.86</Typography>
      {config.showLot && <Typography fontSize={config.fontSize}>Lote: 123456</Typography>}
      {config.showColor && <Typography fontSize={config.fontSize}>Color: Rojo</Typography>}
      {config.showExpiry && <Typography fontSize={config.fontSize}>Caducidad: 12/2025</Typography>}
      {config.showBarcode && <Typography fontSize={config.fontSize}>[CÓDIGO DE BARRAS]</Typography>}
      <Divider sx={{ my: 1 }} />
      <Typography fontSize={config.fontSize}>SUBTOTAL: $25.86</Typography>
      <Typography fontSize={config.fontSize}>ITBIS: $4.14</Typography>
      <Typography fontSize={config.fontSize}>TOTAL: $30.00</Typography>
      {config.showRounding && <Typography fontSize={config.fontSize}>REDONDEO: $0.00</Typography>}
      <Typography align="center" fontSize={config.fontSize}>¡Gracias por su compra!</Typography>
      {isPlanBasico && (
        <>
          <Divider sx={{ my: 1 }} />
          <Typography align="center" fontSize={config.fontSize - 1} color="text.secondary">
            Factura impresa por POSENT sistema de ventas
          </Typography>
          <Typography align="center" fontSize={config.fontSize - 1} color="text.secondary">
            {empresa.businessName}
          </Typography>
        </>
      )}
    </Box>
  );
};

const ejemploEtiqueta = ({ config }) => (
  <Box sx={{ fontFamily: 'monospace', fontSize: config.fontSize || 8, bgcolor: '#fff', p: 2, borderRadius: 1, border: '1px solid #eee', minWidth: 120 }}>
    <Typography fontSize={config.fontSize}>Producto: Coca Cola</Typography>
    <Typography fontSize={config.fontSize}>Precio: $25.00</Typography>
    {config.showBarcode && <Typography fontSize={config.fontSize}>[CÓDIGO DE BARRAS]</Typography>}
    {config.showLot && <Typography fontSize={config.fontSize}>Lote: 123456</Typography>}
    {config.showExpiry && <Typography fontSize={config.fontSize}>Vence: 12/2025</Typography>}
  </Box>
);

const defaultConfig = {
  showLot: false,
  showColor: false,
  showExpiry: false,
  showBarcode: false,
  fontType: 'Consolas',
  fontSize: 8,
  copies: 1,
  timeFormat: '24',
  logoX: 0,
  logoY: 0,
  logoWidth: 0,
  logoHeight: 0,
  showRounding: false,
};

const TicketsConfigModal = ({ onClose, empresaData, plan }) => {
  const [config, setConfig] = useState(defaultConfig);

  const handleChange = (field) => (e) => {
    setConfig({
      ...config,
      [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value
    });
  };

  return (
    <Box sx={{ p: 3, minWidth: { xs: 320, md: 1100 }, maxWidth: { xs: '100vw', md: 1300 } }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Configuración de Tickets
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={5} order={{ xs: 2, md: 1 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Vista previa de factura</Typography>
          <Paper elevation={2} sx={{ mb: 2, p: 1, bgcolor: '#fafafa' }}>
            {ejemploFactura({ config, empresaData, plan })}
          </Paper>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Vista previa de etiqueta</Typography>
          <Paper elevation={2} sx={{ p: 1, bgcolor: '#fafafa' }}>
            {ejemploEtiqueta({ config })}
          </Paper>
        </Grid>
        <Grid item xs={12} md={7} order={{ xs: 1, md: 2 }}>
          <Stack spacing={2}>
            <Typography variant="subtitle1">Elementos del ticket</Typography>
            <FormControlLabel control={<Checkbox checked={config.showLot} onChange={handleChange('showLot')} />} label="Mostrar número de lote" />
            <FormControlLabel control={<Checkbox checked={config.showColor} onChange={handleChange('showColor')} />} label="Mostrar color" />
            <FormControlLabel control={<Checkbox checked={config.showExpiry} onChange={handleChange('showExpiry')} />} label="Mostrar caducidad" />
            <FormControlLabel control={<Checkbox checked={config.showBarcode} onChange={handleChange('showBarcode')} />} label="Mostrar código de barras" />
            <Divider />
            <FormControl fullWidth size="small">
              <InputLabel>Tipo de letra</InputLabel>
              <Select value={config.fontType} onChange={handleChange('fontType')} label="Tipo de letra">
                <MenuItem value="Consolas">Consolas</MenuItem>
                <MenuItem value="Arial">Arial</MenuItem>
                <MenuItem value="Times New Roman">Times New Roman</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Tamaño de letra" type="number" fullWidth size="small" value={config.fontSize} onChange={handleChange('fontSize')} />
            <TextField label="Número de copias" type="number" fullWidth size="small" value={config.copies} onChange={handleChange('copies')} />
            <FormControl fullWidth size="small">
              <InputLabel>Formato de hora</InputLabel>
              <Select value={config.timeFormat} onChange={handleChange('timeFormat')} label="Formato de hora">
                <MenuItem value="12">12 horas</MenuItem>
                <MenuItem value="24">24 horas</MenuItem>
              </Select>
            </FormControl>
            <Divider />
            <Typography variant="subtitle1">Configuración de logotipo</Typography>
            <Grid container spacing={1}>
              <Grid item xs={6} md={3}><TextField label="Posición X" type="number" size="small" value={config.logoX} onChange={handleChange('logoX')} /></Grid>
              <Grid item xs={6} md={3}><TextField label="Posición Y" type="number" size="small" value={config.logoY} onChange={handleChange('logoY')} /></Grid>
              <Grid item xs={6} md={3}><TextField label="Ancho" type="number" size="small" value={config.logoWidth} onChange={handleChange('logoWidth')} /></Grid>
              <Grid item xs={6} md={3}><TextField label="Alto" type="number" size="small" value={config.logoHeight} onChange={handleChange('logoHeight')} /></Grid>
            </Grid>
            <FormControlLabel control={<Checkbox checked={config.showRounding} onChange={handleChange('showRounding')} />} label="Mostrar redondeo en el ticket" />
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button variant="contained" onClick={onClose}>Cerrar</Button>
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TicketsConfigModal; 