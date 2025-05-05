import React from 'react';
import { Navigate } from 'react-router-dom';
import { useRole } from '../../context/RoleContext';

const PermissionGuard = ({ children, requiredPermission }) => {
  const { permissions } = useRole();

  if (!permissions[requiredPermission]) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PermissionGuard; 