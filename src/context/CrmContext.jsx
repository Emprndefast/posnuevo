import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../config/api';

const CrmContext = createContext();

export const useCrm = () => {
  const context = useContext(CrmContext);
  if (!context) {
    throw new Error('useCrm debe ser usado dentro de un CrmProvider');
  }
  return context;
};

export const CrmProvider = ({ children }) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/crm/customers');
      setCustomers(res.data);
      setError(null);
    } catch (err) {
      console.error('Error al cargar clientes CRM:', err);
      setError('Error al cargar los clientes');
    } finally {
      setLoading(false);
    }
  };

  const createCustomer = async (customerData) => {
    try {
      const res = await api.post('/api/crm/customers', customerData);
      setCustomers(prev => [...prev, res.data]);
      return res.data;
    } catch (err) {
      console.error('Error al crear cliente CRM:', err);
      throw err;
    }
  };

  const updateCustomer = async (id, customerData) => {
    try {
      await api.put(`/api/crm/customers/${id}`, customerData);
      setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...customerData } : c));
    } catch (err) {
      console.error('Error al actualizar cliente CRM:', err);
      throw err;
    }
  };

  const addFollowUp = async (customerId, followUpData) => {
    try {
      await api.post(`/api/crm/customers/${customerId}/followups`, followUpData);
    } catch (err) {
      console.error('Error al agregar seguimiento:', err);
      throw err;
    }
  };

  const addTask = async (customerId, taskData) => {
    try {
      await api.post(`/api/crm/customers/${customerId}/tasks`, taskData);
    } catch (err) {
      console.error('Error al agregar tarea:', err);
      throw err;
    }
  };

  const addNote = async (customerId, noteData) => {
    try {
      await api.post(`/api/crm/customers/${customerId}/notes`, noteData);
    } catch (err) {
      console.error('Error al agregar nota:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const value = {
    customers,
    loading,
    error,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    addFollowUp,
    addTask,
    addNote
  };

  return (
    <CrmContext.Provider value={value}>
      {children}
    </CrmContext.Provider>
  );
}; 