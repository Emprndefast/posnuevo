import React from 'react';

const Invoice = ({ repair }) => {
  return (
    <div>
      <h3>Factura de Reparación</h3>
      <p>Dispositivo: {repair.deviceName}</p>
      <p>Cliente: {repair.clientName}</p>
      <p>Precio: {repair.price}</p>
      {/* Añadir más detalles según sea necesario */}
    </div>
  );
};

export default Invoice;
