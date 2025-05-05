import React, { useState } from 'react';
import { Box, TextField, Button, Typography, MenuItem } from '@mui/material';

export default function StepPreferences({ data = {}, onNext, onBack }) {
  const [preferences, setPreferences] = useState({
    theme: data?.theme || 'light',
    currency: data?.currency || 'USD',
    language: data?.language || 'es',
  });

  const handleChange = e => {
    setPreferences(p => ({ ...p, [e.target.name]: e.target.value }));
  };

  return (
    <Box>
      <Typography variant="h6" mb={2}>Preferencias del sistema</Typography>
      <TextField
        select
        fullWidth
        margin="normal"
        name="theme"
        label="Tema"
        value={preferences.theme}
        onChange={handleChange}
      >
        <MenuItem value="light">Claro</MenuItem>
        <MenuItem value="dark">Oscuro</MenuItem>
      </TextField>
      <TextField
        select
        fullWidth
        margin="normal"
        name="currency"
        label="Moneda"
        value={preferences.currency}
        onChange={handleChange}
      >
        <MenuItem value="USD">USD - $</MenuItem>
        <MenuItem value="EUR">EUR - €</MenuItem>
        <MenuItem value="DOP">DOP - RD$</MenuItem>
      </TextField>
      <TextField
        select
        fullWidth
        margin="normal"
        name="language"
        label="Idioma"
        value={preferences.language}
        onChange={handleChange}
      >
        <MenuItem value="es">Español</MenuItem>
        <MenuItem value="en">Inglés</MenuItem>
      </TextField>
      <Box display="flex" justifyContent="space-between" mt={3}>
        <Button variant="outlined" onClick={onBack}>Atrás</Button>
        <Button variant="contained" onClick={() => onNext(preferences)}>Siguiente</Button>
      </Box>
    </Box>
  );
}
