import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/api';
import { useAuth } from './AuthContextMongo';

const CrmContext = createContext();

export const useCrm = () => {
  const context = useContext(CrmContext);
  if (!context) {
    throw new Error('useCrm debe ser usado dentro de un CrmProvider');
  }
  return context;
};

export const CrmProvider = ({ children }) => {
  const { user } = useAuth() || {};
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar clientes del backend MongoDB
  const fetchCustomers = useCallback(async () => {
    if (!user?.id && !user?._id) {
      setCustomers([]);
      setLoading(false);
      return [];
    }
    
    setLoading(true);
    try {
      const response = await api.get('/customers');
      const customersData = response.data.data || response.data || [];
      setCustomers(customersData);
      setError(null);
      return customersData;
    } catch (err) {
      console.error('Error loading customers:', err);
      setError('Error al cargar los clientes');
      setCustomers([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Cargar clientes al montar el componente
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const createCustomer = async (customerData) => {
    if (!user?.id && !user?._id) throw new Error('Usuario no autenticado');
    
    try {
      const userId = user.id || user._id;
      const data = { 
        ...customerData, 
        userId, 
        createdAt: new Date(), 
        updatedAt: new Date() 
      };
      const response = await api.post('/customers', data);
      const newCustomer = response.data.data || response.data;
      setCustomers(prev => [...prev, newCustomer]);
      return newCustomer;
    } catch (err) {
      console.error('Error creating customer:', err);
      throw err;
    }
  };

  const updateCustomer = async (id, customerData) => {
    if (!user?.id && !user?._id) throw new Error('Usuario no autenticado');
    
    try {
      await api.patch(`/customers/${id}`, { 
        ...customerData, 
        updatedAt: new Date() 
      });
      setCustomers(prev => prev.map(c => 
        (c._id || c.id) === id ? { ...c, ...customerData } : c
      ));
    } catch (err) {
      console.error('Error updating customer:', err);
      throw err;
    }
  };

  const deleteCustomer = async (id) => {
    if (!user?.id && !user?._id) throw new Error('Usuario no autenticado');
    
    try {
      await api.delete(`/customers/${id}`);
      setCustomers(prev => prev.filter(c => (c._id || c.id) !== id));
    } catch (err) {
      console.error('Error deleting customer:', err);
      throw err;
    }
  };

  // Subcolecciones - Implementaciones simplificadas
  const addFollowUp = async (customerId, followUpData) => {
    // TODO: Implementar en backend si es necesario
    console.warn('addFollowUp not fully implemented yet');
  };

  const getFollowUps = async (customerId) => {
    // TODO: Implementar en backend si es necesario
    return [];
  };

  const addTask = async (customerId, taskData) => {
    // TODO: Implementar en backend si es necesario
    console.warn('addTask not fully implemented yet');
  };

  const getTasks = async (customerId) => {
    // TODO: Implementar en backend si es necesario
    return [];
  };

  const addNote = async (customerId, noteData) => {
    // TODO: Implementar en backend si es necesario
    console.warn('addNote not fully implemented yet');
  };

  const getNotes = async (customerId) => {
    // TODO: Implementar en backend si es necesario
    return [];
  };

  const value = {
    customers,
    loading,
    error,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    addFollowUp,
    getFollowUps,
    addTask,
    getTasks,
    addNote,
    getNotes
  };

  return (
    <CrmContext.Provider value={value}>
      {children}
    </CrmContext.Provider>
  );
};
