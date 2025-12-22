// Configuración para el sistema de notificaciones

// URL base de la API
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002/api';

// Configuración de notificaciones de escritorio
export const DESKTOP_NOTIFICATION_OPTIONS = {
  icon: '/logo192.png', // Ruta a tu icono
  badge: '/logo192.png',
  vibrate: [200, 100, 200],
  tag: 'pos-nt-notification',
  renotify: true,
  requireInteraction: true,
};

// Tipos de notificaciones
export const NOTIFICATION_TYPES = {
  SALE: 'sale',
  NEW_PRODUCT: 'new_product',
  STOCK_ALERT: 'stock_alert',
  DAILY_REMINDER: 'daily_reminder',
};

// Títulos de notificaciones
export const NOTIFICATION_TITLES = {
  [NOTIFICATION_TYPES.SALE]: '¡Nueva Venta!',
  [NOTIFICATION_TYPES.NEW_PRODUCT]: 'Nuevo Producto',
  [NOTIFICATION_TYPES.STOCK_ALERT]: 'Alerta de Stock',
  [NOTIFICATION_TYPES.DAILY_REMINDER]: 'Recordatorio Diario',
}; 