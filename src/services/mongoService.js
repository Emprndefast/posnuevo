/**
 * Servicio MongoDB - Servicio de compatibilidad para componentes que usaban Firebase
 * Este servicio mapea las funciones de Firebase al backend MongoDB
 */

import api from '../api/api';

class MongoService {
  constructor() {
    this.api = api;
  }

  /**
   * Obtener colección (equivalente a getCollection de Firebase)
   */
  async getCollection(collectionName, userId = null) {
    try {
      const endpoint = this.getEndpoint(collectionName);

      // Si hay userId, filtrar por usuario
      const url = userId ? `${endpoint}?userId=${userId}` : endpoint;

      const response = await this.api.get(url);
      return response.data.success ? response.data.data : [];
    } catch (error) {
      console.error(`Error al obtener colección ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Agregar documento (equivalente a addDocument de Firebase)
   */
  async addDocument(collectionName, data) {
    try {
      const endpoint = this.getEndpoint(collectionName);
      const response = await this.api.post(endpoint, data);
      return response.data.success ? response.data.data?.id || response.data.data?._id : null;
    } catch (error) {
      console.error(`Error al agregar documento a ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Actualizar documento (equivalente a updateDocument de Firebase)
   */
  async updateDocument(collectionName, docId, data) {
    try {
      const endpoint = this.getEndpoint(collectionName);
      const response = await this.api.patch(`${endpoint}/${docId}`, data);
      return response.data.success;
    } catch (error) {
      console.error(`Error al actualizar documento en ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Eliminar documento (equivalente a deleteDocument de Firebase)
   */
  async deleteDocument(collectionName, docId) {
    try {
      const endpoint = this.getEndpoint(collectionName);
      const url = `${endpoint}/${docId}`;
      console.log(`🗑️ MongoService: Eliminando documento - URL: ${url}`);

      const response = await this.api.delete(url);
      console.log('✅ MongoService: Respuesta del servidor:', response.data);

      return response.data.success;
    } catch (error) {
      console.error(`❌ MongoService: Error al eliminar documento de ${collectionName}:`, error);
      console.error('Detalles del error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Obtener documento por ID (equivalente a getDocument de Firebase)
   */
  async getDocument(collectionName, docId) {
    try {
      const endpoint = this.getEndpoint(collectionName);
      const response = await this.api.get(`${endpoint}/${docId}`);
      return response.data.success ? response.data.data : null;
    } catch (error) {
      console.error(`Error al obtener documento de ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Convertir nombre de colección de Firebase a endpoint de API
   */
  getEndpoint(collectionName) {
    const mapping = {
      'products': '/products',
      'sales': '/sales',
      'customers': '/customers',
      'users': '/auth/users',
      'repairs': '/repairs',
      'invoices': '/invoices',
      'analytics': '/analytics',
      'settings': '/settings',
      'business': '/settings/business',
      'print_logs': '/settings/print-logs'
    };

    return mapping[collectionName] || `/${collectionName}`;
  }

  /**
   * Upload file (equivalente a Firebase Storage)
   */
  async uploadFile(file, path = '') {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (path) formData.append('path', path);

      const response = await this.api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return response.data.success ? response.data.url : null;
    } catch (error) {
      console.error('Error al subir archivo:', error);
      throw error;
    }
  }

  /**
   * Subscribe to changes (mock para compatibilidad)
   */
  subscribe(collectionName, callback) {
    console.warn(`subscribe not fully implemented for ${collectionName} - using polling`);
    // TODO: Implementar websockets o polling
    return () => { }; // Return unsubscribe function
  }
}

export const mongoService = new MongoService();
export default mongoService;


