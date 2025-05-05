import React from 'react';
import { useSubscription } from '../hooks/useSubscription';
import '../styles/SubscriptionManager.css';

export const SubscriptionManager = () => {
  const {
    subscription,
    loading,
    error,
    subscribeToPlan,
    cancelSubscription
  } = useSubscription();

  const handleSubscribe = async (planType) => {
    try {
      await subscribeToPlan({
        type: planType,
        price: planType === 'premium' ? 19.99 : 9.99,
        features: planType === 'premium' 
          ? ['Característica 1', 'Característica 2', 'Característica 3']
          : ['Característica 1']
      });
    } catch (err) {
      console.error('Error al suscribirse:', err);
    }
  };

  const handleCancel = async () => {
    try {
      await cancelSubscription();
    } catch (err) {
      console.error('Error al cancelar:', err);
    }
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="subscription-manager">
      <h2>Gestión de Suscripción</h2>
      
      {subscription ? (
        <div className="current-subscription">
          <h3>Suscripción Actual</h3>
          <p>Plan: {subscription.type}</p>
          <p>Estado: {subscription.status}</p>
          <p>Precio: ${subscription.price}</p>
          <button 
            onClick={handleCancel}
            className="cancel-button"
          >
            Cancelar Suscripción
          </button>
        </div>
      ) : (
        <div className="subscription-options">
          <h3>Planes Disponibles</h3>
          <div className="plans-grid">
            <div className="plan-card">
              <h4>Plan Básico</h4>
              <p>$9.99/mes</p>
              <ul>
                <li>Característica 1</li>
              </ul>
              <button 
                onClick={() => handleSubscribe('basic')}
                className="subscribe-button"
              >
                Suscribirse
              </button>
            </div>
            
            <div className="plan-card">
              <h4>Plan Premium</h4>
              <p>$19.99/mes</p>
              <ul>
                <li>Característica 1</li>
                <li>Característica 2</li>
                <li>Característica 3</li>
              </ul>
              <button 
                onClick={() => handleSubscribe('premium')}
                className="subscribe-button premium"
              >
                Suscribirse
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 