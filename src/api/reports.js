import api from './api';

// Obtener reporte de ventas por período
export const getSalesReport = async (startDate, endDate) => {
  const response = await api.get(`/reports/sales?startDate=${startDate}&endDate=${endDate}`);
  return response.data;
};

// Obtener reporte de productos más vendidos
export const getTopSellingProducts = async (limit = 10) => {
  const response = await api.get(`/reports/products/top-selling?limit=${limit}`);
  return response.data;
};

// Obtener reporte de inventario
export const getInventoryReport = async () => {
  const response = await api.get('/reports/inventory');
  return response.data;
};

// Obtener reporte de ganancias
export const getProfitReport = async (startDate, endDate) => {
  const response = await api.get(`/reports/profits?startDate=${startDate}&endDate=${endDate}`);
  return response.data;
};

// Obtener reporte de impuestos
export const getTaxReport = async (startDate, endDate) => {
  const response = await api.get(`/reports/taxes?startDate=${startDate}&endDate=${endDate}`);
  return response.data;
};

// Obtener estadísticas del dashboard
export const getDashboardStats = async () => {
  const response = await api.get('/reports/dashboard');
  return response.data;
};

// Obtener reporte de ventas por categoría
export const getSalesByCategory = async (startDate, endDate) => {
  const response = await api.get(`/reports/sales/by-category?startDate=${startDate}&endDate=${endDate}`);
  return response.data;
};

// Obtener reporte de devoluciones
export const getReturnsReport = async (startDate, endDate) => {
  const response = await api.get(`/reports/returns?startDate=${startDate}&endDate=${endDate}`);
  return response.data;
};

// Exportar reporte en formato específico (PDF, Excel, etc.)
export const exportReport = async (reportType, format, params) => {
  const response = await api.post('/reports/export', {
    reportType,
    format,
    ...params
  }, {
    responseType: 'blob'
  });
  return response.data;
}; 