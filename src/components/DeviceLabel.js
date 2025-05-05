import React from 'react';
import './DeviceLabel.css';

const DeviceLabel = ({ data }) => {
  return (
    <div className="device-label">
      <h4>{data.cliente}</h4>
      <p><strong>Modelo:</strong> {data.modelo}</p>
      <p><strong>Problema:</strong> {data.problema}</p>
      <p><strong>Precio:</strong> ${data.precio}</p>
    </div>
  );
};

export default DeviceLabel;
