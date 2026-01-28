import api from '../api/api';

class PromotionService {
  // Crear promoción
  async createPromotion(promotionData) {
    try {
      const response = await api.post('/promotions', promotionData);
      return response.data.promotion;
    } catch (error) {
      console.error('Error al crear promoción:', error);
      throw error;
    }
  }

  // Obtener todas las promociones del usuario
  async getPromotions(page = 1, limit = 10) {
    try {
      const response = await api.get(`/promotions?page=${page}&limit=${limit}`);
      return response.data.promotions;
    } catch (error) {
      console.error('Error al obtener promociones:', error);
      throw error;
    }
  }

  // Obtener promociones activas
  async getActivePromotions() {
    try {
      const response = await api.get('/promotions/activas/lista');
      return response.data.promotions;
    } catch (error) {
      console.error('Error al obtener promociones activas:', error);
      throw error;
    }
  }

  // Actualizar promoción
  async updatePromotion(promotionId, promotionData) {
    try {
      const response = await api.put(`/promotions/${promotionId}`, promotionData);
      return response.data.promotion;
    } catch (error) {
      console.error('Error al actualizar promoción:', error);
      throw error;
    }
  }

  // Eliminar promoción
  async deletePromotion(promotionId) {
    try {
      await api.delete(`/promotions/${promotionId}`);
    } catch (error) {
      console.error('Error al eliminar promoción:', error);
      throw error;
    }
  }

  // Validar cupón
  async validateCoupon(codigo, total) {
    try {
      const response = await api.post('/promotions/cupones/validar', {
        codigo,
        total
      });
      return response.data;
    } catch (error) {
      console.error('Error al validar cupón:', error);
      throw error;
    }
  }

  // Usar cupón
  async useCoupon(couponId) {
    try {
      const response = await api.post(`/promotions/cupones/${couponId}/usar`);
      return response.data;
    } catch (error) {
      console.error('Error al usar cupón:', error);
      throw error;
    }
  }

  // Aplicar promociones a venta
  async applyPromotionsToSale(productos, total) {
    try {
      const response = await api.post('/promotions/aplicar', {
        productos,
        total
      });
      return response.data;
    } catch (error) {
      console.error('Error al aplicar promociones:', error);
      throw error;
    }
  }

  // Obtener estadísticas
  async getPromotionStats() {
    try {
      const response = await api.get('/promotions/stats/general');
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  }

  // Activar/Desactivar promoción
  async togglePromotion(promotionId) {
    try {
      const response = await api.patch(`/promotions/${promotionId}/toggle`);
      return response.data.promotion;
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      throw error;
    }
  }
}

export default new PromotionService(); 