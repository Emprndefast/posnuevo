import React, { useState, useEffect } from 'react';
import ServiceCard from './ServiceCard'; // Asegúrate de que la ruta esté correcta
import { Card, Typography, Button } from '@mui/material';

const ServiceList = () => {
  const [servicios, setServicios] = useState([]);

  // Simula la obtención de datos desde Firebase o cualquier fuente de datos
  useEffect(() => {
    // Este es un ejemplo de los servicios. Cambia esto por la obtención real desde Firebase.
    const serviciosData = [
      {
        id: '1',
        cliente: 'Juan Perez',
        modelo: 'iPhone 12',
        problema: 'Pantalla rota',
        precio: 150,
        fecha: new Date(),
      },
      {
        id: '2',
        cliente: 'Ana Lopez',
        modelo: 'Samsung Galaxy S21',
        problema: 'No enciende',
        precio: 120,
        fecha: new Date(),
      },
      // Ejemplo de servicio con datos incompletos (provoca el error que se corrige)
      {
        id: '3',
        cliente: undefined, // Este servicio está incompleto y no debe renderizarse
        modelo: 'iPhone 13',
        problema: 'Batería defectuosa',
        precio: 200,
        fecha: new Date(),
      },
    ];

    setServicios(serviciosData);
  }, []);

  // Funciones de acción
  const eliminarServicio = (id) => {
    console.log(`Servicio con ID ${id} eliminado.`);
  };

  const imprimirFactura = (servicio) => {
    console.log(`Factura para ${servicio.cliente} imprimida.`);
  };

  const imprimirEtiqueta = (servicio) => {
    console.log(`Etiqueta para ${servicio.cliente} imprimida.`);
  };

  const marcarComoPagado = (id) => {
    console.log(`Servicio con ID ${id} marcado como pagado.`);
  };

  return (
    <div>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Servicios Pendientes
      </Typography>
      {servicios.map(
        (servicio) =>
          servicio && servicio.cliente ? ( // Validamos que el servicio tiene cliente antes de pasarlo
            <ServiceCard
              key={servicio.id}
              servicio={servicio}
              onDelete={eliminarServicio}
              onPrint={imprimirFactura}
              onPrintLabel={imprimirEtiqueta}
              onMarkPaid={marcarComoPagado}
            />
          ) : null // Si el servicio no tiene cliente, no se renderiza
      )}
    </div>
  );
};

export default ServiceList;
