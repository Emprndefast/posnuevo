import config from '../config/settings/appConfig';

export const storage = {
  getToken: () => localStorage.getItem(config.auth.tokenKey),
  
  setToken: (token) => {
    localStorage.setItem(config.auth.tokenKey, token);
  },
  
  getRefreshToken: () => localStorage.getItem(config.auth.refreshTokenKey),
  
  setRefreshToken: (token) => {
    localStorage.setItem(config.auth.refreshTokenKey, token);
  },
  
  clearAuth: () => {
    localStorage.removeItem(config.auth.tokenKey);
    localStorage.removeItem(config.auth.refreshTokenKey);
  },
  
  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
  },
  
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  
  clearUser: () => {
    localStorage.removeItem('user');
  },
  
  clearAll: () => {
    localStorage.clear();
  }
};

export default storage; 