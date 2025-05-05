import React from 'react';
import { Card, Typography, Button } from '@mui/material';

const ServiceCard = ({ servicio, onDelete, onPrint, onPrintLabel, onMarkPaid }) => {
  // Validamos que el objeto 'servicio' y sus propiedades sean válidos antes de intentar renderizarlo
  if (!servicio || !servicio.cliente || !servicio.modelo || !servicio.precio || !servicio.fecha) {
    console.warn('Servicio incompleto, no se puede mostrar:', servicio);
    return null; // Si falta algún dato importante, no renderizamos nada
  }

  return (
    <Card sx={{ p: 3, mb: 3, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
      <Typography variant="h6">{servicio.cliente}</Typography>
      <Typography variant="body1">Modelo: {servicio.modelo}</Typography>
      <Typography variant="body2">Problema: {servicio.problema}</Typography>
      <Typography variant="body1">Precio: ${servicio.precio}</Typography>
      <Typography variant="body2">Fecha: {servicio.fecha.toLocaleDateString()}</Typography>

      <Button
        onClick={() => onMarkPaid(servicio.id)}
        variant="contained"
        color="success"
        sx={{ mr: 1 }}
      >
        Marcar como Pagado
      </Button>
      <Button onClick={() => onPrint(servicio)} variant="contained" color="primary" sx={{ mr: 1 }}>
        Imprimir Factura
      </Button>
      <Button
        onClick={() => onPrintLabel(servicio)}
        variant="contained"
        color="secondary"
        sx={{ mr: 1 }}
      >
        Imprimir Etiqueta
      </Button>
      <Button onClick={() => onDelete(servicio.id)} variant="outlined" color="error">
        Eliminar
      </Button>
    </Card>
  );
};

export default ServiceCard;
