import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from './AuthContextMongo';

const ConfigContext = createContext();

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig debe ser usado dentro de un ConfigProvider');
  }
  return context;
};

export const ConfigProvider = ({ children }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [printerConfig, setPrinterConfig] = useState({
    printerType: '',
    model: '',
    connection: '',
    ipAddress: '',
    port: '',
    paperWidth: '',
    autocut: true,
    isComplete: false
  });

  // Verificar si la configuración está completa
  const isConfigComplete = () => {
    console.log('ConfigContext - Verificando configuración completa:', {
      printerComplete: printerConfig.isComplete
    });
    return printerConfig.isComplete;
  };

  // Cargar configuración desde MongoDB backend
  const loadConfig = async () => {
    if (!user?.id && !user?._id) return;

    try {
      setLoading(true);
      setError(null);

      const response = await api.get('/settings/printer');
      const printerData = response.data.data || response.data;

      if (printerData) {
        console.log('ConfigContext - Datos de impresora cargados:', printerData);
        setPrinterConfig({
          ...printerData,
          isComplete: Boolean(
            printerData.printerType &&
            printerData.model &&
            printerData.connection
          )
        });
      }
    } catch (err) {
      console.warn('No printer config found, using defaults');
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  // Guardar configuración de la impresora
  const savePrinterConfig = async (data) => {
    if (!user?.id && !user?._id) return;

    try {
      setError(null);
      const newConfig = {
        ...data,
        updatedAt: new Date(),
        isComplete: Boolean(
          data.printerType &&
          data.model &&
          data.connection
        )
      };

      console.log('ConfigContext - Guardando configuración de impresora:', newConfig);
      await api.post('/settings/printer', newConfig);
      setPrinterConfig(newConfig);
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error al guardar la configuración de la impresora:', err);
      return false;
    }
  };

  useEffect(() => {
    if (user?.id || user?._id) {
      loadConfig();
    }
  }, [user?.id, user?._id]);

  const value = {
    loading,
    error,
    printerConfig,
    isConfigComplete,
    savePrinterConfig
  };

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
}; 