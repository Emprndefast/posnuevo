import axios from 'axios';
import { API_URL } from '../constants';

// Para debug
console.log('API URL:', API_URL);

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002/api';

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

let navigateToLogin = null;
export function setNavigate(fn) { navigateToLogin = fn; }

// Interceptor para agregar el token de autenticación y logging
api.interceptors.request.use(
  (config) => {
    // Para debug
    console.log('Making request to:', `${config.baseURL}${config.url}`);
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error('Response Error:', error.response || error);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (navigateToLogin) {
        navigateToLogin('/login');
      } else {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Endpoints de la API (sin el prefijo /api ya que está en la URL base)
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
    CHECK_TRIAL: '/auth/check-trial'
  },
  PRODUCTS: {
    BASE: '/products',
    CATEGORIES: '/products/categories',
    SEARCH: '/products/search'
  },
  SALES: {
    BASE: '/sales',
    DAILY: '/sales/daily',
    MONTHLY: '/sales/monthly',
    REPORT: '/sales/report'
  },
  REPAIRS: {
    BASE: '/repairs',
    STATUS: '/repairs/status',
    HISTORY: '/repairs/history'
  },
  CUSTOMERS: {
    BASE: '/customers',
    SEARCH: '/customers/search',
    LOYALTY: '/customers/loyalty'
  },
  INVENTORY: {
    BASE: '/inventory',
    STOCK: '/inventory/stock',
    MOVEMENTS: '/inventory/movements'
  },
  BUSINESS: {
    BASE: '/business',
    SETTINGS: '/business/settings',
    BRANCHES: '/business/branches'
  }
};

const API_CONFIG = {
  BOT_BASE_URL: process.env.NODE_ENV === 'production'
    ? process.env.REACT_APP_BOT_BASE_URL || 'https://posentbot.vercel.app'
    : process.env.REACT_APP_BOT_BASE_URL || 'http://localhost:3002',
  TELEGRAM_API_URL: 'https://api.telegram.org/bot'
};

export { API_CONFIG };
export default api; 