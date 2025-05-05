// Endpoint serverless para recibir webhooks de PayPal en Vercel
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, updateDoc, setDoc, Timestamp, collection, addDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

if (!getApps().length) {
  initializeApp(firebaseConfig);
}
const db = getFirestore();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  // PayPal envía el evento en el body
  const event = req.body;

  // Puedes loguear el evento para pruebas
  console.log('Webhook de PayPal recibido:', JSON.stringify(event, null, 2));

  // Ejemplo: solo aceptar pagos completados
  if (
    event.event_type === 'CHECKOUT.ORDER.APPROVED' ||
    event.event_type === 'PAYMENT.SALE.COMPLETED' ||
    event.event_type === 'PAYMENT.CAPTURE.COMPLETED'
  ) {
    // Extraer userId y planId del custom_id (debes asegurarte de enviarlo en el pago)
    const resource = event.resource || {};
    const customId = resource.custom_id || resource.custom || '';
    // Ejemplo: customId = "userId:planId"
    const [userId, planId] = customId.split(':');

    if (!userId || !planId) {
      console.error('No se pudo extraer userId o planId del custom_id:', customId);
      return res.status(400).json({ error: 'custom_id inválido' });
    }

    // Actualizar la suscripción en Firestore
    try {
      // Crear una nueva suscripción activa
      const subscriptionData = {
        userId,
        planId,
        status: 'active',
        startDate: Timestamp.now(),
        endDate: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // 30 días
        createdAt: Timestamp.now(),
        lastPaymentDate: Timestamp.now(),
        nextPaymentDate: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
        paymentStatus: 'paid',
        isTrial: false
      };
      const subscriptionRef = await addDoc(collection(db, 'subscriptions'), subscriptionData);
      // Actualizar el documento del usuario
      await updateDoc(doc(db, 'users', userId), {
        subscriptionId: subscriptionRef.id,
        planId,
        subscriptionStatus: 'active',
        subscriptionEndDate: subscriptionData.endDate,
        lastPaymentDate: Timestamp.now(),
        hasSelectedPlan: true
      });
      return res.status(200).json({ received: true, updated: true });
    } catch (error) {
      console.error('Error actualizando suscripción:', error);
      return res.status(500).json({ error: 'Error actualizando suscripción' });
    }
  }

  // Si no es un evento relevante, solo responde OK
  return res.status(200).json({ received: true });
} 