import React, { createContext, useContext, useState, useEffect } from 'react';
import { subscriptionService } from '../services/subscriptionService';
import { useAuth } from './AuthContextMongo';

const SubscriptionContext = createContext();

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription debe ser usado dentro de un SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider = ({ children }) => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const loadSubscription = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const userSubscription = await subscriptionService.getCurrentSubscription(user.uid);
      setSubscription(userSubscription);
    } catch (err) {
      console.error('Error al cargar la suscripción:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscription();
  }, [user]);

  const updateSubscription = async (subscriptionId, updates) => {
    try {
      await subscriptionService.updateSubscription(subscriptionId, updates);
      await loadSubscription();
    } catch (err) {
      setError('Error al actualizar la suscripción');
      console.error('Subscription update error:', err);
      throw err;
    }
  };

  const cancelSubscription = async (subscriptionId) => {
    try {
      await subscriptionService.cancelSubscription(subscriptionId);
      await loadSubscription();
    } catch (err) {
      setError('Error al cancelar la suscripción');
      console.error('Subscription cancellation error:', err);
      throw err;
    }
  };

  const upgradeSubscription = async (subscriptionId, newPlanId) => {
    try {
      await subscriptionService.upgradeSubscription(subscriptionId, newPlanId);
      await loadSubscription();
    } catch (err) {
      setError('Error al actualizar el plan');
      console.error('Subscription upgrade error:', err);
      throw err;
    }
  };

  const value = {
    subscription,
    loading,
    error,
    updateSubscription,
    cancelSubscription,
    upgradeSubscription,
    refreshSubscription: loadSubscription
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}; 