import api from './api';

// Obtener todos los clientes
export const getCustomers = async () => {
  const response = await api.get('/customers');
  return response.data;
};

// Crear nuevo cliente
export const createCustomer = async (customerData) => {
  const response = await api.post('/customers', customerData);
  return response.data;
};

// Actualizar cliente
export const updateCustomer = async (id, customerData) => {
  const response = await api.patch(`/customers/${id}`, customerData);
  return response.data;
};

// Eliminar cliente
export const deleteCustomer = async (id) => {
  const response = await api.delete(`/customers/${id}`);
  return response.data;
};

// Buscar clientes
export const searchCustomers = async (query) => {
  const response = await api.get(`/customers/search?q=${query}`);
  return response.data;
};

// Obtener historial de compras de un cliente
export const getCustomerPurchaseHistory = async (id) => {
  const response = await api.get(`/customers/${id}/purchases`);
  return response.data;
};

// Obtener balance de cuenta de un cliente
export const getCustomerBalance = async (id) => {
  const response = await api.get(`/customers/${id}/balance`);
  return response.data;
};

// Registrar pago de cliente
export const registerCustomerPayment = async (id, paymentData) => {
  const response = await api.post(`/customers/${id}/payments`, paymentData);
  return response.data;
}; 