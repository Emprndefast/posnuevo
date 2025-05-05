import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { useBusiness } from './BusinessContext';

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
  const { isBusinessConfigured } = useBusiness();
  const navigate = useNavigate();
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
      printerComplete: printerConfig.isComplete,
      businessConfigured: isBusinessConfigured()
    });
    return printerConfig.isComplete;
  };

  // Cargar configuración desde Firestore
  const loadConfig = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      setError(null);

      const printerDocRef = doc(db, 'printer_config', user.uid);
      const printerDoc = await getDoc(printerDocRef);

      if (printerDoc.exists()) {
        const printerData = printerDoc.data();
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
      setError(err.message);
      console.error('Error al cargar la configuración:', err);
    } finally {
      setLoading(false);
    }
  };

  // Guardar configuración de la impresora
  const savePrinterConfig = async (data) => {
    if (!user?.uid) return;

    try {
      setError(null);
      const printerDocRef = doc(db, 'printer_config', user.uid);
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
      await setDoc(printerDocRef, newConfig, { merge: true });
      setPrinterConfig(newConfig);
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error al guardar la configuración de la impresora:', err);
      return false;
    }
  };

  useEffect(() => {
    if (user?.uid) {
      loadConfig();
    }
  }, [user?.uid]);

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