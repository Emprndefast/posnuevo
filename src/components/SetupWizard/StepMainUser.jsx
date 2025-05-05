import React, { useState } from 'react';
import { Box, TextField, Button, Typography, MenuItem, FormControlLabel, Switch } from '@mui/material';

const ROLES = [
  { value: 'propietario', label: 'Propietario' },
  { value: 'admin', label: 'Administrador' },
];

export default function StepMainUser({ data = {}, onNext, onBack }) {
  const [form, setForm] = useState({
    ownerName: data?.ownerName || '',
    ownerRole: data?.ownerRole || 'propietario',
    addMoreUsers: data?.addMoreUsers ?? false,
  });

  return (
    <Box>
      <Typography variant="h6" mb={2}>Usuario principal</Typography>
      <TextField
        label="Nombre del propietario"
        name="ownerName"
        fullWidth
        margin="normal"
        value={form.ownerName}
        onChange={e => setForm(f => ({ ...f, ownerName: e.target.value }))}
        required
      />
      <TextField
        select
        label="Cargo o rol"
        name="ownerRole"
        fullWidth
        margin="normal"
        value={form.ownerRole}
        onChange={e => setForm(f => ({ ...f, ownerRole: e.target.value }))}
      >
        {ROLES.map(option => (
          <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
        ))}
      </TextField>
      <FormControlLabel
        control={
          <Switch
            checked={form.addMoreUsers}
            onChange={e => setForm(f => ({ ...f, addMoreUsers: e.target.checked }))}
            name="addMoreUsers"
            color="primary"
          />
        }
        label="¿Desea agregar más usuarios ahora?"
        sx={{ mt: 2 }}
      />
      <Box display="flex" justifyContent="space-between" mt={3}>
        <Button variant="outlined" onClick={onBack}>Atrás</Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => onNext(form)}
          disabled={!form.ownerName}
        >
          Siguiente
        </Button>
      </Box>
    </Box>
  );
}
