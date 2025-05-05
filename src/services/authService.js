import api, { API_ENDPOINTS } from '../config/api';

class AuthService {
  async login(email, password) {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      return user;
    } catch (error) {
      throw error;
    }
  }

  async register(userData) {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async logout() {
    try {
      await api.post(API_ENDPOINTS.AUTH.LOGOUT);
      localStorage.removeItem('token');
    } catch (error) {
      throw error;
    }
  }

  async refreshToken() {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN);
      const { token } = response.data;
      localStorage.setItem('token', token);
      return token;
    } catch (error) {
      throw error;
    }
  }

  isAuthenticated() {
    return !!localStorage.getItem('token');
  }
}

export const authService = new AuthService(); 