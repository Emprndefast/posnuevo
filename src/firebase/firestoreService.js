import { db } from './config';
import { doc, getDoc, setDoc, collection } from 'firebase/firestore';

export const saveBusinessData = async (userId, data) => {
  try {
    const businessDocRef = doc(db, 'business_data', userId);
    const updatedData = {
      ...data,
      updatedAt: new Date(),
      isConfigured: Boolean(
        data.name &&
        data.address &&
        data.phone &&
        data.email
      )
    };

    await setDoc(businessDocRef, updatedData);
    return { success: true, data: updatedData };
  } catch (error) {
    console.error('Error al guardar los datos del negocio:', error);
    return { success: false, error: error.message };
  }
};

export const getBusinessData = async (userId) => {
  try {
    const businessDocRef = doc(db, 'business_data', userId);
    const businessDoc = await getDoc(businessDocRef);

    if (businessDoc.exists()) {
      const data = businessDoc.data();
      return {
        success: true,
        data: {
          ...data,
          isConfigured: Boolean(
            data.name &&
            data.address &&
            data.phone &&
            data.email
          )
        }
      };
    }
    return { success: true, data: null };
  } catch (error) {
    console.error('Error al obtener los datos del negocio:', error);
    return { success: false, error: error.message };
  }
};