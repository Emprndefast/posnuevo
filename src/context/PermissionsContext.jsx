import React, { createContext, useContext, useState, useEffect } from 'react';
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
      if (user) {
        try {
          console.log('Fetching user role for MongoDB user');
          // TODO: Fetch from MongoDB API
          const userRole = user.role || 'staff';
          if (userRole) {
            console.log('Setting user role to:', userRole);
            setUserRole(userRole.toLowerCase());
          } else {
            setUserRole(null);
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
          setUserRole(null);
        }
      } else {
        console.log('No user logged in');
        setUserRole(null);
      }
      setLoading(false);
    };

    fetchUserRole();
  }, [user]);

  const hasPermission = (section, action) => {
    console.log('Checking permission:', { section, action, userRole });
    if (userRole?.toLowerCase() === 'admin') return true;
    
    if (!userRole || !permissions[section] || !permissions[section][action]) {
      return false;
    }
    return permissions[section][action].includes(userRole.toLowerCase());
  };

  const isOwner = () => {
    console.log('Checking isOwner:', userRole);
    return userRole?.toLowerCase() === 'owner';
  };
  
  const isAdmin = () => {
    console.log('Checking isAdmin:', userRole);
    return userRole?.toLowerCase() === 'admin';
  };
  
  const isManager = () => {
    console.log('Checking isManager:', userRole);
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