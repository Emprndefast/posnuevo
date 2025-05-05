import api from './api';

// Obtener todos los proveedores
export const getSuppliers = async () => {
  const response = await api.get('/suppliers');
  return response.data;
};

// Obtener un proveedor específico
export const getSupplier = async (supplierId) => {
  const response = await api.get(`/suppliers/${supplierId}`);
  return response.data;
};

// Crear un nuevo proveedor
export const createSupplier = async (supplierData) => {
  const response = await api.post('/suppliers', supplierData);
  return response.data;
};

// Actualizar un proveedor
export const updateSupplier = async (supplierId, supplierData) => {
  const response = await api.patch(`/suppliers/${supplierId}`, supplierData);
  return response.data;
};

// Eliminar un proveedor
export const deleteSupplier = async (supplierId) => {
  const response = await api.delete(`/suppliers/${supplierId}`);
  return response.data;
};

// Obtener productos de un proveedor
export const getSupplierProducts = async (supplierId) => {
  const response = await api.get(`/suppliers/${supplierId}/products`);
  return response.data;
};

// Obtener historial de compras de un proveedor
export const getSupplierPurchaseHistory = async (supplierId, filters = {}) => {
  const response = await api.get(`/suppliers/${supplierId}/purchases`, { params: filters });
  return response.data;
};

// Registrar una compra a proveedor
export const registerPurchase = async (supplierId, purchaseData) => {
  const response = await api.post(`/suppliers/${supplierId}/purchases`, purchaseData);
  return response.data;
};

// Actualizar estado de pago de una compra
export const updatePurchasePaymentStatus = async (supplierId, purchaseId, paymentData) => {
  const response = await api.patch(`/suppliers/${supplierId}/purchases/${purchaseId}/payment`, paymentData);
  return response.data;
};

// Obtener balance con proveedor
export const getSupplierBalance = async (supplierId) => {
  const response = await api.get(`/suppliers/${supplierId}/balance`);
  return response.data;
}; 