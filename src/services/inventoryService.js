import api from '../api/api';

const inventoryService = {
  /**
   * Obtener stock de una sucursal
   * @param {string} branchId 
   * @param {object} params { page, limit }
   */
  getStockByBranch: async (branchId, params) => {
    try {
      const response = await api.get(`/inventory/branch/${branchId}`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching stock:', error);
      throw error;
    }
  },

  /**
   * Ajustar stock manualmente
   * @param {object} data { product_id, branch_id, cantidad, tipo, motivo }
   */
  adjustStock: async (data) => {
    try {
      const response = await api.post('/inventory/adjust', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Transferir entre sucursales
   * @param {object} data { product_id, origin_branch_id, destination_branch_id, cantidad, motivo }
   */
  transferStock: async (data) => {
    try {
      const response = await api.post('/inventory/transfer', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtener historial de movimientos
   * @param {object} params 
   */
  getMovementHistory: async (params) => {
    try {
      const response = await api.get('/inventory/movements', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
  * Actualizar configuración de stock
  * @param {object} data { product_id, branch_id, min_stock, max_stock, ... }
  */
  updateStockSettings: async (data) => {
    try {
      const response = await api.put('/inventory/config', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default inventoryService;