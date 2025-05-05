import api from '../config/api';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { app } from '../config/firebase';

const messaging = getMessaging(app);

const notificationService = {
  // Obtener token FCM
  getFCMToken: async () => {
    try {
      const token = await getToken(messaging, {
        vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY
      });
      return token;
    } catch (error) {
      console.error('Error al obtener token FCM:', error);
      throw error;
    }
  },

  // Registrar dispositivo para notificaciones
  registerDevice: async (userId) => {
    try {
      const fcmToken = await notificationService.getFCMToken();
      const response = await api.post('/notificaciones/registrar-dispositivo', {
        userId,
        fcmToken,
        platform: 'web'
      });
      return response.data;
    } catch (error) {
      console.error('Error al registrar dispositivo:', error);
      throw error;
    }
  },

  // Obtener preferencias de notificación
  getNotificationPreferences: async (userId) => {
    try {
      const response = await api.get(`/notificaciones/preferencias/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener preferencias:', error);
      throw error;
    }
  },

  // Actualizar preferencias de notificación
  updateNotificationPreferences: async (userId, preferences) => {
    try {
      const response = await api.put(`/notificaciones/preferencias/${userId}`, preferences);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar preferencias:', error);
      throw error;
    }
  },

  // Enviar notificación de prueba
  sendTestNotification: async (userId) => {
    try {
      const response = await api.post('/notificaciones/test', { userId });
      return response.data;
    } catch (error) {
      console.error('Error al enviar notificación de prueba:', error);
      throw error;
    }
  },

  // Configurar listener para mensajes en primer plano
  setupForegroundMessageHandler: (callback) => {
    onMessage(messaging, (payload) => {
      if (callback) {
        callback(payload);
      }
    });
  },

  // Enviar notificación de stock bajo
  sendLowStockNotification: async (productId, currentStock, minStock) => {
    try {
      const response = await api.post('/notificaciones/stock-bajo', {
        productId,
        currentStock,
        minStock
      });
      return response.data;
    } catch (error) {
      console.error('Error al enviar notificación de stock bajo:', error);
      throw error;
    }
  },

  // Enviar notificación de nueva venta
  sendNewSaleNotification: async (saleId, total) => {
    try {
      const response = await api.post('/notificaciones/nueva-venta', {
        saleId,
        total
      });
      return response.data;
    } catch (error) {
      console.error('Error al enviar notificación de nueva venta:', error);
      throw error;
    }
  },

  // Enviar recordatorio diario
  sendDailyReminder: async (data) => {
    try {
      const response = await api.post('/notificaciones/recordatorio-diario', data);
      return response.data;
    } catch (error) {
      console.error('Error al enviar recordatorio diario:', error);
      throw error;
    }
  }
};

export default notificationService; 