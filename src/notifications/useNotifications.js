// src/notifications/useNotifications.js
import { notificationService } from './notificationService';

export function useNotifications(settings, user) {
  // Notificación de escritorio
  const notifyDesktop = (title, options) => {
    if (
      settings.notifications.enabled &&
      settings.notifications.desktop &&
      Notification.permission === 'granted'
    ) {
      new Notification(title, options);
    }
  };

  // Notificación por email (llama al backend)
  const notifyEmail = async (endpoint, data) => {
    if (settings.notifications.enabled && settings.notifications.email) {
      await fetch(`/api/notifications/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          email: user.email,
          notifications: settings.notifications,
        }),
      });
    }
  };

  // Métodos para notificar eventos específicos
  const notifySale = async (saleData) => {
    return await notificationService.notifySale(saleData, settings);
  };

  const notifyNewProduct = async (productData) => {
    return await notificationService.notifyNewProduct(productData, settings);
  };

  const notifyStockAlert = async (stockData) => {
    return await notificationService.notifyStockAlert(stockData, settings);
  };

  const sendDailyReminder = async (userData) => {
    return await notificationService.sendDailyReminder(userData, settings);
  };

  return { 
    notifyDesktop, 
    notifyEmail,
    notifySale,
    notifyNewProduct,
    notifyStockAlert,
    sendDailyReminder
  };
}