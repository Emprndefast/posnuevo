import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useConfig } from '../../context/ConfigContext';
import { useBusiness } from '../../context/BusinessContext';

const ConfigGuard = ({ children }) => {
  const { isConfigComplete, loading: configLoading } = useConfig();
  const { isBusinessConfigured, loading: businessLoading, businessData } = useBusiness();
  const location = useLocation();

  useEffect(() => {
    console.log('ConfigGuard - Estado actual:', {
      configLoading,
      businessLoading,
      path: location.pathname,
      isConfigComplete: isConfigComplete(),
      isBusinessConfigured: isBusinessConfigured(),
      businessData
    });
  }, [configLoading, businessLoading, location.pathname, isConfigComplete, isBusinessConfigured, businessData]);

  // No redirigir si estamos en el asistente o cargando
  if (configLoading || businessLoading) {
    console.log('ConfigGuard - Cargando...', { configLoading, businessLoading });
    return children;
  }

  if (location.pathname === '/setup-wizard') {
    console.log('ConfigGuard - En el asistente de configuración');
    return children;
  }

  // Redirigir al asistente si la configuración no está completa
  const configComplete = isConfigComplete();
  const businessConfigured = isBusinessConfigured();

  if (!configComplete || !businessConfigured) {
    console.log('ConfigGuard - Configuración incompleta, redirigiendo:', {
      configComplete,
      businessConfigured,
      businessData
    });
    return <Navigate to="/setup-wizard" replace />;
  }

  console.log('ConfigGuard - Configuración completa, permitiendo acceso');
  return children;
};

export default ConfigGuard; 