// src/components/PrivateRoute.js
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null; // opcional: muestra un loader si lo deseas

  if (!user) return <Navigate to="/login" state={{ from: location }} />;

  // Si quieres redirigir por rol:
  if (location.pathname === '/') {
    if (user.rol === 'admin') return children;
    if (user.rol === 'staff') return <Navigate to="/reparaciones" />;
    if (user.rol === 'empleado') return <Navigate to="/perfil" />;
  }

  return children;
};

export default PrivateRoute;
