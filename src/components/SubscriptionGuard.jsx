import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSubscription } from '../hooks/useSubscription';
import { CircularProgress, Box, Typography } from '@mui/material';

export const SubscriptionGuard = ({ children, requiredPlan = 'basic' }) => {
  const { subscription, loading } = useSubscription();
  const location = useLocation();

  // Permitir siempre el acceso a la página de suscripción
  if (location.pathname === '/subscription' || location.pathname === '/subscriptions') {
    return children;
  }

  // Mostrar loading mientras se verifica la suscripción
  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          height: '100vh'
        }}
      >
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Verificando suscripción...
        </Typography>
      </Box>
    );
  }

  // Verificar si el usuario tiene una suscripción activa y el plan requerido
  const hasRequiredPlan = () => {
    if (!subscription) return false;
    if (subscription.isActive) return true;
    const planHierarchy = {
      'free': 0,
      'basic': 1,
      'pro': 2
    };
    return planHierarchy[subscription.planId] >= planHierarchy[requiredPlan];
  };

  // Verificar si el usuario puede usar el plan gratuito
  const canUseFreePlan = () => {
    if (!subscription) return false;
    return subscription.canUseFreePlan && !subscription.freePlanUsed;
  };

  // Solo redirigir si no hay suscripción activa, no puede usar el plan gratuito y no está en la página de suscripción
  if (!subscription?.isActive && !canUseFreePlan()) {
    return (
      <Navigate 
        to="/subscription" 
        state={{ 
          from: location,
          message: subscription?.freePlanUsed 
            ? 'Ya has utilizado tu período de prueba gratuito. Por favor, selecciona un plan para continuar usando la aplicación.'
            : 'Por favor, selecciona un plan para comenzar a usar la aplicación.'
        }} 
        replace 
      />
    );
  }

  return children;
}; 