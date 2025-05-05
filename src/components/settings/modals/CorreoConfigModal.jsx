import React from 'react';
import { Box, Typography, TextField, Button, Stack, Switch, FormControlLabel, Divider } from '@mui/material';

// Modal de configuración de correo
const CorreoConfigModal = ({ onClose }) => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Configuración de Correo
      </Typography>
      <Stack spacing={2}>
        <TextField label="Servidor SMTP" fullWidth size="small" />
        <TextField label="Puerto SMTP" type="number" fullWidth size="small" />
        <TextField label="Usuario SMTP" fullWidth size="small" />
        <TextField label="Contraseña SMTP" type="password" fullWidth size="small" />
        <TextField label="Correo de envío" fullWidth size="small" />
        <TextField label="Correo de recepción" fullWidth size="small" />
        <Divider />
        <FormControlLabel control={<Switch />} label="Usar SSL/TLS" />
        <FormControlLabel control={<Switch />} label="Enviar copia de tickets" />
        <FormControlLabel control={<Switch />} label="Enviar resumen diario" />
        <Button variant="contained" onClick={onClose} sx={{ mt: 2 }}>
          Cerrar
        </Button>
      </Stack>
    </Box>
  );
};

export default CorreoConfigModal; 