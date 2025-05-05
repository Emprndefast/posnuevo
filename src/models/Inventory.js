const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  producto_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'El ID del producto es requerido']
  },
  cantidad: {
    type: Number,
    required: [true, 'La cantidad es requerida'],
    min: [0, 'La cantidad no puede ser negativa']
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
inventorySchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

const Inventory = mongoose.model('Inventory', inventorySchema);

module.exports = Inventory; 