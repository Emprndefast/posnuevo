import { db } from '../firebase/config';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp,
  addDoc,
  deleteDoc
} from 'firebase/firestore';

export const subscriptionService = {
  // Obtener la suscripción activa del usuario
  async getCurrentSubscription(userId) {
    try {
      const q = query(
        collection(db, 'subscriptions'),
        where('userId', '==', userId),
        where('status', '==', 'active')
      );
      const snapshot = await getDocs(q);
      return !snapshot.empty ? { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } : null;
    } catch (error) {
      console.error('Error getting subscription:', error);
      throw error;
    }
  },

  // Crear o actualizar documento de usuario
  async ensureUserDocument(userId, userData) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        // Si el documento no existe, créalo
        await setDoc(userRef, {
          ...userData,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
      } else {
        // Si existe, actualízalo
        await updateDoc(userRef, {
          ...userData,
          updatedAt: Timestamp.now()
        });
      }
    } catch (error) {
      console.error('Error ensuring user document:', error);
      throw error;
    }
  },

  // Crear una nueva suscripción
  async createSubscription(userId, plan) {
    try {
      // Solo cancelar suscripción activa si existe y no es gratuita
      const currentSub = await this.getCurrentSubscription(userId);
      if (currentSub && currentSub.planId !== 'free') {
        await this.cancelCurrentSubscription(userId);
      }

      const subscriptionData = {
        userId,
        planId: plan.id,
        planName: plan.name,
        price: plan.price,
        status: 'active',
        startDate: Timestamp.now(),
        endDate: Timestamp.fromDate(new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)), // 15 días de demo
        dataRetentionEndDate: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // 30 días de retención de datos
        createdAt: Timestamp.now(),
        lastPaymentDate: Timestamp.now(),
        nextPaymentDate: Timestamp.fromDate(new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)),
        paymentStatus: 'paid',
        features: plan.features,
        limitations: plan.limitations,
        isTrial: plan.id === 'free',
        trialEndDate: Timestamp.fromDate(new Date(Date.now() + 15 * 24 * 60 * 60 * 1000))
      };

      // Crear la suscripción
      const subscriptionRef = await addDoc(collection(db, 'subscriptions'), subscriptionData);
      
      // Asegurarse de que existe el documento de usuario y actualizarlo
      await this.ensureUserDocument(userId, {
        subscriptionId: subscriptionRef.id,
        planId: plan.id,
        subscriptionStatus: 'active',
        subscriptionEndDate: subscriptionData.endDate,
        dataRetentionEndDate: subscriptionData.dataRetentionEndDate,
        isTrial: plan.id === 'free',
        trialEndDate: subscriptionData.trialEndDate,
        hasSelectedPlan: true,
        planFeatures: plan.features,
        planLimitations: plan.limitations,
        canUseFreePlan: plan.id === 'free' ? false : true, // Solo desactivar si se selecciona el plan gratuito
        freePlanUsed: plan.id === 'free' // Marcar como usado solo si es el plan gratuito
      });

      return { id: subscriptionRef.id, ...subscriptionData };
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  },

  // Cancelar suscripción
  async cancelSubscription(subscriptionId, userId) {
    try {
      const subscriptionRef = doc(db, 'subscriptions', subscriptionId);
      await updateDoc(subscriptionRef, {
        status: 'cancelled',
        cancelledAt: Timestamp.now(),
        endDate: Timestamp.now() // Termina inmediatamente
      });

      // Actualizar el documento del usuario
      await this.ensureUserDocument(userId, {
        subscriptionId: null,
        planId: 'free',
        subscriptionStatus: 'cancelled',
        subscriptionEndDate: Timestamp.now()
      });

      return true;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  },

  // Cancelar suscripción actual si existe
  async cancelCurrentSubscription(userId) {
    try {
      const currentSub = await this.getCurrentSubscription(userId);
      if (currentSub) {
        await this.cancelSubscription(currentSub.id, userId);
      }
    } catch (error) {
      console.error('Error cancelling current subscription:', error);
      throw error;
    }
  },

  // Verificar estado de suscripción
  async checkSubscriptionStatus(userId) {
    try {
      const subscription = await this.getCurrentSubscription(userId);
      
      if (!subscription) {
        // Asegurarse de que el usuario tenga un documento con plan gratuito
        await this.ensureUserDocument(userId, {
          planId: 'free',
          planName: 'Plan Gratuito',
          subscriptionStatus: 'inactive',
          subscriptionId: null,
          hasSelectedPlan: false
        });
        return { 
          isActive: false, 
          planId: 'free',
          planName: 'Plan Gratuito',
          hasSelectedPlan: false,
          endDate: null,
          nextPaymentDate: null,
          trialEndDate: null,
          dataRetentionEndDate: null
        };
      }

      const now = Timestamp.now();
      const isExpired = subscription.endDate.toDate() < now.toDate();
      const isPaymentOverdue = subscription.paymentStatus !== 'paid';
      const isDataRetentionExpired = subscription.dataRetentionEndDate.toDate() < now.toDate();

      // Notificar al usuario cuando falten 3 días para el fin de la demo
      const daysUntilTrialEnd = Math.ceil((subscription.trialEndDate.toDate() - now.toDate()) / (1000 * 60 * 60 * 24));
      if (daysUntilTrialEnd <= 3 && daysUntilTrialEnd > 0) {
        // Aquí podrías implementar una notificación al usuario
        console.log(`Quedan ${daysUntilTrialEnd} días de prueba`);
      }

      if (isExpired || isPaymentOverdue) {
        // Cancelar suscripción si está expirada
        await this.cancelSubscription(subscription.id, userId);
        return { 
          isActive: false, 
          planId: 'free',
          planName: 'Plan Gratuito',
          trialEnded: true,
          dataRetentionEndDate: subscription.dataRetentionEndDate?.toDate?.() || null,
          hasSelectedPlan: true,
          endDate: subscription.endDate?.toDate?.() || null,
          nextPaymentDate: subscription.nextPaymentDate?.toDate?.() || null,
          trialEndDate: subscription.trialEndDate?.toDate?.() || null
        };
      }

      if (isDataRetentionExpired) {
        // Aquí podrías implementar la lógica para eliminar los datos del usuario
        console.log('Período de retención de datos expirado');
      }

      return {
        isActive: true,
        planId: subscription.planId,
        planName: subscription.planName,
        endDate: subscription.endDate?.toDate?.() || null,
        nextPaymentDate: subscription.nextPaymentDate?.toDate?.() || null,
        isTrial: subscription.isTrial,
        trialEndDate: subscription.trialEndDate?.toDate?.() || null,
        daysUntilTrialEnd,
        hasSelectedPlan: true,
        dataRetentionEndDate: subscription.dataRetentionEndDate?.toDate?.() || null
      };
    } catch (error) {
      console.error('Error checking subscription status:', error);
      throw error;
    }
  },

  // Renovar suscripción
  async renewSubscription(subscriptionId, userId) {
    try {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      await updateDoc(doc(db, 'subscriptions', subscriptionId), {
        endDate: Timestamp.fromDate(nextMonth),
        lastPaymentDate: Timestamp.now(),
        nextPaymentDate: Timestamp.fromDate(nextMonth),
        paymentStatus: 'paid'
      });

      await this.ensureUserDocument(userId, {
        subscriptionStatus: 'active',
        subscriptionEndDate: Timestamp.fromDate(nextMonth)
      });

      return true;
    } catch (error) {
      console.error('Error renewing subscription:', error);
      throw error;
    }
  },

  // Verificar si el período de prueba ha expirado
  async checkTrialExpiration(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists() || !userDoc.data().isTrial) {
        return { isExpired: false };
      }

      const trialEndDate = userDoc.data().trialEndDate;
      const now = Timestamp.now();
      const isExpired = trialEndDate.toDate() < now.toDate();
      const daysUntilExpiration = Math.ceil((trialEndDate.toDate() - now.toDate()) / (1000 * 60 * 60 * 24));

      return {
        isExpired,
        daysUntilExpiration,
        trialEndDate: trialEndDate.toDate()
      };
    } catch (error) {
      console.error('Error checking trial expiration:', error);
      throw error;
    }
  },

  // Crear backup de datos del usuario
  async createUserBackup(userId) {
    try {
      const backupData = {
        userId,
        createdAt: Timestamp.now(),
        status: 'pending_deletion'
      };

      const backupRef = await addDoc(collection(db, 'user_backups'), backupData);
      return backupRef.id;
    } catch (error) {
      console.error('Error creating user backup:', error);
      throw error;
    }
  },

  // Eliminar datos del usuario
  async deleteUserData(userId) {
    try {
      // Crear backup antes de eliminar
      const backupId = await this.createUserBackup(userId);

      // Eliminar datos del usuario
      const collectionsToDelete = ['sales', 'inventory', 'configurations'];
      
      for (const collectionName of collectionsToDelete) {
        const q = query(collection(db, collectionName), where('userId', '==', userId));
        const snapshot = await getDocs(q);
        
        for (const doc of snapshot.docs) {
          await deleteDoc(doc.ref);
        }
      }

      // Actualizar estado del usuario
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        status: 'deleted',
        deletedAt: Timestamp.now(),
        backupId
      });

      return true;
    } catch (error) {
      console.error('Error deleting user data:', error);
      throw error;
    }
  },

  // Al expirar el trial, marcar usuario como trialUsed y blocked
  async blockUserAfterTrial(userId) {
    try {
      await updateDoc(doc(db, 'users', userId), {
        trialUsed: true,
        blocked: true,
        blockedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error bloqueando usuario tras trial:', error);
      throw error;
    }
  },

  // Validar si un email o teléfono ya usó trial o está bloqueado
  async isUserBlockedByEmailOrPhone(email, phone) {
    try {
      let q = query(collection(db, 'users'), where('email', '==', email));
      let snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const user = snapshot.docs[0].data();
        if (user.trialUsed || user.blocked) return true;
      }
      if (phone) {
        q = query(collection(db, 'users'), where('phone', '==', phone));
        snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const user = snapshot.docs[0].data();
          if (user.trialUsed || user.blocked) return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error validando usuario bloqueado:', error);
      throw error;
    }
  },

  // En handleExpiredTrials, llamar a blockUserAfterTrial tras borrar datos
  async handleExpiredTrials() {
    try {
      const q = query(
        collection(db, 'users'),
        where('isTrial', '==', true),
        where('status', '!=', 'deleted')
      );
      const snapshot = await getDocs(q);
      const now = Timestamp.now();
      for (const docSnap of snapshot.docs) {
        const userData = docSnap.data();
        if (userData.trialEndDate.toDate() < now.toDate()) {
          await this.deleteUserData(docSnap.id);
          await this.blockUserAfterTrial(docSnap.id);
        }
      }
    } catch (error) {
      console.error('Error handling expired trials:', error);
      throw error;
    }
  }
}; 