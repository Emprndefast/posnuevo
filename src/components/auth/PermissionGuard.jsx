import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLE_PERMISSIONS } from '../../config/permissions';

export const PermissionGuard = ({ children, requiredPermissions }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  const userPermissions = ROLE_PERMISSIONS[user.rol] || [];

  // Verificar si el usuario tiene todos los permisos requeridos
  const hasRequiredPermissions = requiredPermissions.every(permission => 
    userPermissions.includes(permission)
  );

  if (!hasRequiredPermissions) {
    // Redirigir al dashboard si no tiene permisos
    return <Navigate to="/" />;
  }

  return children;
}; 