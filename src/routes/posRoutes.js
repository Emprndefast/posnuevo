const express = require('express');
const {
  processBotMessage,
  getInventoryData,
  getSalesData,
  getCustomersData,
  getLowStockData
} = require('../controllers/posController');
const { checkAuth, checkRole } = require('../middleware/auth');

const router = express.Router();

// Ruta pública para recibir mensajes del bot (sin autenticación)
router.post('/pos', processBotMessage);

// Rutas protegidas que requieren autenticación
router.use(checkAuth, checkRole('bot'));

// Ruta para obtener inventario
router.get('/inventory', async (req, res) => {
  const result = await getInventoryData();
  res.json(result);
});

// Ruta para obtener resumen de ventas
router.get('/sales', async (req, res) => {
  const result = await getSalesData();
  res.json(result);
});

// Ruta para obtener lista de clientes
router.get('/customers', async (req, res) => {
  const result = await getCustomersData();
  res.json(result);
});

// Ruta para obtener productos con stock bajo
router.get('/low-stock', async (req, res) => {
  const result = await getLowStockData();
  res.json(result);
});

module.exports = router;
