import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContextMongo';
import { usePermissions } from '../context/PermissionsContext';

export const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  const { userRole, loading } = usePermissions();

  // Si está cargando, muestra un mensaje de carga o spinner
  if (loading) {
    return <div>Cargando...</div>;
  }

  // Si no hay usuario autenticado, redirige al login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Si el usuario está autenticado, renderiza el componente hijo
  return children;
}; 