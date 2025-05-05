const constants = {
  // Constantes de autenticación
  auth: {
    TOKEN_KEY: 'auth_token',
    USER_KEY: 'user_data',
    TOKEN_EXPIRATION: 24 * 60 * 60 * 1000, // 24 horas en milisegundos
  },

  // Constantes de paginación
  pagination: {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
  },

  // Constantes de formato
  format: {
    DATE_FORMAT: 'DD/MM/YYYY',
    TIME_FORMAT: 'HH:mm',
    DATETIME_FORMAT: 'DD/MM/YYYY HH:mm',
    CURRENCY_FORMAT: {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  },

  // Constantes de validación
  validation: {
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE_REGEX: /^\+?[\d\s-]{10,}$/,
    PASSWORD_MIN_LENGTH: 8,
  },

  // Constantes de roles
  roles: {
    ADMIN: 'admin',
    MANAGER: 'manager',
    CASHIER: 'cashier',
  },

  // Constantes de permisos
  permissions: {
    PRODUCTS: {
      VIEW: 'products:view',
      CREATE: 'products:create',
      UPDATE: 'products:update',
      DELETE: 'products:delete',
    },
    SALES: {
      VIEW: 'sales:view',
      CREATE: 'sales:create',
      UPDATE: 'sales:update',
      DELETE: 'sales:delete',
    },
    CUSTOMERS: {
      VIEW: 'customers:view',
      CREATE: 'customers:create',
      UPDATE: 'customers:update',
      DELETE: 'customers:delete',
    },
    REPORTS: {
      VIEW: 'reports:view',
      GENERATE: 'reports:generate',
      DOWNLOAD: 'reports:download',
    },
    SETTINGS: {
      VIEW: 'settings:view',
      UPDATE: 'settings:update',
    },
  },

  // Constantes de estado
  status: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    PENDING: 'pending',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
  },

  // Constantes de categorías de productos
  productCategories: {
    FOOD: 'food',
    DRINKS: 'drinks',
    SNACKS: 'snacks',
    OTHER: 'other',
  },
};

export default constants; 