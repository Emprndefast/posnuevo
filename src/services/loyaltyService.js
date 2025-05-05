import { db } from '../firebase/config';
import { collection, doc, getDoc, updateDoc, addDoc, query, where, getDocs } from 'firebase/firestore';

export const loyaltyService = {
  // Calcular puntos basados en el monto de la compra
  calculatePoints: (amount) => {
    return Math.floor(amount * 0.1); // 10% del monto como puntos
  },

  // Agregar puntos a un cliente
  addPoints: async (customerId, points, transactionId) => {
    try {
      const customerRef = doc(db, 'customers', customerId);
      const customerDoc = await getDoc(customerRef);
      
      if (!customerDoc.exists()) {
        throw new Error('Cliente no encontrado');
      }

      const currentPoints = customerDoc.data().loyaltyPoints || 0;
      const newPoints = currentPoints + points;

      // Registrar la transacción de puntos
      await addDoc(collection(db, 'loyaltyTransactions'), {
        customerId,
        points,
        transactionId,
        type: 'earn',
        timestamp: new Date(),
      });

      // Actualizar puntos del cliente
      await updateDoc(customerRef, {
        loyaltyPoints: newPoints,
        lastPointsUpdate: new Date(),
      });

      return newPoints;
    } catch (error) {
      console.error('Error al agregar puntos:', error);
      throw error;
    }
  },

  // Canjear puntos por recompensas
  redeemPoints: async (customerId, pointsToRedeem, rewardId) => {
    try {
      const customerRef = doc(db, 'customers', customerId);
      const customerDoc = await getDoc(customerRef);
      
      if (!customerDoc.exists()) {
        throw new Error('Cliente no encontrado');
      }

      const currentPoints = customerDoc.data().loyaltyPoints || 0;
      
      if (currentPoints < pointsToRedeem) {
        throw new Error('Puntos insuficientes');
      }

      const newPoints = currentPoints - pointsToRedeem;

      // Registrar la transacción de canje
      await addDoc(collection(db, 'loyaltyTransactions'), {
        customerId,
        points: -pointsToRedeem,
        rewardId,
        type: 'redeem',
        timestamp: new Date(),
      });

      // Actualizar puntos del cliente
      await updateDoc(customerRef, {
        loyaltyPoints: newPoints,
        lastPointsUpdate: new Date(),
      });

      return newPoints;
    } catch (error) {
      console.error('Error al canjear puntos:', error);
      throw error;
    }
  },

  // Obtener historial de puntos
  getPointsHistory: async (customerId) => {
    try {
      const q = query(
        collection(db, 'loyaltyTransactions'),
        where('customerId', '==', customerId)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error al obtener historial:', error);
      throw error;
    }
  },

  // Obtener nivel de lealtad
  getLoyaltyLevel: (points) => {
    if (points >= 10000) return 'Oro';
    if (points >= 5000) return 'Plata';
    if (points >= 1000) return 'Bronce';
    return 'Nuevo';
  },

  // Calcular descuento basado en nivel
  calculateDiscount: (level) => {
    const discounts = {
      'Oro': 0.15,    // 15% de descuento
      'Plata': 0.10,  // 10% de descuento
      'Bronce': 0.05, // 5% de descuento
      'Nuevo': 0      // Sin descuento
    };
    return discounts[level] || 0;
  }
}; 