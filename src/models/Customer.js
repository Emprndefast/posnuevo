const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre del cliente es requerido'],
    trim: true
  },
  telefono: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Por favor ingrese un email válido']
  },
  direccion: {
    type: String,
    trim: true
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
customerSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer; 