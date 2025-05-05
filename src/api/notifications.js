import api from './api';

// Obtener todas las notificaciones del usuario
export const getNotifications = async () => {
  const response = await api.get('/notifications');
  return response.data;
};

// Obtener notificaciones no leídas
export const getUnreadNotifications = async () => {
  const response = await api.get('/notifications/unread');
  return response.data;
};

// Marcar notificación como leída
export const markAsRead = async (notificationId) => {
  const response = await api.patch(`/notifications/${notificationId}/read`);
  return response.data;
};

// Marcar todas las notificaciones como leídas
export const markAllAsRead = async () => {
  const response = await api.patch('/notifications/read-all');
  return response.data;
};

// Eliminar una notificación
export const deleteNotification = async (notificationId) => {
  const response = await api.delete(`/notifications/${notificationId}`);
  return response.data;
};

// Eliminar todas las notificaciones
export const deleteAllNotifications = async () => {
  const response = await api.delete('/notifications');
  return response.data;
};

// Suscribirse a tipos específicos de notificaciones
export const subscribeToNotifications = async (types) => {
  const response = await api.post('/notifications/subscribe', { types });
  return response.data;
};

// Cancelar suscripción a tipos específicos de notificaciones
export const unsubscribeFromNotifications = async (types) => {
  const response = await api.post('/notifications/unsubscribe', { types });
  return response.data;
};

// Obtener preferencias de notificación
export const getNotificationPreferences = async () => {
  const response = await api.get('/notifications/preferences');
  return response.data;
};

// Actualizar preferencias de notificación
export const updateNotificationPreferences = async (preferences) => {
  const response = await api.patch('/notifications/preferences', preferences);
  return response.data;
}; 