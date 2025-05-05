import React, { useState } from 'react';
import { Box, TextField, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

const RegistroMovimiento = () => {
  const [monto, setMonto] = useState('');
  const [tipo, setTipo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'contabilidad'), {
        monto: parseFloat(monto),
        tipo,
        descripcion,
        fecha: new Date(fecha),
      });
      setMonto('');
      setTipo('');
      setDescripcion('');
      setFecha(new Date().toISOString().split('T')[0]);
      alert('Movimiento registrado correctamente!');
    } catch (error) {
      console.error('Error al registrar el movimiento:', error);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <TextField
        label="Monto"
        fullWidth
        type="number"
        value={monto}
        onChange={(e) => setMonto(e.target.value)}
        sx={{ mb: 2 }}
      />
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Tipo</InputLabel>
        <Select value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <MenuItem value="ingreso">Ingreso</MenuItem>
          <MenuItem value="egreso">Egreso</MenuItem>
        </Select>
      </FormControl>
      <TextField
        label="Descripción"
        fullWidth
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        label="Fecha"
        type="date"
        fullWidth
        value={fecha}
        onChange={(e) => setFecha(e.target.value)}
        sx={{ mb: 2 }}
        InputLabelProps={{
          shrink: true,
        }}
      />
      <Button type="submit" variant="contained" color="primary">
        Registrar
      </Button>
    </Box>
  );
};

export default RegistroMovimiento;
