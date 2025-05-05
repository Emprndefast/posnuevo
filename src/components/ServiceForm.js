import React, { useState } from 'react';
import { TextField, Button, Box } from '@mui/material';

const ServiceForm = ({ onSave }) => {
  const [servicio, setServicio] = useState({
    cliente: '',
    modelo: '',
    problema: '',
    precio: '',
    fecha: new Date(),
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setServicio({ ...servicio, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(servicio);
    setServicio({
      cliente: '',
      modelo: '',
      problema: '',
      precio: '',
      fecha: new Date(),
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <TextField
        label="Cliente"
        name="cliente"
        value={servicio.cliente}
        onChange={handleChange}
        fullWidth
        required
        sx={{ mb: 2 }}
      />
      <TextField
        label="Modelo"
        name="modelo"
        value={servicio.modelo}
        onChange={handleChange}
        fullWidth
        required
        sx={{ mb: 2 }}
      />
      <TextField
        label="Problema"
        name="problema"
        value={servicio.problema}
        onChange={handleChange}
        fullWidth
        required
        sx={{ mb: 2 }}
      />
      <TextField
        label="Precio"
        name="precio"
        type="number"
        value={servicio.precio}
        onChange={handleChange}
        fullWidth
        required
        sx={{ mb: 2 }}
      />
      <Button type="submit" variant="contained" color="primary">
        Guardar Servicio
      </Button>
    </Box>
  );
};

export default ServiceForm;
