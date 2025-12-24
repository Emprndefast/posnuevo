import api from './api';

// Obtener todos los productos
export const getProducts = async () => {
  const response = await api.get('/products');
  return response.data;
};

// Crear producto
export const createProduct = async (productData) => {
  const response = await api.post('/products', productData);
  return response.data;
};

// Actualizar producto
export const updateProduct = async (id, productData) => {
  const response = await api.patch(`/products/${id}`, productData);
  return response.data;
};

// Eliminar producto
export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

// Importación masiva
export const bulkImport = async (products) => {
  const response = await api.post('/products/bulk-import', { products });
  return response.data;
};