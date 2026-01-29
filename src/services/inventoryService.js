import api from '../config/api';
import telegramService from './telegramService';

class InventoryService {
  // Crear inventario inicial (Generalmente manejado al crear producto)
  async create(inventoryData) {
    // Esto podría ser redundante si el producto ya se crea con stock
    // Lo mantenemos por compatibilidad si se usa externamente
    return { ...inventoryData };
  }

  // Actualizar stock
  async updateStock(productId, quantity, config) {
    try {
      // Determinar tipo de movimiento basado en cantidad (aunque el backend espera tipo explícito)
      // Si la cantidad es positiva, es entrada? No, el frontend mandaba cantidad total o diferencia?
      // Revisando original: "const newStock = productData.stock + quantity;" -> quantity es diferencial
      // El backend updateStock espera: { cantidad, tipo: 'ajuste' | 'entrada' | 'salida' }
      // Pero 'ajuste' setea el valor absoluto. 'entrada' suma.

      // Para mantener compatibilidad con la firma anterior (diferencial),
      // Si quantity > 0 es entrada, si < 0 es salida.

      const tipo = quantity >= 0 ? 'entrada' : 'salida';
      const absQuantity = Math.abs(quantity);

      const response = await api.patch(`/products/${productId}/stock`, {
        cantidad: absQuantity,
        tipo: tipo,
        motivo: 'Actualización desde POS'
      });

      const updatedProduct = response.data.data;
      const newStock = updatedProduct.stock_actual;

      // Verificar alertas (Lógica mantenida en frontend por ahora para no migrar todo telegram al backend en este paso)
      if (config?.notifications?.lowStock && newStock <= updatedProduct.stock_minimo) {
        try {
          await telegramService.notifyLowStock({
            botToken: config.botToken,
            chatId: config.chatId,
            name: updatedProduct.nombre,
            currentStock: newStock,
            minStock: updatedProduct.stock_minimo
          });
        } catch (error) {
          console.error('Error notif stock bajo:', error);
        }
      }

      if (config?.notifications?.outOfStock && newStock === 0) {
        try {
          await telegramService.notifyOutOfStock({
            botToken: config.botToken,
            chatId: config.chatId,
            name: updatedProduct.nombre,
            code: updatedProduct.codigo
          });
        } catch (error) {
          console.error('Error notif stock agotado:', error);
        }
      }

      return {
        success: true,
        newStock,
        product: {
          id: updatedProduct._id,
          name: updatedProduct.nombre,
          stock: newStock,
          minStock: updatedProduct.stock_minimo
        }
      };

    } catch (error) {
      console.error('Error al actualizar stock:', error);
      throw error;
    }
  }

  // Obtener stock actual
  async getStock(productId) {
    try {
      const response = await api.get(`/products/${productId}`);
      return response.data.data.stock || 0;
    } catch (error) {
      console.error('Error al obtener stock:', error);
      // Fallback seguro
      return 0;
    }
  }

  // Obtener historial de inventario
  async getInventoryHistory(productId) {
    try {
      const response = await api.get(`/products/${productId}/history`);
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener historial:', error);
      throw error;
    }
  }

  // Registrar movimiento (Ahora lo hace el backend, pero mantenemos método dummy por compatibilidad)
  async recordMovement(productId, quantity, type, reason) {
    // El backend ya registra el movimiento al usar updateStock
    // Si se llama explícitamente, podríamos llamar a un endpoint, pero por ahora asumimos que el flujo principal usa updateStock
    console.log('Movimiento registrado en backend vía updateStock');
    return true;
  }

  // Ajustar stock (setear valor absoluto)
  async adjustStock(productId, newStock, reason) {
    try {
      const response = await api.patch(`/products/${productId}/stock`, {
        cantidad: newStock,
        tipo: 'ajuste',
        motivo: reason
      });
      return response.data.success;
    } catch (error) {
      console.error('Error al ajustar stock:', error);
      throw error;
    }
  }

  // Verificar stock bajo
  async checkLowStock(productId, config) {
    try {
      const response = await api.get(`/products/${productId}`);
      const product = response.data.data;

      const isLow = product.stock <= product.minStock;

      if (isLow && config?.notifications?.lowStock) {
        // Reutilizar lógica de notificación si es necesario
      }

      return {
        success: true,
        isLowStock: isLow,
        product
      };
    } catch (error) {
      return { success: false, error };
    }
  }
}

export default new InventoryService();