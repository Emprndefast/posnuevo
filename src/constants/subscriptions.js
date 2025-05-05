export const SUBSCRIPTION_PLANS = {
  BASIC: {
    id: 'basic',
    name: 'Básico',
    price: 29.99,
    annualPrice: 299.99, // 2 meses gratis
    features: [
      'Hasta 1000 productos',
      '3 usuarios',
      'Funciones básicas de POS',
      'Soporte por email',
      'Reportes básicos',
      'Facturación electrónica'
    ],
    limitations: {
      maxProducts: 1000,
      maxUsers: 3,
      maxStorage: '5GB',
      supportLevel: 'priority',
      trialDays: 30
    }
  },
  PROFESSIONAL: {
    id: 'professional',
    name: 'Profesional',
    price: 49.99,
    annualPrice: 499.99, // 2 meses gratis
    features: [
      'Productos ilimitados',
      '10 usuarios',
      'Todas las funciones',
      'Soporte 24/7',
      'Reportes avanzados',
      'API access',
      'Facturación electrónica',
      'Múltiples sucursales',
      'Sistema de lealtad',
      'Personalización'
    ],
    limitations: {
      maxProducts: Infinity,
      maxUsers: 10,
      maxStorage: '20GB',
      supportLevel: 'premium',
      trialDays: 30,
      maxBranches: 3
    }
  }
};

export const SUBSCRIPTION_FEATURES = {
  INVENTORY_MANAGEMENT: 'inventory_management',
  MULTI_USER: 'multi_user',
  REPORTS: 'reports',
  API_ACCESS: 'api_access',
  CUSTOM_INTEGRATIONS: 'custom_integrations',
  DEDICATED_SUPPORT: 'dedicated_support',
  CUSTOMIZATION: 'customization',
  ELECTRONIC_INVOICING: 'electronic_invoicing',
  MULTI_BRANCH: 'multi_branch',
  LOYALTY_SYSTEM: 'loyalty_system'
};

export const PLAN_FEATURES = {
  [SUBSCRIPTION_PLANS.BASIC.id]: [
    SUBSCRIPTION_FEATURES.INVENTORY_MANAGEMENT,
    SUBSCRIPTION_FEATURES.MULTI_USER,
    SUBSCRIPTION_FEATURES.REPORTS,
    SUBSCRIPTION_FEATURES.ELECTRONIC_INVOICING
  ],
  [SUBSCRIPTION_PLANS.PROFESSIONAL.id]: [
    SUBSCRIPTION_FEATURES.INVENTORY_MANAGEMENT,
    SUBSCRIPTION_FEATURES.MULTI_USER,
    SUBSCRIPTION_FEATURES.REPORTS,
    SUBSCRIPTION_FEATURES.API_ACCESS,
    SUBSCRIPTION_FEATURES.ELECTRONIC_INVOICING,
    SUBSCRIPTION_FEATURES.MULTI_BRANCH,
    SUBSCRIPTION_FEATURES.LOYALTY_SYSTEM,
    SUBSCRIPTION_FEATURES.CUSTOMIZATION
  ]
};

export const PAYMENT_METHODS = {
  CREDIT_CARD: 'credit_card',
  DEBIT_CARD: 'debit_card',
  BANK_TRANSFER: 'bank_transfer',
  PAYPAL: 'paypal'
};

export const BILLING_CYCLES = {
  MONTHLY: 'monthly',
  ANNUAL: 'annual'
}; 