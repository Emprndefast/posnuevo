const mongoose = require('mongoose');
const { format } = require('date-fns');
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const Sale = require('../models/Sale');
const SaleDetail = require('../models/SaleDetail');
const Customer = require('../models/Customer');
const logger = require('../utils/logger');

// Controlador para procesar mensajes del bot de Telegram
const processBotMessage = async (req, res) => {
  try {
    const { mensaje } = req.body;
    
    // Log para debugging
    logger.info(`Mensaje recibido del bot: ${mensaje}`);
    
    // Procesar el mensaje según su contenido
    let response = { success: false, message: 'Comando no reconocido' };
    
    if (mensaje.toLowerCase().includes('inventario')) {
      response = await getInventoryData();
    } else if (mensaje.toLowerCase().includes('ventas')) {
      response = await getSalesData();
    } else if (mensaje.toLowerCase().includes('clientes')) {
      response = await getCustomersData();
    } else if (mensaje.toLowerCase().includes('stock bajo')) {
      response = await getLowStockData();
    } else if (mensaje.toLowerCase().includes('ayuda')) {
      response = {
        success: true,
        message: 'Comandos disponibles:\n' +
                '- inventario: Ver el inventario completo\n' +
                '- ventas: Ver resumen de ventas\n' +
                '- clientes: Ver lista de clientes\n' +
                '- stock bajo: Ver productos con stock bajo'
      };
    }
    
    res.json(response);
  } catch (error) {
    logger.error(`Error al procesar mensaje del bot: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error al procesar el mensaje'
    });
  }
};

// Función para obtener datos de inventario
const getInventoryData = async () => {
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
    
    // Formatear la respuesta para Telegram
    let message = '📦 *INVENTARIO ACTUAL*\n\n';
    
    if (productos.length === 0) {
      message += 'No hay productos en el inventario.';
    } else {
      productos.forEach((producto, index) => {
        message += `${index + 1}. *${producto.nombre}*\n`;
        message += `   Código: ${producto.codigo}\n`;
        message += `   Precio: $${producto.precio.toFixed(2)}\n`;
        message += `   Stock: ${producto.stock}\n\n`;
      });
    }
    
    return {
      success: true,
      message: message
    };
  } catch (error) {
    logger.error(`Error al obtener inventario: ${error.message}`);
    return {
      success: false,
      message: 'Error al obtener el inventario'
    };
  }
};

// Función para obtener datos de ventas
const getSalesData = async () => {
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
    
    // Formatear la respuesta para Telegram
    let message = '💰 *RESUMEN DE VENTAS HOY*\n\n';
    
    if (!summary) {
      message += 'No hay ventas registradas hoy.';
    } else {
      message += `Total de ventas: ${summary.total_ventas}\n`;
      message += `Monto total: $${summary.monto_total.toFixed(2)}\n`;
      message += `Promedio por venta: $${summary.promedio_venta.toFixed(2)}\n`;
    }
    
    return {
      success: true,
      message: message
    };
  } catch (error) {
    logger.error(`Error al obtener ventas: ${error.message}`);
    return {
      success: false,
      message: 'Error al obtener las ventas'
    };
  }
};

// Función para obtener datos de clientes
const getCustomersData = async () => {
  try {
    const clientes = await Customer.find({ activo: true })
      .select('nombre email telefono')
      .sort({ nombre: 1 })
      .limit(10);
    
    // Formatear la respuesta para Telegram
    let message = '👥 *CLIENTES RECIENTES*\n\n';
    
    if (clientes.length === 0) {
      message += 'No hay clientes registrados.';
    } else {
      clientes.forEach((cliente, index) => {
        message += `${index + 1}. *${cliente.nombre}*\n`;
        if (cliente.email) message += `   Email: ${cliente.email}\n`;
        if (cliente.telefono) message += `   Tel: ${cliente.telefono}\n\n`;
      });
    }
    
    return {
      success: true,
      message: message
    };
  } catch (error) {
    logger.error(`Error al obtener clientes: ${error.message}`);
    return {
      success: false,
      message: 'Error al obtener los clientes'
    };
  }
};

// Función para obtener productos con stock bajo
const getLowStockData = async () => {
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
    
    // Formatear la respuesta para Telegram
    let message = '⚠️ *PRODUCTOS CON STOCK BAJO*\n\n';
    
    if (productos.length === 0) {
      message += 'No hay productos con stock bajo.';
    } else {
      productos.forEach((producto, index) => {
        message += `${index + 1}. *${producto.nombre}*\n`;
        message += `   Código: ${producto.codigo}\n`;
        message += `   Stock actual: ${producto.stock}\n`;
        message += `   Stock mínimo: ${producto.stock_minimo}\n\n`;
      });
    }
    
    return {
      success: true,
      message: message
    };
  } catch (error) {
    logger.error(`Error al obtener productos con stock bajo: ${error.message}`);
    return {
      success: false,
      message: 'Error al obtener productos con stock bajo'
    };
  }
};

module.exports = {
  processBotMessage,
  getInventoryData,
  getSalesData,
  getCustomersData,
  getLowStockData
}; 