const express = require('express');
const { checkAuth, checkPermission, checkRole } = require('../middleware/auth');
const { 
  getInventory, 
  getLowStockItems,
  getTodaySalesSummary,
  getTopProducts,
  getSalesByPeriod,
  getCustomers,
  getFrequentCustomers,
  getCustomerStats,
  notifyLowStock,
  notifyOutOfStock,
  notifySale,
  notifyCancelledSale,
  getBotConfig,
  updateBotConfig,
  getRealTimeStats,
  getAlerts,
  receiveBotMessage
} = require('../controllers/botController');
const { getLowStockProducts } = require('../controllers/inventoryController');

const router = express.Router();

// Ruta pública para recibir mensajes del bot (sin autenticación)
router.post('/bot/message', receiveBotMessage);

// Middleware para verificar que es un bot
router.use(checkAuth, checkRole('bot'));

// Rutas de inventario
router.get('/inventario', checkPermission('read:inventory'), getInventory);
router.get('/inventario/stock_bajo', checkPermission('read:inventory'), getLowStockProducts);

// Rutas de ventas
router.get('/ventas/resumen_hoy', checkPermission('read:sales'), getTodaySalesSummary);
router.get('/ventas/top_productos', checkPermission('read:sales'), getTopProducts);
router.get('/ventas/periodo', checkPermission('read:sales'), getSalesByPeriod);

// Rutas de clientes
router.get('/clientes', checkPermission('read:customers'), getCustomers);
router.get('/clientes/frecuentes', checkPermission('read:customers'), getFrequentCustomers);
router.get('/clientes/estadisticas', checkPermission('read:customers'), getCustomerStats);

// Rutas de notificaciones
router.post('/notificaciones/stock_bajo', checkPermission('notify:stock'), notifyLowStock);
router.post('/notificaciones/stock_agotado', checkPermission('notify:stock'), notifyOutOfStock);
router.post('/notificaciones/venta_realizada', checkPermission('notify:sales'), notifySale);
router.post('/notificaciones/venta_cancelada', checkPermission('notify:sales'), notifyCancelledSale);

// Rutas de configuración del bot
router.get('/bot/configuracion', checkPermission('read:reports'), getBotConfig);
router.put('/bot/configuracion', checkPermission('read:reports'), updateBotConfig);

// Rutas de estadísticas
router.get('/estadisticas/tiempo_real', checkPermission('read:reports'), getRealTimeStats);
router.get('/estadisticas/alertas', checkPermission('read:reports'), getAlerts);

module.exports = router; 