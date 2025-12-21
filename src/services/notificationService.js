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
  },

  // ===== NUEVAS FUNCIONES DE NOTIFICACIÓN MEJORADAS =====

  /**
   * Notificación nativa del navegador (desktop)
   */
  notifyDesktop: (options = {}) => {
    if (!('Notification' in window)) {
      console.warn('Notificaciones del navegador no soportadas');
      return;
    }

    if (Notification.permission === 'granted') {
      const {
        title = 'Notificación',
        body = '',
        icon = '/logo192.png',
        tag = 'default',
        requireInteraction = false
      } = options;

      const notification = new Notification(title, {
        body,
        icon,
        tag,
        requireInteraction,
        badge: icon
      });

      // Cerrar automáticamente después de 5s si no requiere interacción
      if (!requireInteraction) {
        setTimeout(() => notification.close(), 5000);
      }

      // Reproducir sonido
      try {
        const audio = new Audio('/notification.mp3');
        audio.volume = 0.5;
        audio.play().catch(() => {});
      } catch (e) {}

      return notification;
    }
  },

  /**
   * Notificaciones contextuales predefinidas
   */
  notifyStockLow: (productName, quantity) => {
    notificationService.notifyDesktop({
      title: '⚠️ Stock Bajo',
      body: `${productName}: Solo ${quantity} unidades`,
      tag: 'stock-low',
      requireInteraction: true
    });
  },

  notifySaleSuccess: (amount, itemCount) => {
    notificationService.notifyDesktop({
      title: '✅ Venta Exitosa',
      body: `${itemCount} producto(s) - RD$${amount.toFixed(2)}`,
      tag: 'sale-success'
    });
  },

  notifyRepairUpdate: (customerName, status) => {
    const statusLabels = {
      pending: 'Pendiente',
      in_progress: 'En Reparación',
      completed: 'Completado',
      cancelled: 'Cancelado'
    };

    notificationService.notifyDesktop({
      title: '🔧 Reparación - Cambio de Estado',
      body: `${customerName}: ${statusLabels[status] || status}`,
      tag: 'repair-update',
      requireInteraction: true
    });
  },

  notifyPaymentDue: (customerName, amount) => {
    notificationService.notifyDesktop({
      title: '💳 Pago Vencido',
      body: `${customerName} debe RD$${amount.toFixed(2)}`,
      tag: 'payment-due',
      requireInteraction: true
    });
  },

  notifyError: (message) => {
    notificationService.notifyDesktop({
      title: '❌ Error',
      body: message,
      tag: 'error',
      requireInteraction: true
    });
  },

  /**
   * Solicitar permiso de notificaciones
   */
  requestPermission: async () => {
    if (!('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      try {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      } catch (error) {
        console.error('Error solicitando permisos:', error);
        return false;
      }
    }

    return false;
  }
};

export default notificationService; 