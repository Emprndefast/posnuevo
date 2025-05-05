import { db, storage } from '../firebase/config';
import { collection, getDocs, query, where, doc, getDoc, addDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const backupService = {
  // Obtener todos los datos del usuario para el respaldo
  async getAllUserData(userId) {
    try {
      const data = {
        productos: [],
        ventas: [],
        clientes: [],
        configuracion: null,
        timestamp: new Date().toISOString()
      };

      // Obtener productos
      const productosRef = collection(db, 'productos');
      const productosQuery = query(productosRef, where('userId', '==', userId));
      const productosSnapshot = await getDocs(productosQuery);
      data.productos = productosSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Obtener ventas
      const ventasRef = collection(db, 'ventas');
      const ventasQuery = query(ventasRef, where('userId', '==', userId));
      const ventasSnapshot = await getDocs(ventasQuery);
      data.ventas = ventasSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Obtener clientes
      const clientesRef = collection(db, 'clientes');
      const clientesQuery = query(clientesRef, where('userId', '==', userId));
      const clientesSnapshot = await getDocs(clientesQuery);
      data.clientes = clientesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Obtener configuración
      const configRef = doc(db, 'configuracion', userId);
      const configDoc = await getDoc(configRef);
      if (configDoc.exists()) {
        data.configuracion = configDoc.data();
      }

      return data;
    } catch (error) {
      console.error('Error al obtener datos para respaldo:', error);
      throw new Error('Error al obtener datos para respaldo');
    }
  },

  // Crear un respaldo y guardarlo en Storage
  async createBackup(userId, subscription) {
    try {
      // Verificar si el usuario tiene permiso según su plan
      if (!subscription?.isActive) {
        throw new Error('Necesitas una suscripción activa para crear respaldos');
      }

      // Obtener todos los datos
      const data = await this.getAllUserData(userId);
      
      // Crear nombre del archivo con fecha
      const fecha = format(new Date(), "dd-MMM-yyyy_HH-mm", { locale: es });
      const fileName = `backup_${fecha}.json`;
      
      // Crear referencia en Storage
      const backupRef = ref(storage, `backups/${userId}/${fileName}`);
      
      // Convertir datos a JSON y subir
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      await uploadBytes(backupRef, blob);

      // Obtener URL de descarga
      const downloadURL = await getDownloadURL(backupRef);

      // Guardar referencia del backup en Firestore
      const backupsRef = collection(db, 'backups');
      const backupData = {
        userId,
        fileName,
        createdAt: new Date(),
        downloadURL,
        size: blob.size,
        items: {
          productos: data.productos.length,
          ventas: data.ventas.length,
          clientes: data.clientes.length
        }
      };

      await addDoc(backupsRef, backupData);

      return {
        fileName,
        downloadURL,
        createdAt: backupData.createdAt,
        size: backupData.size,
        items: backupData.items
      };
    } catch (error) {
      console.error('Error al crear respaldo:', error);
      throw new Error('Error al crear respaldo: ' + error.message);
    }
  },

  // Obtener lista de respaldos del usuario
  async getBackupsList(userId) {
    try {
      const backupsRef = collection(db, 'backups');
      const backupsQuery = query(backupsRef, 
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(backupsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate()
      }));
    } catch (error) {
      console.error('Error al obtener lista de respaldos:', error);
      throw new Error('Error al obtener lista de respaldos');
    }
  },

  // Eliminar un respaldo
  async deleteBackup(userId, backupId, fileName) {
    try {
      // Eliminar archivo de Storage
      const fileRef = ref(storage, `backups/${userId}/${fileName}`);
      await deleteObject(fileRef);

      // Eliminar registro de Firestore
      const backupRef = doc(db, 'backups', backupId);
      await deleteDoc(backupRef);

      return true;
    } catch (error) {
      console.error('Error al eliminar respaldo:', error);
      throw new Error('Error al eliminar respaldo');
    }
  }
}; 