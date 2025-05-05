import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const RoleContext = createContext();

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole debe ser usado dentro de un RoleProvider');
  }
  return context;
};

export const RoleProvider = ({ children }) => {
  const { user } = useAuth();
  const [role, setRole] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        try {
          // Aquí deberías obtener el rol del usuario desde tu base de datos
          // Por ahora usaremos un valor por defecto basado en el email
          const userRole = user.email.includes('admin') ? 'admin' : 
                          user.email.includes('staff') ? 'staff' : 'user';
          
          setRole(userRole);
          
          // Definir permisos según el rol
          const rolePermissions = {
            admin: {
              canManageInventory: true,
              canManageProducts: true,
              canManageUsers: true,
              canViewReports: true,
              canConfigureSystem: true,
              canViewDashboard: true,
              canMakeSales: true
            },
            staff: {
              canManageInventory: false,
              canManageProducts: true,
              canManageUsers: false,
              canViewReports: true,
              canConfigureSystem: false,
              canViewDashboard: true,
              canMakeSales: true
            },
            user: {
              canManageInventory: false,
              canManageProducts: false,
              canManageUsers: false,
              canViewReports: false,
              canConfigureSystem: false,
              canViewDashboard: true,
              canMakeSales: false
            }
          };

          setPermissions(rolePermissions[userRole]);
        } catch (error) {
          console.error('Error al obtener el rol del usuario:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setRole(null);
        setPermissions({});
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  const value = {
    role,
    permissions,
    loading
  };

  return (
    <RoleContext.Provider value={value}>
      {!loading && children}
    </RoleContext.Provider>
  );
}; 