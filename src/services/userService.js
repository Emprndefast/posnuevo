import api from '../config/api';
import { notificationService } from '../notifications/notificationService';

// Servicio para gestionar usuarios
const userService = {
  // Obtener todos los usuarios
  getAllUsers: async () => {
    try {
      const response = await api.get('/usuarios');
      return response.data;
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      throw error;
    }
  },

  // Obtener un usuario por ID
  getUserById: async (id) => {
    try {
      const response = await api.get(`/usuarios/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener usuario con ID ${id}:`, error);
      throw error;
    }
  },

  // Crear un nuevo usuario
  createUser: async (userData) => {
    try {
      const response = await api.post('/usuarios', userData);
      return response.data;
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error;
    }
  },

  // Actualizar un usuario
  updateUser: async (id, userData) => {
    try {
      const response = await api.put(`/usuarios/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar usuario con ID ${id}:`, error);
      throw error;
    }
  },

  // Eliminar un usuario
  deleteUser: async (id) => {
    try {
      const response = await api.delete(`/usuarios/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al eliminar usuario con ID ${id}:`, error);
      throw error;
    }
  },

  // Login de usuario
  login: async (credentials) => {
    try {
      const response = await api.post('/usuarios/login', credentials);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userId', response.data.user.id);
      }
      return response.data;
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      throw error;
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
  },

  // Verificar si el usuario está autenticado
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Obtener el usuario actual
  getCurrentUser: async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return null;
      return await userService.getUserById(userId);
    } catch (error) {
      console.error('Error al obtener usuario actual:', error);
      return null;
    }
  },

  // Enviar recordatorio diario a usuarios en plan gratuito
  sendDailyReminder: async () => {
    try {
      const currentUser = await userService.getCurrentUser();
      if (currentUser && currentUser.plan === 'free') {
        await notificationService.sendDailyReminder({
          userId: currentUser.id,
          plan: 'free'
        });
      }
    } catch (error) {
      console.error('Error al enviar recordatorio diario:', error);
    }
  }
};

export default userService; 