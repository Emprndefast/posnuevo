const mongoose = require('mongoose');

const saleDetailSchema = new mongoose.Schema({
  venta_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sale',
    required: [true, 'El ID de la venta es requerido']
  },
  producto_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'El ID del producto es requerido']
  },
  cantidad: {
    type: Number,
    required: [true, 'La cantidad es requerida'],
    min: [1, 'La cantidad debe ser al menos 1']
  },
  precio_unitario: {
    type: Number,
    required: [true, 'El precio unitario es requerido'],
    min: [0, 'El precio no puede ser negativo']
  },
  subtotal: {
    type: Number,
    required: [true, 'El subtotal es requerido'],
    min: [0, 'El subtotal no puede ser negativo']
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

const SaleDetail = mongoose.model('SaleDetail', saleDetailSchema);

module.exports = SaleDetail; 