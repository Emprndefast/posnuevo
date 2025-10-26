import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/api';

const VentasContext = createContext();

export function VentasProvider({ children }) {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar ventas del backend MongoDB
  const loadVentas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/sales');
      setVentas(response.data.data || response.data || []);
    } catch (err) {
      console.error('Error loading sales:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar ventas al montar el componente
  useEffect(() => {
    loadVentas();
  }, [loadVentas]);

  // Crear nueva venta
  const agregarVenta = useCallback(async (ventaData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post('/sales', ventaData);
      const nuevaVenta = response.data.data || response.data;
      
      // Agregar al estado local
      setVentas(prev => [...prev, nuevaVenta]);
      return nuevaVenta;
    } catch (err) {
      console.error('Error creating sale:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar venta existente
  const actualizarVenta = useCallback(async (ventaId, ventaData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.patch(`/sales/${ventaId}`, ventaData);
      
      // Actualizar en el estado local
      setVentas(prev => prev.map(v => 
        (v._id || v.id) === ventaId ? { ...v, ...ventaData } : v
      ));
      
      return response.data.data || response.data;
    } catch (err) {
      console.error('Error updating sale:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Eliminar venta
  const eliminarVenta = useCallback(async (ventaId) => {
    try {
      setLoading(true);
      setError(null);
      await api.delete(`/sales/${ventaId}`);
      
      // Remover del estado local
      setVentas(prev => prev.filter(v => (v._id || v.id) !== ventaId));
      
      return true;
    } catch (err) {
      console.error('Error deleting sale:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    ventas,
    setVentas,
    loading,
    error,
    loadVentas,
    agregarVenta,
    actualizarVenta,
    eliminarVenta
  };

  return (
    <VentasContext.Provider value={value}>
      {children}
    </VentasContext.Provider>
  );
}

export function useVentas() {
  const context = useContext(VentasContext);
  if (!context) {
    throw new Error('useVentas must be used within VentasProvider');
  }
  return context;
} 