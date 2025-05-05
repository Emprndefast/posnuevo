import React, { createContext, useContext, useState, useEffect } from 'react';

const PrinterContext = createContext();

export const usePrinter = () => {
  const context = useContext(PrinterContext);
  if (!context) {
    throw new Error('usePrinter debe ser usado dentro de un PrinterProvider');
  }
  return context;
};

export const PrinterProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [printerConfig, setPrinterConfig] = useState({
    type: 'thermal',
    connection: 'usb',
    model: '',
    paperWidth: '80',
    autocut: true,
    ipAddress: '',
    port: '9100'
  });
  const [error, setError] = useState(null);

  // Función para conectar con la impresora
  const connectPrinter = async (config) => {
    try {
      setError(null);
      // Aquí iría la lógica de conexión real con la impresora
      // Por ahora simulamos una conexión exitosa
      setPrinterConfig(config);
      setIsConnected(true);
      return true;
    } catch (err) {
      setError(err.message);
      setIsConnected(false);
      return false;
    }
  };

  // Función para desconectar la impresora
  const disconnectPrinter = () => {
    setIsConnected(false);
    setError(null);
  };

  // Función para actualizar la configuración
  const updateConfig = (newConfig) => {
    setPrinterConfig(prev => ({
      ...prev,
      ...newConfig
    }));
  };

  const value = {
    isConnected,
    printerConfig,
    error,
    connectPrinter,
    disconnectPrinter,
    updateConfig
  };

  return (
    <PrinterContext.Provider value={value}>
      {children}
    </PrinterContext.Provider>
  );
}; 