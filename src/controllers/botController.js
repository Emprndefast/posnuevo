const mongoose = require('mongoose');
const { format } = require('date-fns');
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const Sale = require('../models/Sale');
const SaleDetail = require('../models/SaleDetail');
const Customer = require('../models/Customer');
const logger = require('../utils/logger');

// Obtener inventario completo
const getInventory = async (req, res) => {
  try {
    const productos = await Product.aggregate([
      { $match: { activo: true } },
      {
        $lookup: {
          from: 'inventories',
          localField: '_id',
          foreignField: 'producto_id',
          as: 'inventario'
        }
      },
      {
        $project: {
          id: '$_id',
          nombre: 1,
          codigo: 1,
          precio: 1,
          stock: { $ifNull: [{ $arrayElemAt: ['$inventario.cantidad', 0] }, 0] },
          stock_minimo: 1
        }
      },
      { $sort: { nombre: 1 } }
    ]);
    
    res.json(productos);
  } catch (error) {
    console.error('Error al obtener inventario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener productos con stock bajo
const getLowStockItems = async (req, res) => {
  try {
    const productos = await Product.aggregate([
      { $match: { activo: true } },
      {
        $lookup: {
          from: 'inventories',
          localField: '_id',
          foreignField: 'producto_id',
          as: 'inventario'
        }
      },
      {
        $project: {
          id: '$_id',
          nombre: 1,
          codigo: 1,
          precio: 1,
          stock: { $ifNull: [{ $arrayElemAt: ['$inventario.cantidad', 0] }, 0] },
          stock_minimo: 1
        }
      },
      {
        $match: {
          $expr: { $lte: ['$stock', '$stock_minimo'] }
        }
      },
      { $sort: { stock: 1 } }
    ]);
    
    res.json(productos);
  } catch (error) {
    console.error('Error al obtener productos con stock bajo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener resumen de ventas del día
const getTodaySalesSummary = async (req, res) => {
  try {
    const today = format(new Date(), 'yyyy-MM-dd');
    const startOfDay = new Date(today);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const [summary] = await Sale.aggregate([
      {
        $match: {
          fecha: { $gte: startOfDay, $lte: endOfDay }
        }
      },
      {
        $group: {
          _id: null,
          total_ventas: { $sum: 1 },
          monto_total: { $sum: '$total' },
          promedio_venta: { $avg: '$total' }
        }
      }
    ]);

    res.json(summary || { total_ventas: 0, monto_total: 0, promedio_venta: 0 });
  } catch (error) {
    console.error('Error al obtener resumen de ventas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener productos más vendidos
const getTopProducts = async (req, res) => {
  try {
    const productos = await SaleDetail.aggregate([
      {
        $group: {
          _id: '$producto_id',
          total_vendido: { $sum: '$cantidad' },
          monto_total: { $sum: '$subtotal' }
        }
      },
      { $sort: { total_vendido: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'producto'
        }
      },
      {
        $project: {
          nombre: { $arrayElemAt: ['$producto.nombre', 0] },
          codigo: { $arrayElemAt: ['$producto.codigo', 0] },
          total_vendido: 1,
          monto_total: 1
        }
      }
    ]);
    
    res.json(productos);
  } catch (error) {
    console.error('Error al obtener productos más vendidos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener ventas por período
const getSalesByPeriod = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const ventas = await Sale.aggregate([
      {
        $match: {
          fecha: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$fecha' } },
          total_ventas: { $sum: 1 },
          monto_total: { $sum: '$total' }
        }
      },
      { $sort: { _id: -1 } }
    ]);
    
    res.json(ventas);
  } catch (error) {
    console.error('Error al obtener ventas por período:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener lista de clientes
const getCustomers = async (req, res) => {
  try {
    const clientes = await Customer.find({ activo: true })
      .select('_id nombre telefono email direccion')
      .sort('nombre');
    
    res.json(clientes);
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener clientes frecuentes
const getFrequentCustomers = async (req, res) => {
  try {
    const clientes = await Sale.aggregate([
      {
        $group: {
          _id: '$cliente_id',
          total_compras: { $sum: 1 },
          monto_total: { $sum: '$total' }
        }
      },
      { $sort: { total_compras: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'customers',
          localField: '_id',
          foreignField: '_id',
          as: 'cliente'
        }
      },
      {
        $project: {
          id: '$_id',
          nombre: { $arrayElemAt: ['$cliente.nombre', 0] },
          telefono: { $arrayElemAt: ['$cliente.telefono', 0] },
          total_compras: 1,
          monto_total: 1
        }
      }
    ]);
    
    res.json(clientes);
  } catch (error) {
    console.error('Error al obtener clientes frecuentes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener estadísticas de clientes
const getCustomerStats = async (req, res) => {
  try {
    const [customerStats] = await Customer.aggregate([
      { $match: { activo: true } },
      {
        $lookup: {
          from: 'sales',
          localField: '_id',
          foreignField: 'cliente_id',
          as: 'ventas'
        }
      },
      {
        $project: {
          total_clientes: { $sum: 1 },
          clientes_con_ventas: {
            $sum: {
              $cond: [{ $gt: [{ $size: '$ventas' }, 0] }, 1, 0]
            }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: customerStats || { total_clientes: 0, clientes_con_ventas: 0 }
    });
  } catch (error) {
    logger.error('Error al obtener estadísticas de clientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas de clientes'
    });
  }
};

// Notificar stock bajo
const notifyLowStock = async (req, res) => {
  try {
    const { producto_id, cantidad_actual, stock_minimo } = req.body;
    
    // Aquí iría la lógica para enviar la notificación al bot
    // Por ejemplo, usando el servicio de Telegram
    
    res.json({ 
      success: true, 
      message: 'Notificación de stock bajo enviada' 
    });
  } catch (error) {
    console.error('Error al notificar stock bajo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Notificar stock agotado
const notifyOutOfStock = async (req, res) => {
  try {
    const { producto_id, nombre_producto } = req.body;
    
    // Lógica para enviar notificación de stock agotado
    
    res.json({ 
      success: true, 
      message: 'Notificación de stock agotado enviada' 
    });
  } catch (error) {
    console.error('Error al notificar stock agotado:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Notificar venta realizada
const notifySale = async (req, res) => {
  try {
    const { venta_id, total, productos } = req.body;
    
    // Lógica para enviar notificación de venta
    
    res.json({ 
      success: true, 
      message: 'Notificación de venta enviada' 
    });
  } catch (error) {
    console.error('Error al notificar venta:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Notificar venta cancelada
const notifyCancelledSale = async (req, res) => {
  try {
    const { venta_id, motivo } = req.body;
    
    // Lógica para enviar notificación de venta cancelada
    
    res.json({ 
      success: true, 
      message: 'Notificación de venta cancelada enviada' 
    });
  } catch (error) {
    console.error('Error al notificar venta cancelada:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener configuración del bot
const getBotConfig = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        notificar_stock_bajo,
        notificar_stock_agotado,
        notificar_ventas,
        notificar_ventas_canceladas,
        token_telegram,
        chat_id
      FROM configuracion_bot
      WHERE id = 1
    `);
    
    res.json(rows[0] || {});
  } catch (error) {
    console.error('Error al obtener configuración del bot:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Actualizar configuración del bot
const updateBotConfig = async (req, res) => {
  try {
    const {
      notificar_stock_bajo,
      notificar_stock_agotado,
      notificar_ventas,
      notificar_ventas_canceladas,
      token_telegram,
      chat_id
    } = req.body;
    
    await pool.query(`
      INSERT INTO configuracion_bot (
        id,
        notificar_stock_bajo,
        notificar_stock_agotado,
        notificar_ventas,
        notificar_ventas_canceladas,
        token_telegram,
        chat_id
      ) VALUES (1, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        notificar_stock_bajo = VALUES(notificar_stock_bajo),
        notificar_stock_agotado = VALUES(notificar_stock_agotado),
        notificar_ventas = VALUES(notificar_ventas),
        notificar_ventas_canceladas = VALUES(notificar_ventas_canceladas),
        token_telegram = VALUES(token_telegram),
        chat_id = VALUES(chat_id)
    `, [
      notificar_stock_bajo,
      notificar_stock_agotado,
      notificar_ventas,
      notificar_ventas_canceladas,
      token_telegram,
      chat_id
    ]);
    
    res.json({ 
      success: true, 
      message: 'Configuración del bot actualizada' 
    });
  } catch (error) {
    console.error('Error al actualizar configuración del bot:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener estadísticas en tiempo real
const getRealTimeStats = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM sales WHERE DATE(fecha) = CURDATE()) as ventas_hoy,
        (SELECT SUM(total) FROM sales WHERE DATE(fecha) = CURDATE()) as monto_hoy,
        (SELECT COUNT(*) FROM products WHERE activo = 1) as total_productos,
        (SELECT COUNT(*) FROM products p 
         LEFT JOIN inventory i ON p.id = i.producto_id 
         WHERE p.activo = 1 AND (i.cantidad <= p.stock_minimo OR i.cantidad IS NULL)) as productos_stock_bajo
    `);
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener estadísticas en tiempo real:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener alertas
const getAlerts = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.id as producto_id,
        p.nombre as producto,
        COALESCE(i.cantidad, 0) as stock_actual,
        p.stock_minimo
      FROM products p
      LEFT JOIN inventory i ON p.id = i.producto_id
      WHERE p.activo = 1
      AND (i.cantidad <= p.stock_minimo OR i.cantidad IS NULL)
      ORDER BY i.cantidad ASC
    `);
    
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener alertas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Controlador para recibir mensajes del bot
const receiveBotMessage = async (req, res) => {
  try {
    const { message, type, data } = req.body;
    
    // Log para debugging
    console.log('Mensaje recibido del bot:', {
      message,
      type,
      data,
      timestamp: new Date().toISOString()
    });

    // Aquí puedes agregar la lógica para procesar el mensaje
    // Por ejemplo, actualizar la UI, mostrar notificaciones, etc.

    res.json({
      success: true,
      message: 'Mensaje recibido correctamente'
    });
  } catch (error) {
    console.error('Error al procesar mensaje del bot:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar el mensaje'
    });
  }
};

module.exports = {
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
}; 