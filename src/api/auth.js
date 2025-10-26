import api from './api';

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  if (response.data && response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};

export const resetPassword = async (email) => {
  const response = await api.post('/auth/reset-password', { email });
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get('/auth/profile');
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await api.patch('/auth/profile', profileData);
  return response.data;
};

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

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await api.post('/uploads', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
}; 