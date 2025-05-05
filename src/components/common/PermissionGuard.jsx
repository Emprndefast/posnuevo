import React from 'react';
import { usePermissions } from '../../hooks/usePermissions';

export const PermissionGuard = ({ 
  children, 
  permissions, 
  requireAll = false,
  fallback = null 
}) => {
  const { hasAnyPermission, hasAllPermissions } = usePermissions();

  const hasAccess = requireAll
    ? hasAllPermissions(permissions)
    : hasAnyPermission(permissions);

  if (!hasAccess) {
    return fallback;
  }

  return children;
};

export const withPermission = (WrappedComponent, permissions, requireAll = false) => {
  return function WithPermissionComponent(props) {
    return (
      <PermissionGuard permissions={permissions} requireAll={requireAll}>
        <WrappedComponent {...props} />
      </PermissionGuard>
    );
  };
}; 