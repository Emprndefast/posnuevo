import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3002/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar el token de autenticación
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      console.error('Error de respuesta:', error.response.data);
      throw new Error(error.response.data.message || 'Error en la solicitud');
    } else if (error.request) {
      // La solicitud se realizó pero no se recibió respuesta
      console.error('Error de solicitud:', error.request);
      throw new Error('No se recibió respuesta del servidor');
    } else {
      // Algo sucedió en la configuración de la solicitud
      console.error('Error:', error.message);
      throw new Error('Error al realizar la solicitud');
    }
  }
);

export default api; 