import api from './api';

// Obtener todas las ventas
export const getSales = async () => {
  const response = await api.get('/sales');
  return response.data;
};

// Crear venta
export const createSale = async (saleData) => {
  const response = await api.post('/sales', saleData);
  return response.data;
};

// Obtener venta por ID
export const getSaleById = async (id) => {
  const response = await api.get(`/sales/${id}`);
  return response.data;
}; 