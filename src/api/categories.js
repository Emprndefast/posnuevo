import api from './api';

// Obtener todas las categorías
export const getCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

// Obtener una categoría específica
export const getCategory = async (categoryId) => {
  const response = await api.get(`/categories/${categoryId}`);
  return response.data;
};

// Crear una nueva categoría
export const createCategory = async (categoryData) => {
  const response = await api.post('/categories', categoryData);
  return response.data;
};

// Actualizar una categoría
export const updateCategory = async (categoryId, categoryData) => {
  const response = await api.patch(`/categories/${categoryId}`, categoryData);
  return response.data;
};

// Eliminar una categoría
export const deleteCategory = async (categoryId) => {
  const response = await api.delete(`/categories/${categoryId}`);
  return response.data;
};

// Obtener productos por categoría
export const getProductsByCategory = async (categoryId) => {
  const response = await api.get(`/categories/${categoryId}/products`);
  return response.data;
};

// Asignar productos a una categoría
export const assignProductsToCategory = async (categoryId, productIds) => {
  const response = await api.post(`/categories/${categoryId}/products`, { productIds });
  return response.data;
};

// Remover productos de una categoría
export const removeProductsFromCategory = async (categoryId, productIds) => {
  const response = await api.delete(`/categories/${categoryId}/products`, { data: { productIds } });
  return response.data;
};

// Reordenar categorías
export const reorderCategories = async (orderData) => {
  const response = await api.patch('/categories/reorder', orderData);
  return response.data;
}; 