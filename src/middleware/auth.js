const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const checkAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token de autenticación no proporcionado'
      });
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      req.user = decoded;
      next();
    } catch (error) {
      logger.error('Error al verificar token:', error);
      return res.status(401).json({
        success: false,
        message: 'Token inválido o expirado'
      });
    }
  } catch (error) {
    logger.error('Error en middleware de autenticación:', error);
    return res.status(500).json({
      success: false,
      message: 'Error en la autenticación'
    });
  }
};

// Middleware para verificar permisos
const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    try {
      const { permissions = [] } = req.user;
      
      if (!permissions.includes(requiredPermission)) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para realizar esta acción'
        });
      }
      
      next();
    } catch (error) {
      logger.error('Error al verificar permisos:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al verificar permisos'
      });
    }
  };
};

// Middleware para verificar rol
const checkRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ error: 'No tienes rol asignado' });
    }

    if (req.user.role !== requiredRole) {
      return res.status(403).json({ 
        error: `Rol incorrecto. Se requiere: ${requiredRole}`,
        required: requiredRole,
        userRole: req.user.role
      });
    }

    next();
  };
};

module.exports = {
  checkAuth,
  checkPermission,
  checkRole
}; 