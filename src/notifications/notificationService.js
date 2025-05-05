// Servicio para manejar las notificaciones
import { API_BASE_URL, NOTIFICATION_TYPES, NOTIFICATION_TITLES, DESKTOP_NOTIFICATION_OPTIONS } from '../config/notifications';

export const notificationService = {
  // Notificar una venta
  notifySale: async (saleData, settings) => {
    try {
      // Enviar notificación al backend
      const response = await fetch(`${API_BASE_URL}/notifications/notify-sale`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saleData),
      });
      
      // Mostrar notificación de escritorio si está activada
      if (settings?.notifications?.desktop && Notification.permission === 'granted') {
        new Notification(NOTIFICATION_TITLES[NOTIFICATION_TYPES.SALE], {
          ...DESKTOP_NOTIFICATION_OPTIONS,
          body: `¡Felicidades! Has realizado una venta por $${saleData.total}`,
        });
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al notificar venta:', error);
      throw error;
    }
  },

  // Notificar nuevo producto
  notifyNewProduct: async (productData, settings) => {
    try {
      // Enviar notificación al backend
      const response = await fetch(`${API_BASE_URL}/notifications/notify-new-product`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });
      
      // Mostrar notificación de escritorio si está activada
      if (settings?.notifications?.desktop && Notification.permission === 'granted') {
        new Notification(NOTIFICATION_TITLES[NOTIFICATION_TYPES.NEW_PRODUCT], {
          ...DESKTOP_NOTIFICATION_OPTIONS,
          body: `Se ha agregado un nuevo producto: ${productData.name}`,
        });
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al notificar nuevo producto:', error);
      throw error;
    }
  },

  // Notificar alerta de stock
  notifyStockAlert: async (stockData, settings) => {
    try {
      // Enviar notificación al backend
      const response = await fetch(`${API_BASE_URL}/notifications/notify-stock-alert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stockData),
      });
      
      // Mostrar notificación de escritorio si está activada
      if (settings?.notifications?.desktop && Notification.permission === 'granted') {
        new Notification(NOTIFICATION_TITLES[NOTIFICATION_TYPES.STOCK_ALERT], {
          ...DESKTOP_NOTIFICATION_OPTIONS,
          body: `El producto ${stockData.productName} está por agotarse. Stock actual: ${stockData.currentStock}`,
        });
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al notificar alerta de stock:', error);
      throw error;
    }
  },

  // Enviar recordatorio diario
  sendDailyReminder: async (userData, settings) => {
    try {
      // Enviar notificación al backend
      const response = await fetch(`${API_BASE_URL}/notifications/daily-trial-reminder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      // Mostrar notificación de escritorio si está activada
      if (settings?.notifications?.desktop && Notification.permission === 'granted') {
        new Notification(NOTIFICATION_TITLES[NOTIFICATION_TYPES.DAILY_REMINDER], {
          ...DESKTOP_NOTIFICATION_OPTIONS,
          body: 'Recuerda que estás usando el plan gratuito. ¡Actualiza tu plan para acceder a más funciones!',
        });
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al enviar recordatorio diario:', error);
      throw error;
    }
  },
}; 