import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/api';

const ClientesContext = createContext();

export function ClientesProvider({ children }) {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar clientes del backend MongoDB
  const loadClientes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/customers');
      setClientes(response.data.data || response.data || []);
    } catch (err) {
      console.error('Error loading customers:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar clientes al montar el componente
  useEffect(() => {
    loadClientes();
  }, [loadClientes]);

  // Crear nuevo cliente
  const agregarCliente = useCallback(async (clienteData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post('/customers', clienteData);
      const nuevoCliente = response.data.data || response.data;
      
      // Agregar al estado local
      setClientes(prev => [...prev, nuevoCliente]);
      return nuevoCliente;
    } catch (err) {
      console.error('Error creating customer:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar cliente existente
  const actualizarCliente = useCallback(async (clienteId, clienteData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.patch(`/customers/${clienteId}`, clienteData);
      
      // Actualizar en el estado local
      setClientes(prev => prev.map(c => 
        (c._id || c.id) === clienteId ? { ...c, ...clienteData } : c
      ));
      
      return response.data.data || response.data;
    } catch (err) {
      console.error('Error updating customer:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Eliminar cliente
  const eliminarCliente = useCallback(async (clienteId) => {
    try {
      setLoading(true);
      setError(null);
      await api.delete(`/customers/${clienteId}`);
      
      // Remover del estado local
      setClientes(prev => prev.filter(c => (c._id || c.id) !== clienteId));
      
      return true;
    } catch (err) {
      console.error('Error deleting customer:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    clientes,
    setClientes,
    loading,
    error,
    loadClientes,
    agregarCliente,
    actualizarCliente,
    eliminarCliente
  };

  return (
    <ClientesContext.Provider value={value}>
      {children}
    </ClientesContext.Provider>
  );
}

export function useClientes() {
  const context = useContext(ClientesContext);
  if (!context) {
    throw new Error('useClientes must be used within ClientesProvider');
  }
  return context;
} 