import { getFunctions, httpsCallable } from 'firebase/functions';
import { SUBSCRIPTION_PLANS } from '../constants/subscriptions';

const functions = getFunctions();

export const createCheckoutSession = async (planId, userId) => {
  try {
    const plan = SUBSCRIPTION_PLANS[planId];
    if (!plan) throw new Error('Plan no válido');

    const createStripeCheckout = httpsCallable(functions, 'createStripeCheckout');
    const { data } = await createStripeCheckout({
      planId,
      priceId: plan.stripePriceId,
      userId,
      successUrl: `${window.location.origin}/subscription/success`,
      cancelUrl: `${window.location.origin}/subscription/cancel`
    });

    return data.sessionId;
  } catch (error) {
    console.error('Error al crear sesión de pago:', error);
    throw error;
  }
};

export const createPortalSession = async (userId) => {
  try {
    const createStripePortal = httpsCallable(functions, 'createStripePortal');
    const { data } = await createStripePortal({
      userId,
      returnUrl: `${window.location.origin}/subscription`
    });

    return data.url;
  } catch (error) {
    console.error('Error al crear sesión del portal:', error);
    throw error;
  }
};

export const getSubscriptionStatus = async (userId) => {
  try {
    const getSubscription = httpsCallable(functions, 'getSubscription');
    const { data } = await getSubscription({ userId });
    return data;
  } catch (error) {
    console.error('Error al obtener estado de suscripción:', error);
    throw error;
  }
}; 