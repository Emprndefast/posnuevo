import React from 'react';
import { Box, Typography, Button, Stack, Switch, FormControlLabel, Divider, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useTheme } from '../../../context/ThemeContext';
import { Brightness4, Brightness7 } from '@mui/icons-material';

// Modal de configuración de apariencia
const AparienciaConfigModal = ({ onClose }) => {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Configuración de Apariencia
      </Typography>
      <Stack spacing={2}>
        <FormControlLabel 
          control={<Switch checked={darkMode} onChange={toggleDarkMode} />} 
          label="Modo oscuro" 
          labelPlacement="start"
          sx={{ justifyContent: 'space-between', ml: 0 }}
        />
        <Divider />
        <FormControl fullWidth size="small">
          <InputLabel>Tema</InputLabel>
          <Select label="Tema" defaultValue="default">
            <MenuItem value="default">Predeterminado</MenuItem>
            <MenuItem value="light">Claro</MenuItem>
            <MenuItem value="dark">Oscuro</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth size="small">
          <InputLabel>Color primario</InputLabel>
          <Select label="Color primario" defaultValue="blue">
            <MenuItem value="blue">Azul</MenuItem>
            <MenuItem value="green">Verde</MenuItem>
            <MenuItem value="red">Rojo</MenuItem>
            <MenuItem value="purple">Púrpura</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth size="small">
          <InputLabel>Color secundario</InputLabel>
          <Select label="Color secundario" defaultValue="green">
            <MenuItem value="blue">Azul</MenuItem>
            <MenuItem value="green">Verde</MenuItem>
            <MenuItem value="red">Rojo</MenuItem>
            <MenuItem value="purple">Púrpura</MenuItem>
          </Select>
        </FormControl>
        <Divider />
        <FormControlLabel control={<Switch />} label="Mostrar animaciones" />
        <FormControlLabel control={<Switch />} label="Mostrar sombras" />
        <FormControlLabel control={<Switch />} label="Mostrar bordes redondeados" />
        <Button variant="contained" onClick={onClose} sx={{ mt: 2 }}>
          Cerrar
        </Button>
      </Stack>
    </Box>
  );
};

export default AparienciaConfigModal; 