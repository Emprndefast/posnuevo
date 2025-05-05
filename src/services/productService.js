import api, { API_ENDPOINTS } from '../config/api';
import { notificationService } from '../notifications/notificationService';

// Servicio para gestionar productos
class ProductService {
  // Obtener todos los productos
  async getProducts() {
    try {
      const response = await api.get(API_ENDPOINTS.PRODUCTS.LIST);
      return response.data;
    } catch (error) {
      console.error('Error al obtener productos:', error);
      throw error;
    }
  }

  // Obtener un producto por ID
  async getProductById(id) {
    try {
      const response = await api.get(API_ENDPOINTS.PRODUCTS.LIST + `/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener producto con ID ${id}:`, error);
      throw error;
    }
  }

  // Crear un nuevo producto
  async createProduct(productData) {
    try {
      const response = await api.post(API_ENDPOINTS.PRODUCTS.CREATE, productData);
      
      // Enviar notificación de nuevo producto
      try {
        await notificationService.notifyNewProduct({
          userId: localStorage.getItem('userId') || 'user123',
          productData: {
            id: response.data.id,
            name: productData.name,
            price: productData.price,
            category: productData.category
          }
        });
      } catch (notificationError) {
        console.error('Error al enviar notificación de nuevo producto:', notificationError);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error al crear producto:', error);
      throw error;
    }
  }

  // Actualizar un producto
  async updateProduct(id, productData) {
    try {
      const response = await api.put(API_ENDPOINTS.PRODUCTS.UPDATE.replace(':id', id), productData);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar producto con ID ${id}:`, error);
      throw error;
    }
  }

  // Eliminar un producto
  async deleteProduct(id) {
    try {
      const response = await api.delete(API_ENDPOINTS.PRODUCTS.DELETE.replace(':id', id));
      return response.data;
    } catch (error) {
      console.error(`Error al eliminar producto con ID ${id}:`, error);
      throw error;
    }
  }

  // Verificar stock bajo
  async checkLowStock(productId, currentStock, minStock) {
    if (currentStock <= minStock) {
      try {
        await notificationService.notifyStockAlert({
          userId: localStorage.getItem('userId') || 'user123',
          stockData: {
            productId,
            productName: 'Producto', // Esto debería ser el nombre real del producto
            currentStock,
            minStock
          }
        });
      } catch (error) {
        console.error('Error al enviar notificación de stock bajo:', error);
      }
    }
  }

  // Obtener productos por categoría
  async getProductsByCategory(categoria) {
    try {
      const response = await api.get(`/productos/categoria/${categoria}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener productos de la categoría ${categoria}:`, error);
      throw error;
    }
  }

  // Obtener productos con stock bajo
  async getLowStockProducts() {
    try {
      const response = await api.get('/productos/stock/bajo');
      return response.data;
    } catch (error) {
      console.error('Error al obtener productos con stock bajo:', error);
      throw error;
    }
  }

  async searchProducts(query) {
    try {
      const response = await api.get(API_ENDPOINTS.PRODUCTS.LIST, {
        params: { search: query }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export const productService = new ProductService(); 