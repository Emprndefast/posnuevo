const appConfig = {
  // Configuración general
  appName: 'POS-NT',
  appVersion: '1.0.0',
  appDescription: 'Sistema de Punto de Venta Moderno',
  
  // Configuración de branding
  branding: {
    primaryColor: '#1976d2',
    secondaryColor: '#dc004e',
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    borderRadius: 8,
    mode: 'light'
  },

  // Configuración de Firebase
  firebase: {
    collections: {
      users: 'users',
      products: 'products',
      sales: 'sales',
      customers: 'customers',
      services: 'services',
      inventory: 'inventory',
      categories: 'categories'
    }
  },

  // Configuración de roles
  roles: {
    admin: 'admin',
    manager: 'manager',
    cashier: 'cashier',
    employee: 'employee'
  },

  // Configuración de permisos
  permissions: {
    admin: ['*'],
    manager: [
      'manage_products',
      'manage_sales',
      'manage_customers',
      'view_reports',
      'manage_employees'
    ],
    cashier: [
      'process_sales',
      'view_products',
      'view_customers'
    ],
    employee: [
      'view_products',
      'view_customers'
    ]
  },

  // Configuración de la interfaz
  ui: {
    drawerWidth: 240,
    maxSnackbar: 3,
    defaultCurrency: 'USD',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
    itemsPerPage: 10
  },

  // Configuración de PWA
  pwa: {
    name: 'POS-NT',
    shortName: 'POS-NT',
    description: 'Sistema de Punto de Venta Moderno',
    themeColor: '#1976d2',
    backgroundColor: '#ffffff'
  },

  // Configuración de offline
  offline: {
    enabled: true,
    syncInterval: 300000, // 5 minutos
    maxRetries: 3
  }
};

export default appConfig; 