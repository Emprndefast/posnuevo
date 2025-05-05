const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  fecha: {
    type: Date,
    default: Date.now
  },
  total: {
    type: Number,
    required: [true, 'El total de la venta es requerido'],
    min: [0, 'El total no puede ser negativo']
  },
  cliente_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  usuario_id: {
    type: String,
    required: [true, 'El ID de usuario es requerido']
  },
  estado: {
    type: String,
    enum: ['completada', 'cancelada', 'pendiente'],
    default: 'completada'
  },
  metodo_pago: {
    type: String,
    enum: ['efectivo', 'tarjeta', 'transferencia', 'otro'],
    default: 'efectivo'
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
saleSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

const Sale = mongoose.model('Sale', saleSchema);

module.exports = Sale; 