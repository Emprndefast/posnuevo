// src/pages/Servicios.js
import React, { useState } from 'react';
import { TextField, Button, Typography, Box, List, ListItem, ListItemText, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';

const Servicios = () => {
  // Estado que guarda los servicios y precios
  const [servicios, setServicios] = useState([
    { id: 1, nombre: 'Reparación de Pantalla', precio: 100 },
    { id: 2, nombre: 'Cambio de Batería', precio: 80 },
    { id: 3, nombre: 'Reparación de Puerto de Carga', precio: 60 },
  ]);

  const [editando, setEditando] = useState(null); // Servicio que estamos editando
  const [nuevoPrecio, setNuevoPrecio] = useState(0); // Nuevo precio para el servicio

  // Función para manejar el cambio en el precio de un servicio
  const manejarCambioPrecio = (id) => {
    setEditando(id);
    const servicio = servicios.find((servicio) => servicio.id === id);
    setNuevoPrecio(servicio.precio); // Establece el precio actual para editarlo
  };

  // Función para guardar el nuevo precio
  const guardarNuevoPrecio = (id) => {
    const nuevosServicios = servicios.map((servicio) =>
      servicio.id === id ? { ...servicio, precio: nuevoPrecio } : servicio
    );
    setServicios(nuevosServicios);
    setEditando(null); // Termina de editar
  };

  // Función para agregar un extra al precio
  const agregarExtra = (id) => {
    const nuevosServicios = servicios.map((servicio) =>
      servicio.id === id ? { ...servicio, precio: servicio.precio + 20 } : servicio // Añade 20 de extra
    );
    setServicios(nuevosServicios);
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        Lista de Servicios y Precios
      </Typography>
      
      <List>
        {servicios.map((servicio) => (
          <ListItem key={servicio.id} sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <ListItemText
              primary={servicio.nombre}
              secondary={`Precio: $${servicio.precio}`}
            />
            <Box>
              {/* Editar precio */}
              {editando === servicio.id ? (
                <TextField
                  type="number"
                  value={nuevoPrecio}
                  onChange={(e) => setNuevoPrecio(Number(e.target.value))}
                  label="Nuevo Precio"
                  variant="outlined"
                  size="small"
                  sx={{ marginRight: 1 }}
                />
              ) : (
                <IconButton onClick={() => manejarCambioPrecio(servicio.id)}>
                  <EditIcon />
                </IconButton>
              )}

              {/* Guardar el nuevo precio */}
              {editando === servicio.id && (
                <IconButton onClick={() => guardarNuevoPrecio(servicio.id)}>
                  <SaveIcon />
                </IconButton>
              )}

              {/* Agregar extra */}
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => agregarExtra(servicio.id)}
                sx={{ ml: 2 }}
              >
                Agregar Extra (+$20)
              </Button>
            </Box>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Servicios;
