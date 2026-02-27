import { useState, useEffect, useCallback } from 'react';
import { onSnapshot, query, collection, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { subscriptionService } from '../services/subscriptionService';
import { useAuth } from '../context/AuthContextMongo';

// Utilidad para convertir a Date
function toDateSafe(val) {
  if (!val) return null;
  if (val instanceof Date) return val;
  if (typeof val.toDate === 'function') return val.toDate();
  if (typeof val === 'string' || typeof val === 'number') return new Date(val);
  return null;
}

// Aplicar privilegios PRO basados en Mongo (JWT) para el dueño principal
function applyMongoPlanOverride(status, user) {
  if (!user || !status) return status;

  const isMainAdmin = user.email?.toLowerCase() === 'nachotechrd@gmail.com';
  const mongoPlan = user.plan;

  if (isMainAdmin || mongoPlan === 'pro') {
    return {
      ...status,
      isActive: true,
      planId: 'pro',
      planName: 'Plan Profesional',
      isPermanent: true,
      canUseFreePlan: false,
      freePlanUsed: true
    };
  }

  return status;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkSubscription = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return null;
    }

    try {
      const status = await subscriptionService.checkSubscriptionStatus(user.uid);
      // Normalizar fechas
      const normalizedStatus = {
        ...status,
        endDate: toDateSafe(status.endDate),
        nextPaymentDate: toDateSafe(status.nextPaymentDate),
        trialEndDate: toDateSafe(status.trialEndDate),
        dataRetentionEndDate: toDateSafe(status.dataRetentionEndDate)
      };

      // Si en Mongo eres PRO / dueño principal, forzar plan PRO
      const finalStatus = applyMongoPlanOverride(normalizedStatus, user);

      setSubscription(prevState => {
        if (
          !prevState ||
          prevState.isActive !== finalStatus.isActive ||
          prevState.planId !== finalStatus.planId ||
          (prevState.endDate &&
            finalStatus.endDate &&
            prevState.endDate.getTime() !== finalStatus.endDate.getTime())
        ) {
          return finalStatus;
        }
        return prevState;
      });
      return finalStatus;
    } catch (err) {
      console.error('Error checking subscription:', err);
      setError(err);
      throw err;
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Configurar el listener de suscripción en tiempo real
    const q = query(
      collection(db, 'subscriptions'),
      where('userId', '==', user.uid),
      where('status', '==', 'active')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const data = snapshot.docs[0].data();
          // Normalizar fechas
          const subscriptionData = {
            id: snapshot.docs[0].id,
            ...data,
            isActive: true,
            endDate: toDateSafe(data.endDate),
            nextPaymentDate: toDateSafe(data.nextPaymentDate),
            trialEndDate: toDateSafe(data.trialEndDate),
            dataRetentionEndDate: toDateSafe(data.dataRetentionEndDate)
          };

          const finalData = applyMongoPlanOverride(subscriptionData, user);

          setSubscription(prevState => {
            if (!prevState || prevState.id !== finalData.id) {
              return finalData;
            }
            return prevState;
          });
        } else {
          // Sin doc de suscripción activa en Firestore:
          // dejar que el fallback de user.plan actúe
          setSubscription(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error al escuchar cambios en la suscripción:', err);
        setError(err);
        setLoading(false);
      }
    );

    // Verificar el estado inicial de la suscripción
    checkSubscription().catch(console.error);

    return () => unsubscribe();
  }, [user, checkSubscription]);

  // Función para suscribirse a un plan
  const subscribe = async (plan) => {
    try {
      if (!user) throw new Error('Usuario no autenticado');
      setLoading(true);
      const newSubscription = await subscriptionService.createSubscription(user.uid, plan);
      return newSubscription;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Función para cancelar la suscripción
  const cancelSubscription = async () => {
    try {
      if (!user || !subscription) throw new Error('No hay suscripción activa');
      setLoading(true);
      await subscriptionService.cancelSubscription(subscription.id, user.uid);
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    subscription: subscription || (user?.plan ? {
      isActive: true,
      planId: user.plan,
      planName: user.plan.toUpperCase(),
      isPermanent: true
    } : null),
    loading,
    error,
    checkSubscription,
    subscribe,
    cancelSubscription
  };
}; 