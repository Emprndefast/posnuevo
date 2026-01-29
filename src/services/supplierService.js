import api from '../config/api';

class SupplierService {
  // Agregar proveedor
  async addSupplier(supplierData) {
    try {
      const response = await api.post('/suppliers', supplierData);
      return response.data.data.id;
    } catch (error) {
      console.error('Error al agregar proveedor:', error);
      throw error;
    }
  }

  // Actualizar proveedor
  async updateSupplier(supplierId, supplierData) {
    try {
      await api.put(`/suppliers/${supplierId}`, supplierData);
      return true;
    } catch (error) {
      console.error('Error al actualizar proveedor:', error);
      throw error;
    }
  }

  // Eliminar proveedor
  async deleteSupplier(supplierId) {
    try {
      await api.delete(`/suppliers/${supplierId}`);
      return true;
    } catch (error) {
      console.error('Error al eliminar proveedor:', error);
      throw error;
    }
  }

  // Obtener proveedores
  async getSuppliers(filters = {}) {
    try {
      const params = {};
      if (filters.isActive !== undefined) {
        params.activo = filters.isActive;
      }

      const response = await api.get('/suppliers', { params });
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener proveedores:', error);
      throw error;
    }
  }

  // Obtener un proveedor por ID
  async getSupplierById(supplierId) {
    try {
      const response = await api.get(`/suppliers/${supplierId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener proveedor:', error);
      throw error;
    }
  }

  // Obtener productos de un proveedor
  async getSupplierProducts(supplierId) {
    try {
      const response = await api.get(`/suppliers/${supplierId}/products`);
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener productos del proveedor:', error);
      throw error;
    }
  }
}

export default new SupplierService();