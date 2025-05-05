import api from './api';

// Obtener todo el inventario
export const getInventory = async () => {
  const response = await api.get('/inventory');
  return response.data;
};

// Obtener un item específico del inventario
export const getInventoryItem = async (itemId) => {
  const response = await api.get(`/inventory/${itemId}`);
  return response.data;
};

// Actualizar stock de un item
export const updateStock = async (itemId, quantity) => {
  const response = await api.patch(`/inventory/${itemId}/stock`, { quantity });
  return response.data;
};

// Ajustar stock (para correcciones)
export const adjustStock = async (itemId, adjustment, reason) => {
  const response = await api.post(`/inventory/${itemId}/adjust`, { adjustment, reason });
  return response.data;
};

// Registrar movimiento de stock
export const registerStockMovement = async (movement) => {
  const response = await api.post('/inventory/movements', movement);
  return response.data;
};

// Obtener historial de movimientos
export const getStockMovements = async (filters) => {
  const response = await api.get('/inventory/movements', { params: filters });
  return response.data;
};

// Obtener productos con bajo stock
export const getLowStockItems = async () => {
  const response = await api.get('/inventory/low-stock');
  return response.data;
};

// Obtener productos agotados
export const getOutOfStockItems = async () => {
  const response = await api.get('/inventory/out-of-stock');
  return response.data;
};

// Realizar conteo de inventario
export const submitInventoryCount = async (count) => {
  const response = await api.post('/inventory/count', count);
  return response.data;
};

// Obtener historial de conteos de inventario
export const getInventoryCounts = async () => {
  const response = await api.get('/inventory/counts');
  return response.data;
};

// Generar reporte de inventario
export const generateInventoryReport = async (params) => {
  const response = await api.get('/inventory/report', { params });
  return response.data;
};

// Configurar alertas de stock
export const setStockAlerts = async (itemId, alerts) => {
  const response = await api.patch(`/inventory/${itemId}/alerts`, alerts);
  return response.data;
};

// Registrar movimiento de inventario
export const registerInventoryMovement = async (movementData) => {
  const response = await api.post('/inventory/movements', movementData);
  return response.data;
};

// Obtener historial de movimientos
export const getInventoryMovements = async (filters = {}) => {
  const response = await api.get('/inventory/movements', { params: filters });
  return response.data;
};

// Realizar ajuste de inventario
export const makeInventoryAdjustment = async (adjustmentData) => {
  const response = await api.post('/inventory/adjustments', adjustmentData);
  return response.data;
};

// Obtener alertas de stock bajo
export const getLowStockAlerts = async () => {
  const response = await api.get('/inventory/alerts/low-stock');
  return response.data;
}; 