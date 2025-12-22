import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Normalize user shape to ensure `uid` exists (backend returns `_id`)
  const normalizeUser = (u) => {
    if (!u) return null;
    return { ...u, uid: u.uid || u._id || u.id };
  }; 

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await api.get('/auth/profile');
      if (response.data.success) {
        setUser(normalizeUser(response.data.user));
      } else {
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.success) {
        const { token, user: userData } = response.data;
        localStorage.setItem('token', token);
        setUser(normalizeUser(userData));
        return { success: true };
      } else {
        setError(response.data.message || 'Error al iniciar sesión');
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al iniciar sesión';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/auth/register', userData);
      
      if (response.data.success) {
        const { token, user: newUser } = response.data;
        localStorage.setItem('token', token);
        setUser(normalizeUser(newUser));
        return { success: true };
      } else {
        setError(response.data.message || 'Error al registrarse');
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al registrarse';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      window.location.href = '/login';
    }
  };

  const updateUser = async (userData) => {
    try {
      const response = await api.put('/auth/profile', userData);
      if (response.data.success) {
        setUser(normalizeUser(response.data.user));
        return { success: true };
      }
      return { success: false, error: response.data.message }; 
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al actualizar perfil';
      return { success: false, error: errorMessage };
    }
  };

  const reloadUser = async () => {
    try {
      const response = await api.get('/auth/profile');
      if (response.data.success) {
        setUser(normalizeUser(response.data.user));
      }
    } catch (error) {
      console.error('Error al recargar usuario:', error);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
    reloadUser,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

