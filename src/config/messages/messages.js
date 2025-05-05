const messages = {
  // Mensajes generales
  general: {
    loading: 'Cargando...',
    saving: 'Guardando...',
    deleting: 'Eliminando...',
    error: 'Ha ocurrido un error',
    success: 'Operación exitosa',
    confirm: '¿Está seguro?',
    cancel: 'Cancelar',
    accept: 'Aceptar',
    close: 'Cerrar',
  },

  // Mensajes de autenticación
  auth: {
    login: {
      title: 'Iniciar Sesión',
      email: 'Correo electrónico',
      password: 'Contraseña',
      button: 'Iniciar Sesión',
      error: 'Credenciales inválidas',
    },
    logout: {
      title: 'Cerrar Sesión',
      confirm: '¿Desea cerrar sesión?',
    },
  },

  // Mensajes de productos
  products: {
    title: 'Productos',
    new: 'Nuevo Producto',
    edit: 'Editar Producto',
    delete: 'Eliminar Producto',
    name: 'Nombre',
    price: 'Precio',
    stock: 'Stock',
    category: 'Categoría',
    success: {
      created: 'Producto creado exitosamente',
      updated: 'Producto actualizado exitosamente',
      deleted: 'Producto eliminado exitosamente',
    },
    error: {
      create: 'Error al crear el producto',
      update: 'Error al actualizar el producto',
      delete: 'Error al eliminar el producto',
    },
  },

  // Mensajes de ventas
  sales: {
    title: 'Ventas',
    new: 'Nueva Venta',
    edit: 'Editar Venta',
    delete: 'Eliminar Venta',
    customer: 'Cliente',
    date: 'Fecha',
    total: 'Total',
    success: {
      created: 'Venta creada exitosamente',
      updated: 'Venta actualizada exitosamente',
      deleted: 'Venta eliminada exitosamente',
    },
    error: {
      create: 'Error al crear la venta',
      update: 'Error al actualizar la venta',
      delete: 'Error al eliminar la venta',
    },
  },

  // Mensajes de clientes
  customers: {
    title: 'Clientes',
    new: 'Nuevo Cliente',
    edit: 'Editar Cliente',
    delete: 'Eliminar Cliente',
    name: 'Nombre',
    email: 'Correo electrónico',
    phone: 'Teléfono',
    address: 'Dirección',
    success: {
      created: 'Cliente creado exitosamente',
      updated: 'Cliente actualizado exitosamente',
      deleted: 'Cliente eliminado exitosamente',
    },
    error: {
      create: 'Error al crear el cliente',
      update: 'Error al actualizar el cliente',
      delete: 'Error al eliminar el cliente',
    },
  },

  // Mensajes de reportes
  reports: {
    title: 'Reportes',
    sales: 'Reporte de Ventas',
    products: 'Reporte de Productos',
    customers: 'Reporte de Clientes',
    dateRange: 'Rango de Fechas',
    generate: 'Generar Reporte',
    download: 'Descargar Reporte',
  },

  // Mensajes de configuración
  settings: {
    title: 'Configuración',
    general: 'Configuración General',
    users: 'Usuarios',
    roles: 'Roles',
    save: 'Guardar Cambios',
    success: 'Configuración guardada exitosamente',
    error: 'Error al guardar la configuración',
  },
};

export default messages; 