import { db } from '../firebase/config';
import { doc, updateDoc, Timestamp, collection, query, where, getDocs } from 'firebase/firestore';

export const testUtils = {
  // Modificar la fecha de inicio de prueba de un usuario
  async modifyTrialDate(userId, daysToSubtract = 15) {
    try {
      const userRef = doc(db, 'users', userId);
      const trialStartDate = new Date();
      trialStartDate.setDate(trialStartDate.getDate() - daysToSubtract);
      
      await updateDoc(userRef, {
        trialStartDate: Timestamp.fromDate(trialStartDate),
        trialEndDate: Timestamp.fromDate(new Date(trialStartDate.getTime() + 15 * 24 * 60 * 60 * 1000)),
        isTrial: true,
        status: 'active'
      });

      console.log(`Fecha de prueba modificada para el usuario ${userId}`);
      console.log(`Nueva fecha de inicio: ${trialStartDate}`);
      console.log(`Nueva fecha de fin: ${new Date(trialStartDate.getTime() + 15 * 24 * 60 * 60 * 1000)}`);
      
      return true;
    } catch (error) {
      console.error('Error modificando fecha de prueba:', error);
      throw error;
    }
  },

  // Restaurar la fecha de prueba a la fecha actual
  async restoreTrialDate(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const now = new Date();
      
      await updateDoc(userRef, {
        trialStartDate: Timestamp.now(),
        trialEndDate: Timestamp.fromDate(new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000)),
        isTrial: true,
        status: 'active'
      });

      console.log(`Fecha de prueba restaurada para el usuario ${userId}`);
      return true;
    } catch (error) {
      console.error('Error restaurando fecha de prueba:', error);
      throw error;
    }
  },

  // Modificar datos de suscripción para simular vencimiento
  async modifySubscriptionToExpired(userId) {
    try {
      // Primero, buscar la suscripción del usuario
      const q = query(
        collection(db, 'subscriptions'),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        throw new Error('No se encontró suscripción para este usuario');
      }

      const subscriptionDoc = snapshot.docs[0];
      const subscriptionRef = doc(db, 'subscriptions', subscriptionDoc.id);

      // Calcular fechas para simular vencimiento
      const now = new Date();
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 16); // 16 días atrás para asegurar vencimiento

      await updateDoc(subscriptionRef, {
        startDate: Timestamp.fromDate(startDate),
        endDate: Timestamp.fromDate(new Date(startDate.getTime() + 15 * 24 * 60 * 60 * 1000)),
        trialEndDate: Timestamp.fromDate(new Date(startDate.getTime() + 15 * 24 * 60 * 60 * 1000)),
        nextPaymentDate: Timestamp.fromDate(new Date(startDate.getTime() + 15 * 24 * 60 * 60 * 1000)),
        status: 'active',
        paymentStatus: 'paid',
        isTrial: true
      });

      // Actualizar también el documento del usuario
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        trialStartDate: Timestamp.fromDate(startDate),
        trialEndDate: Timestamp.fromDate(new Date(startDate.getTime() + 15 * 24 * 60 * 60 * 1000)),
        isTrial: true,
        status: 'active'
      });

      console.log('Datos de suscripción modificados para simular vencimiento');
      return true;
    } catch (error) {
      console.error('Error modificando suscripción:', error);
      throw error;
    }
  },

  // Desactivar la posibilidad de usar el plan gratuito
  async disableFreePlan(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        canUseFreePlan: false,
        freePlanUsed: true
      });

      console.log(`Plan gratuito desactivado para el usuario ${userId}`);
      return true;
    } catch (error) {
      console.error('Error desactivando plan gratuito:', error);
      throw error;
    }
  },

  // Habilitar la posibilidad de usar el plan gratuito
  async enableFreePlan(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        canUseFreePlan: true,
        freePlanUsed: false
      });

      console.log(`Plan gratuito habilitado para el usuario ${userId}`);
      return true;
    } catch (error) {
      console.error('Error habilitando plan gratuito:', error);
      throw error;
    }
  }
}; 