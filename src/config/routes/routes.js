import { lazy } from 'react';
import appConfig from '../settings/appConfig';

// Lazy loading de componentes
const Dashboard = lazy(() => import('../../pages/Dashboard'));
const Products = lazy(() => import('../../pages/Products'));
const Sales = lazy(() => import('../../pages/Sales'));
const Customers = lazy(() => import('../../pages/Customers'));
const Reports = lazy(() => import('../../pages/Reports'));
const Settings = lazy(() => import('../../pages/Settings'));
const Login = lazy(() => import('../../pages/Login'));
const NotFound = lazy(() => import('../../pages/NotFound'));

const routes = [
  {
    path: '/',
    element: Dashboard,
    title: 'Dashboard',
    icon: 'dashboard',
    requiresAuth: true,
    permissions: ['*']
  },
  {
    path: '/products',
    element: Products,
    title: 'Productos',
    icon: 'inventory',
    requiresAuth: true,
    permissions: ['manage_products', 'view_products']
  },
  {
    path: '/sales',
    element: Sales,
    title: 'Ventas',
    icon: 'point_of_sale',
    requiresAuth: true,
    permissions: ['manage_sales', 'process_sales']
  },
  {
    path: '/customers',
    element: Customers,
    title: 'Clientes',
    icon: 'people',
    requiresAuth: true,
    permissions: ['manage_customers', 'view_customers']
  },
  {
    path: '/reports',
    element: Reports,
    title: 'Reportes',
    icon: 'analytics',
    requiresAuth: true,
    permissions: ['view_reports']
  },
  {
    path: '/settings',
    element: Settings,
    title: 'Configuración',
    icon: 'settings',
    requiresAuth: true,
    permissions: ['*']
  },
  {
    path: '/login',
    element: Login,
    title: 'Iniciar Sesión',
    requiresAuth: false
  },
  {
    path: '*',
    element: NotFound,
    title: 'Página no encontrada',
    requiresAuth: false
  }
];

export default routes; 