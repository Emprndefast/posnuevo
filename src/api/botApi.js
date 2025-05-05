import api from './api';

// Endpoints de inventario
export const getInventory = async (userId) => {
  const response = await api.get(`/api/inventario?usuario_id=${userId}`);
  return response.data;
};

export const getLowStockItems = async (userId) => {
  const response = await api.get(`/api/inventario/stock_bajo?usuario_id=${userId}`);
  return response.data;
};

// Endpoints de ventas
export const getTodaySalesSummary = async (userId) => {
  const response = await api.get(`/api/ventas/resumen_hoy?usuario_id=${userId}`);
  return response.data;
};

export const getTopProducts = async (userId) => {
  const response = await api.get(`/api/ventas/top_productos?usuario_id=${userId}`);
  return response.data;
};

export const getSalesByPeriod = async (userId, startDate, endDate) => {
  const response = await api.get(`/api/ventas/periodo?usuario_id=${userId}&fecha_inicio=${startDate}&fecha_fin=${endDate}`);
  return response.data;
};

// Endpoints de clientes
export const getCustomers = async (userId) => {
  const response = await api.get(`/api/clientes?usuario_id=${userId}`);
  return response.data;
};

export const getFrequentCustomers = async (userId) => {
  const response = await api.get(`/api/clientes/frecuentes?usuario_id=${userId}`);
  return response.data;
};

export const getCustomerStats = async (userId) => {
  const response = await api.get(`/api/clientes/estadisticas?usuario_id=${userId}`);
  return response.data;
}; 