const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre del producto es requerido'],
    trim: true
  },
  codigo: {
    type: String,
    required: [true, 'El código del producto es requerido'],
    unique: true,
    trim: true
  },
  precio: {
    type: Number,
    required: [true, 'El precio del producto es requerido'],
    min: [0, 'El precio no puede ser negativo']
  },
  stock_actual: {
    type: Number,
    default: 0,
    min: [0, 'El stock no puede ser negativo']
  },
  stock_minimo: {
    type: Number,
    default: 5,
    min: [0, 'El stock mínimo no puede ser negativo']
  },
  categoria: {
    type: String,
    trim: true
  },
  imagen: {
    type: String
  },
  activo: {
    type: Boolean,
    default: true
  },
  usuario_id: {
    type: String,
    required: [true, 'El ID de usuario es requerido']
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Actualizar la fecha de modificación antes de guardar
productSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product; 