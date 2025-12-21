/**
 * Servicio de notificaciones mejorado para el POS
 * Soporta: éxito, error, advertencia, info
 * Uso: toast.success('Venta completada'), toast.error('Error al guardar')
 */

import { toast } from 'react-toastify';

export const notificationService = {
  success: (message, options = {}) => {
    toast.success(message, {
      position: 'bottom-right',
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options,
    });
  },

  error: (message, options = {}) => {
    toast.error(message, {
      position: 'bottom-right',
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options,
    });
  },

  warning: (message, options = {}) => {
    toast.warning(message, {
      position: 'bottom-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options,
    });
  },

  info: (message, options = {}) => {
    toast.info(message, {
      position: 'bottom-right',
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options,
    });
  },

  // Notificación con carga
  loading: (message) => {
    return toast.loading(message, {
      position: 'bottom-right',
    });
  },

  // Actualizar notificación existente
  update: (id, options) => {
    toast.update(id, {
      ...options,
      isLoading: false,
    });
  },

  // Limpiar todas las notificaciones
  clear: () => {
    toast.dismiss();
  },
};

export default notificationService;
