import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Avatar } from '@mui/material';

export default function StepBusinessInfo({ data = {}, onNext }) {
  const [form, setForm] = useState({
    name: data?.name || '',
    logo: data?.logo || '',
    phone: data?.phone || '',
    address: data?.address || '',
  });
  const [logoPreview, setLogoPreview] = useState(form.logo);

  const handleChange = e => {
    const { name, value, files } = e.target;
    if (name === 'logo' && files && files[0]) {
      const reader = new FileReader();
      reader.onload = ev => {
        setForm(f => ({ ...f, logo: ev.target.result }));
        setLogoPreview(ev.target.result);
      };
      reader.readAsDataURL(files[0]);
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  return (
    <Box>
      <Typography variant="h6" mb={2}>Información del negocio</Typography>
      <TextField
        label="Nombre del negocio"
        name="name"
        fullWidth
        margin="normal"
        value={form.name}
        onChange={handleChange}
        required
      />
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <Button variant="outlined" component="label">
          Subir Logo
          <input type="file" name="logo" accept="image/*" hidden onChange={handleChange} />
        </Button>
        {logoPreview && <Avatar src={logoPreview} sx={{ width: 56, height: 56 }} />}
      </Box>
      <TextField
        label="Teléfono de contacto"
        name="phone"
        fullWidth
        margin="normal"
        value={form.phone}
        onChange={handleChange}
      />
      <TextField
        label="Dirección"
        name="address"
        fullWidth
        margin="normal"
        value={form.address}
        onChange={handleChange}
      />
      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 2 }}
        onClick={() => onNext(form)}
        disabled={!form.name}
        fullWidth
      >
        Siguiente
      </Button>
    </Box>
  );
}
