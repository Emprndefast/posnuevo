import React, { createContext, useContext, useState, useEffect, startTransition } from 'react';
import { useAuth } from './AuthContextMongo';
// import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
// import { db } from '../firebase/config';

const PermissionsContext = createContext();

export const permissionLevels = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF: 'staff',
  READONLY: 'readonly'
};

// Definición de permisos por sección
export const permissions = {
  sales: {
    view: [permissionLevels.OWNER, permissionLevels.ADMIN, permissionLevels.MANAGER, permissionLevels.STAFF],
    create: [permissionLevels.OWNER, permissionLevels.ADMIN, permissionLevels.MANAGER, permissionLevels.STAFF],
    edit: [permissionLevels.OWNER, permissionLevels.ADMIN, permissionLevels.MANAGER],
    delete: [permissionLevels.OWNER, permissionLevels.ADMIN],
    export: [permissionLevels.OWNER, permissionLevels.ADMIN, permissionLevels.MANAGER]
  },
  inventory: {
    view: [permissionLevels.OWNER, permissionLevels.ADMIN, permissionLevels.MANAGER, permissionLevels.STAFF],
    create: [permissionLevels.OWNER, permissionLevels.ADMIN, permissionLevels.MANAGER],
    edit: [permissionLevels.OWNER, permissionLevels.ADMIN, permissionLevels.MANAGER],
    delete: [permissionLevels.OWNER, permissionLevels.ADMIN]
  },
  reports: {
    view: [permissionLevels.OWNER, permissionLevels.ADMIN, permissionLevels.MANAGER],
    export: [permissionLevels.OWNER, permissionLevels.ADMIN]
  },
  users: {
    view: [permissionLevels.OWNER, permissionLevels.ADMIN],
    create: [permissionLevels.OWNER, permissionLevels.ADMIN],
    edit: [permissionLevels.OWNER, permissionLevels.ADMIN],
    delete: [permissionLevels.OWNER]
  },
  settings: {
    view: [permissionLevels.OWNER, permissionLevels.ADMIN],
    edit: [permissionLevels.OWNER, permissionLevels.ADMIN]
  }
};

export const PermissionsProvider = ({ children }) => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        startTransition(() => {
          setUserRole(null);
          setLoading(false);
        });
        return;
      }

      try {
        console.log('Fetching user role for MongoDB user');
        console.log('User object:', user);
        console.log('user.rol:', user.rol);
        
        // Leer tanto 'rol' como 'role' para compatibilidad
        const userRole = user.role || user.rol || null;
        
        if (userRole) {
          console.log('Setting user role to:', userRole);
          startTransition(() => {
            setUserRole(userRole.toLowerCase());
            setLoading(false);
          });
        } else {
          console.warn('No role found for user, setting to null');
          startTransition(() => {
            setUserRole(null);
            setLoading(false);
          });
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        startTransition(() => {
          setUserRole(null);
          setLoading(false);
        });
      }
    };

    fetchUserRole();
  }, [user]);

  const hasPermission = (section, action) => {
    // Admin siempre tiene todos los permisos
    if (userRole?.toLowerCase() === 'admin') return true;
    
    if (!userRole || !permissions[section] || !permissions[section][action]) {
      return false;
    }
    return permissions[section][action].includes(userRole.toLowerCase());
  };

  const isOwner = () => {
    return userRole?.toLowerCase() === 'owner';
  };
  
  const isAdmin = () => {
    return userRole?.toLowerCase() === 'admin';
  };
  
  const isManager = () => {
    return userRole?.toLowerCase() === 'manager';
  };

  return (
    <PermissionsContext.Provider 
      value={{ 
        userRole,
        hasPermission,
        isOwner,
        isAdmin,
        isManager,
        loading 
      }}
    >
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
}; 