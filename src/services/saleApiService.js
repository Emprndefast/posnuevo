import api from '../config/api';
import { notificationService } from '../notifications/notificationService';

// Servicio para gestionar ventas a través de la API
const saleApiService = {
  // Obtener todas las ventas
  getAllSales: async () => {
    try {
      const response = await api.get('/ventas');
      return response.data;
    } catch (error) {
      console.error('Error al obtener ventas:', error);
      throw error;
    }
  },

  // Obtener una venta por ID
  getSaleById: async (id) => {
    try {
      const response = await api.get(`/ventas/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener venta con ID ${id}:`, error);
      throw error;
    }
  },

  // Crear una nueva venta
  createSale: async (saleData) => {
    try {
      const response = await api.post('/ventas', saleData);
      
      // Notificación de venta: el servidor se encargará de enviar la notificación tras guardar la venta
      console.log('🔔 La notificación de venta será enviada por el servidor (evitando duplicados).');
      
      return response.data;
    } catch (error) {
      console.error('Error al crear venta:', error);
      throw error;
    }
  },

  // Actualizar una venta
  updateSale: async (id, saleData) => {
    try {
      const response = await api.put(`/ventas/${id}`, saleData);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar venta con ID ${id}:`, error);
      throw error;
    }
  },

  // Eliminar una venta
  deleteSale: async (id) => {
    try {
      const response = await api.delete(`/ventas/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al eliminar venta con ID ${id}:`, error);
      throw error;
    }
  },

  // Obtener ventas por rango de fechas
  getSalesByDateRange: async (startDate, endDate) => {
    try {
      const response = await api.get('/ventas', {
        params: {
          startDate,
          endDate
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener ventas por rango de fechas:', error);
      throw error;
    }
  }
};

export default saleApiService; 