import React from 'react';
import { Box, Typography, TextField, Button, Stack } from '@mui/material';

// Modal de configuración de empresa
const EmpresaConfigModal = ({ onClose }) => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Datos de la Empresa
      </Typography>
      <Stack spacing={2}>
        <TextField label="Nombre de la empresa" fullWidth size="small" />
        <TextField label="RUC/NIT" fullWidth size="small" />
        <TextField label="Dirección" fullWidth size="small" />
        <TextField label="Teléfono" fullWidth size="small" />
        <TextField label="Correo electrónico" fullWidth size="small" />
        <TextField label="Sitio web" fullWidth size="small" />
        {/* Agrega más campos según necesidad */}
        <Button variant="contained" onClick={onClose} sx={{ mt: 2 }}>
          Cerrar
        </Button>
      </Stack>
    </Box>
  );
};

export default EmpresaConfigModal; 