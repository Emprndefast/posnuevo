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
      setSubscription(prevState => {
        if (!prevState || 
            prevState.isActive !== normalizedStatus.isActive || 
            prevState.planId !== normalizedStatus.planId ||
            (prevState.endDate && normalizedStatus.endDate && prevState.endDate.getTime() !== normalizedStatus.endDate.getTime())) {
          return normalizedStatus;
        }
        return prevState;
      });
      return normalizedStatus;
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

    const unsubscribe = onSnapshot(q, 
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
          setSubscription(prevState => {
            if (!prevState || prevState.id !== subscriptionData.id) {
              return subscriptionData;
            }
            return prevState;
          });
        } else {
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
    subscription,
    loading,
    error,
    checkSubscription,
    subscribe,
    cancelSubscription
  };
}; 