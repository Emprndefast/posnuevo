import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/api';
import { useAuth } from './AuthContextMongo';

const BusinessContext = createContext();

export const useBusiness = () => {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error('useBusiness debe ser usado dentro de un BusinessProvider');
  }
  return context;
};

export const BusinessProvider = ({ children }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estado para los datos del negocio
  const [businessData, setBusinessData] = useState({
    name: '',
    legalName: '',
    address: '',
    phone: '',
    email: '',
    taxId: '',
    logo: '',
    website: '',
    socialMedia: {
      facebook: '',
      instagram: '',
      twitter: ''
    },
    additionalInfo: '',
    isConfigured: false
  });

  // Cargar datos del negocio
  const loadBusinessData = useCallback(async () => {
    if (!user?.uid) {
      console.log('No hay usuario autenticado para cargar datos');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('Intentando cargar datos del negocio');

      const response = await api.get('/settings/business');
      const data = response.data.data || response.data;

      if (data) {
        console.log('Datos del negocio cargados:', data);
        const isConfigured = Boolean(
          data.name &&
          data.address &&
          data.phone &&
          data.email
        );
        console.log('Estado de configuración:', isConfigured);

        setBusinessData({
          ...data,
          isConfigured
        });
      } else {
        console.log('No existen datos del negocio para este usuario');
      }
    } catch (err) {
      console.warn('No business data found, using defaults');
      setError(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Guardar datos del negocio
  const saveBusinessData = async (data) => {
    if (!user?.uid) {
      console.log('No hay usuario autenticado para guardar datos');
      return false;
    }

    try {
      setError(null);
      console.log('Intentando guardar datos del negocio:', data);

      const isConfigured = Boolean(
        data.name &&
        data.address &&
        data.phone &&
        data.email
      );

      const updatedData = {
        ...data,
        updatedAt: new Date(),
        isConfigured
      };

      console.log('Guardando datos actualizados:', updatedData);
      await api.post('/settings/business', updatedData);
      console.log('Datos guardados exitosamente');

      setBusinessData(updatedData);
      return true;
    } catch (err) {
      setError('Error al guardar los datos del negocio: ' + err.message);
      console.error('Error al guardar los datos del negocio:', err);
      return false;
    }
  };

  // Verificar si la configuración está completa
  const isBusinessConfigured = () => {
    const configured = businessData.isConfigured;
    console.log('Verificando configuración del negocio:', {
      isConfigured: configured,
      businessData
    });
    return configured;
  };

  useEffect(() => {
    console.log('BusinessProvider: useEffect - Usuario actual:', user?.uid);
    loadBusinessData();
  }, [loadBusinessData]);

  const value = {
    loading,
    error,
    businessData,
    saveBusinessData,
    isBusinessConfigured,
    loadBusinessData
  };

  return (
    <BusinessContext.Provider value={value}>
      {children}
    </BusinessContext.Provider>
  );
};

export default BusinessProvider;
