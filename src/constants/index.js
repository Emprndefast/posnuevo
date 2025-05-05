// Colecciones de Firestore
export const COLLECTIONS = {
  USERS: 'usuarios',
  REPAIRS: 'reparaciones',
  PRODUCTS: 'products',
  INVENTORY: 'inventario',
  ACCOUNTING: 'contabilidad',
  BUSINESSES: 'negocios',
  SERVICES: 'servicios',
  SETTINGS: 'ajustes'
};

// Roles de usuario
export const USER_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MANAGER: 'manager',
  TECHNICIAN: 'technician',
  INVENTORY: 'inventory',
  ACCOUNTANT: 'accountant',
  CASHIER: 'cashier',
  EMPLOYEE: 'employee'
};

// Estados de reparación
export const REPAIR_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Tipos de transacciones
export const TRANSACTION_TYPES = {
  SALE: 'sale',
  PURCHASE: 'purchase',
  REFUND: 'refund',
  EXPENSE: 'expense',
  INCOME: 'income'
};

// Configuración por defecto
export const DEFAULT_CONFIG = {
  business: {
    name: '',
    address: '',
    phone: '',
    email: '',
    logo: '',
    currency: 'USD',
    timezone: 'America/Guayaquil'
  },
  inventory: {
    lowStockAlert: 5,
    enableBarcode: true,
    enableCategories: true
  },
  sales: {
    enableDiscounts: true,
    enableTaxes: true,
    defaultTaxRate: 12
  },
  repairs: {
    enableStatusTracking: true,
    enableClientNotifications: true
  }
};

// Tipos de documentos
export const DOCUMENT_TYPES = {
  INVOICE: 'invoice',
  LABEL: 'label',
  REPORT: 'report'
};

// Configuración de paginación
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 50
};

// Configuración de impresión
export const PRINT_CONFIG = {
  PAPER_SIZES: {
    A4: 'A4',
    LETTER: 'LETTER',
    THERMAL: 'THERMAL'
  },
  ORIENTATIONS: {
    PORTRAIT: 'portrait',
    LANDSCAPE: 'landscape'
  }
};

// Mensajes de error comunes
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Error de conexión. Por favor, verifica tu conexión a internet.',
  AUTH_ERROR: 'Error de autenticación. Por favor, inicia sesión nuevamente.',
  PERMISSION_ERROR: 'No tienes permisos para realizar esta acción.',
  VALIDATION_ERROR: 'Por favor, verifica los datos ingresados.',
  UNKNOWN_ERROR: 'Ha ocurrido un error inesperado. Por favor, intenta nuevamente.'
};

// Configuración de tema
export const THEME = {
  MODES: {
    LIGHT: 'light',
    DARK: 'dark'
  },
  COLORS: {
    PRIMARY: '#1976d2',
    SECONDARY: '#9c27b0',
    SUCCESS: '#2e7d32',
    ERROR: '#d32f2f',
    WARNING: '#ed6c02',
    INFO: '#0288d1'
  }
}; 