import React, { useState, useEffect } from 'react';
import barcodeService from '../services/barcodeService';
import { toast } from 'react-toastify';

const BarcodeReader = ({ onScan }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isReading, setIsReading] = useState(false);

  useEffect(() => {
    return () => {
      // Limpiar al desmontar
      barcodeService.close();
    };
  }, []);

  const handleConnect = async () => {
    try {
      await barcodeService.initialize();
      setIsConnected(true);
      toast.success('Lector de código de barras conectado');
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    }
  };

  const handleStartReading = () => {
    barcodeService.startReading();
    setIsReading(true);
    toast.info('Iniciando lectura de códigos de barras');
  };

  const handleStopReading = () => {
    barcodeService.stopReading();
    setIsReading(false);
    toast.info('Lectura detenida');
  };

  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = barcodeService.subscribe((barcode) => {
      if (onScan) {
        onScan(barcode);
      }
    });

    return () => unsubscribe();
  }, [isConnected, onScan]);

  return (
    <div className="barcode-reader">
      <h3>Lector de Código de Barras</h3>
      
      {!isConnected ? (
        <button 
          onClick={handleConnect}
          className="btn btn-primary"
        >
          Conectar Lector
        </button>
      ) : (
        <div className="controls">
          {!isReading ? (
            <button 
              onClick={handleStartReading}
              className="btn btn-success"
            >
              Iniciar Lectura
            </button>
          ) : (
            <button 
              onClick={handleStopReading}
              className="btn btn-danger"
            >
              Detener Lectura
            </button>
          )}
        </div>
      )}

      <style jsx>{`
        .barcode-reader {
          padding: 1rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          margin: 1rem 0;
        }
        
        .controls {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }
        
        button {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
        }
        
        .btn-primary {
          background-color: #007bff;
          color: white;
        }
        
        .btn-success {
          background-color: #28a745;
          color: white;
        }
        
        .btn-danger {
          background-color: #dc3545;
          color: white;
        }
      `}</style>
    </div>
  );
};

export default BarcodeReader; 