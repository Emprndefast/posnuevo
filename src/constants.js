// API URL
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002/api';

// Otras constantes de la aplicación
export const APP_NAME = 'POS NT';
export const APP_VERSION = '1.0.0';

// Colecciones de la base de datos
export const COLLECTIONS = {
  USERS: 'users',
  PRODUCTS: 'products',
  SALES: 'sales',
  INVENTORY: 'inventory',
  CATEGORIES: 'categories',
  BUSINESSES: 'businesses',
  PAYMENTS: 'payments',
  REPORTS: 'reports'
};

// Roles de usuario
export const ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MANAGER: 'manager',
  CASHIER: 'cashier',
  INVENTORY: 'inventory',
  READONLY: 'readonly'
};

// Estados de venta
export const SALE_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
};

// Métodos de pago
export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  TRANSFER: 'transfer',
  OTHER: 'other'
};

// Categorías de productos
export const PRODUCT_CATEGORIES = [
  'Electrónicos',
  'Accesorios',
  'Repuestos',
  'Servicios',
  'Otros'
];

// Mensajes de error
export const ERROR_MESSAGES = {
  GENERIC: 'Ha ocurrido un error. Por favor, inténtalo de nuevo.',
  AUTH: {
    INVALID_CREDENTIALS: 'Credenciales inválidas',
    EMAIL_IN_USE: 'El correo electrónico ya está en uso',
    WEAK_PASSWORD: 'La contraseña debe tener al menos 6 caracteres'
  },
  NETWORK: {
    NO_CONNECTION: 'No hay conexión a internet',
    SERVER_ERROR: 'Error en el servidor'
  }
}; 