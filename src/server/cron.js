import { subscriptionService } from '../services/subscriptionService';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';

// Función para verificar usuarios con prueba expirada
const checkExpiredTrials = async () => {
  try {
    console.log('Verificando usuarios con prueba expirada...');
    await subscriptionService.handleExpiredTrials();
  } catch (error) {
    console.error('Error en la verificación de usuarios:', error);
  }
};

// Función para verificar usuarios con prueba próxima a expirar
const checkUpcomingExpirations = async () => {
  try {
    console.log('Verificando usuarios con prueba próxima a expirar...');
    const q = query(
      collection(db, 'users'),
      where('isTrial', '==', true),
      where('status', '!=', 'deleted')
    );
    
    const snapshot = await getDocs(q);
    const now = Timestamp.now();
    
    for (const doc of snapshot.docs) {
      const userData = doc.data();
      const daysUntilExpiration = Math.ceil((userData.trialEndDate.toDate() - now.toDate()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilExpiration === 3) {
        // Aquí podrías implementar el envío de notificaciones
        console.log(`Usuario ${doc.id} tiene 3 días restantes de prueba`);
      }
    }
  } catch (error) {
    console.error('Error verificando usuarios con prueba próxima a expirar:', error);
  }
};

// Inicializar las verificaciones
export const initializeTrialChecks = () => {
  // Verificar inmediatamente al iniciar
  checkExpiredTrials();
  checkUpcomingExpirations();

  // Configurar verificaciones periódicas (cada 24 horas)
  setInterval(checkExpiredTrials, 24 * 60 * 60 * 1000);
  setInterval(checkUpcomingExpirations, 24 * 60 * 60 * 1000);
}; 