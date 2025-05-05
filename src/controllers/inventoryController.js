const Product = require('../models/Product');
const logger = require('../utils/logger');

// Obtener todo el inventario
exports.getInventory = async (req, res) => {
  try {
    const { usuario_id } = req.query;
    
    if (!usuario_id) {
      return res.status(400).json({
        success: false,
        message: 'El ID de usuario es requerido'
      });
    }

    const products = await Product.find({ usuario_id })
      .select('nombre codigo precio stock_actual stock_minimo categoria imagen')
      .sort({ nombre: 1 });

    const formattedProducts = products.map(product => ({
      id: product._id,
      nombre: product.nombre,
      codigo: product.codigo,
      precioVenta: product.precio,
      stockActual: product.stock_actual,
      stockMinimo: product.stock_minimo,
      categoria: product.categoria,
      imagen: product.imagen
    }));

    res.json({
      success: true,
      data: formattedProducts
    });
  } catch (error) {
    logger.error('Error al obtener inventario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el inventario'
    });
  }
};

// Obtener productos con stock bajo
exports.getLowStockProducts = async (req, res) => {
  try {
    const { usuario_id } = req.query;
    
    if (!usuario_id) {
      return res.status(400).json({
        success: false,
        message: 'El ID de usuario es requerido'
      });
    }

    const products = await Product.find({
      usuario_id,
      $expr: {
        $lte: ['$stock_actual', '$stock_minimo']
      }
    }).select('nombre codigo precio stock_actual stock_minimo categoria imagen');

    const formattedProducts = products.map(product => ({
      id: product._id,
      nombre: product.nombre,
      codigo: product.codigo,
      precioVenta: product.precio,
      stockActual: product.stock_actual,
      stockMinimo: product.stock_minimo,
      categoria: product.categoria,
      imagen: product.imagen
    }));

    res.json({
      success: true,
      data: formattedProducts
    });
  } catch (error) {
    logger.error('Error al obtener productos con stock bajo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos con stock bajo'
    });
  }
}; 