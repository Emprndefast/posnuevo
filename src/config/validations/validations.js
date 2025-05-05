const validations = {
  // Validaciones generales
  general: {
    required: (value) => (!value || value.trim() === '') ? 'Este campo es requerido' : '',
    minLength: (value, min) => (value && value.length < min) ? `Mínimo ${min} caracteres` : '',
    maxLength: (value, max) => (value && value.length > max) ? `Máximo ${max} caracteres` : '',
  },

  // Validaciones de productos
  products: {
    name: (value) => {
      if (!value || value.trim() === '') return 'El nombre es requerido';
      if (value.length < 3) return 'El nombre debe tener al menos 3 caracteres';
      if (value.length > 100) return 'El nombre no puede exceder 100 caracteres';
      return '';
    },
    price: (value) => {
      if (!value) return 'El precio es requerido';
      if (isNaN(value)) return 'El precio debe ser un número';
      if (value <= 0) return 'El precio debe ser mayor a 0';
      return '';
    },
    stock: (value) => {
      if (!value && value !== 0) return 'El stock es requerido';
      if (isNaN(value)) return 'El stock debe ser un número';
      if (value < 0) return 'El stock no puede ser negativo';
      return '';
    },
    barcode: (value) => {
      if (!value) return '';
      if (value.length < 8) return 'El código de barras debe tener al menos 8 caracteres';
      if (value.length > 13) return 'El código de barras no puede exceder 13 caracteres';
      return '';
    },
  },

  // Validaciones de clientes
  customers: {
    name: (value) => {
      if (!value || value.trim() === '') return 'El nombre es requerido';
      if (value.length < 3) return 'El nombre debe tener al menos 3 caracteres';
      if (value.length > 100) return 'El nombre no puede exceder 100 caracteres';
      return '';
    },
    email: (value) => {
      if (!value) return '';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) return 'Ingrese un correo electrónico válido';
      return '';
    },
    phone: (value) => {
      if (!value) return '';
      const phoneRegex = /^\+?[\d\s-]{10,}$/;
      if (!phoneRegex.test(value)) return 'Ingrese un número de teléfono válido';
      return '';
    },
  },

  // Validaciones de ventas
  sales: {
    quantity: (value) => {
      if (!value) return 'La cantidad es requerida';
      if (isNaN(value)) return 'La cantidad debe ser un número';
      if (value <= 0) return 'La cantidad debe ser mayor a 0';
      return '';
    },
    paymentMethod: (value) => {
      if (!value) return 'El método de pago es requerido';
      return '';
    },
  },

  // Validaciones de usuarios
  users: {
    username: (value) => {
      if (!value || value.trim() === '') return 'El nombre de usuario es requerido';
      if (value.length < 4) return 'El nombre de usuario debe tener al menos 4 caracteres';
      if (value.length > 20) return 'El nombre de usuario no puede exceder 20 caracteres';
      return '';
    },
    password: (value) => {
      if (!value) return 'La contraseña es requerida';
      if (value.length < 8) return 'La contraseña debe tener al menos 8 caracteres';
      return '';
    },
    confirmPassword: (value, password) => {
      if (!value) return 'Confirme la contraseña';
      if (value !== password) return 'Las contraseñas no coinciden';
      return '';
    },
  },
};

export default validations; 