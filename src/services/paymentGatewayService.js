import { getFirestore, collection, addDoc, updateDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

class PaymentGatewayService {
  constructor() {
    this.db = getFirestore();
    this.auth = getAuth();
  }

  // Configurar pasarela de pago
  async configurePaymentGateway(gatewayData) {
    try {
      const user = this.auth.currentUser;
      if (!user) throw new Error('Usuario no autenticado');

      const gatewayRef = collection(this.db, 'paymentGateways');
      const docRef = await addDoc(gatewayRef, {
        ...gatewayData,
        userId: user.uid,
        createdAt: new Date(),
        isActive: true
      });

      return docRef.id;
    } catch (error) {
      console.error('Error al configurar pasarela de pago:', error);
      throw error;
    }
  }

  // Obtener pasarelas de pago del usuario autenticado
  async getPaymentGateways() {
    try {
      const user = this.auth.currentUser;
      if (!user) throw new Error('Usuario no autenticado');
      const gatewaysRef = collection(this.db, 'paymentGateways');
      const q = query(gatewaysRef, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error al obtener pasarelas de pago:', error);
      throw error;
    }
  }

  // Procesar pago
  async processPayment(paymentData) {
    try {
      const { amount, currency, paymentMethod, gatewayId } = paymentData;
      
      // Aquí se implementaría la lógica específica para cada pasarela de pago
      // Por ejemplo: Stripe, PayPal, MercadoPago, etc.
      
      const paymentRef = collection(this.db, 'payments');
      const docRef = await addDoc(paymentRef, {
        ...paymentData,
        status: 'pending',
        createdAt: new Date()
      });

      return docRef.id;
    } catch (error) {
      console.error('Error al procesar pago:', error);
      throw error;
    }
  }

  // Obtener historial de pagos
  async getPaymentHistory() {
    try {
      const user = this.auth.currentUser;
      if (!user) throw new Error('Usuario no autenticado');

      const paymentsRef = collection(this.db, 'payments');
      const querySnapshot = await getDocs(query(paymentsRef, where('userId', '==', user.uid)));
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error al obtener historial de pagos:', error);
      throw error;
    }
  }
}

export default new PaymentGatewayService(); 