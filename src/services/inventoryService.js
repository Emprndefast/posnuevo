import { db } from '../firebase/config';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  Timestamp,
  orderBy,
  increment
} from 'firebase/firestore';
import telegramService from './telegramService';
import { useTelegram } from '../context/TelegramContext';

class InventoryService {
  constructor() {
    this.collection = collection(db, 'inventory');
  }

  async create(inventoryData) {
    try {
      const inventory = {
        ...inventoryData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await addDoc(this.collection, inventory);
      return { id: docRef.id, ...inventory };
    } catch (error) {
      throw new Error('Error al crear el registro de inventario: ' + error.message);
    }
  }

  async updateStock(productId, quantity, config) {
    try {
      const productRef = doc(db, 'products', productId);
      const productDoc = await getDoc(productRef);

      if (!productDoc.exists()) {
        throw new Error('Producto no encontrado');
      }

      const productData = productDoc.data();
      const newStock = productData.stock + quantity;

      // Actualizar el stock
      await updateDoc(productRef, {
        stock: newStock,
        lastUpdated: new Date().toISOString()
      });

      // Verificar si el stock está bajo o agotado
      if (newStock <= productData.minStock) {
        // Enviar notificación de stock bajo
        if (config?.notifications?.lowStock) {
          try {
            await telegramService.notifyLowStock({
              botToken: config.botToken,
              chatId: config.chatId,
              name: productData.name,
              currentStock: newStock,
              minStock: productData.minStock
            });
            console.log('Notificación de stock bajo enviada correctamente');
          } catch (error) {
            console.error('Error al enviar notificación de stock bajo:', error);
          }
        }
      }

      // Verificar si el stock se agotó
      if (newStock === 0) {
        // Enviar notificación de stock agotado
        if (config?.notifications?.outOfStock) {
          try {
            await telegramService.notifyOutOfStock({
              botToken: config.botToken,
              chatId: config.chatId,
              name: productData.name,
              code: productData.code
            });
            console.log('Notificación de stock agotado enviada correctamente');
          } catch (error) {
            console.error('Error al enviar notificación de stock agotado:', error);
          }
        }
      }

      return {
        success: true,
        newStock,
        product: {
          id: productId,
          name: productData.name,
          stock: newStock,
          minStock: productData.minStock
        }
      };
    } catch (error) {
      console.error('Error al actualizar stock:', error);
      throw error;
    }
  }

  async getStock(productId) {
    try {
      const docRef = doc(this.collection, productId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data().stock;
      }
      return 0;
    } catch (error) {
      throw new Error('Error al obtener el stock: ' + error.message);
    }
  }

  async getLowStock(threshold = 10) {
    try {
      const q = query(
        this.collection,
        where('stock', '<=', threshold),
        orderBy('stock', 'asc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error('Error al obtener productos con bajo stock: ' + error.message);
    }
  }

  async getInventoryHistory(productId) {
    try {
      const historyCollection = collection(db, 'inventory_history');
      const q = query(
        historyCollection,
        where('productId', '==', productId),
        orderBy('date', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error('Error al obtener el historial de inventario: ' + error.message);
    }
  }

  async recordMovement(productId, quantity, type, reason) {
    try {
      const historyCollection = collection(db, 'inventory_history');
      const movement = {
        productId,
        quantity,
        type,
        reason,
        date: Timestamp.now(),
        createdAt: Timestamp.now()
      };

      await addDoc(historyCollection, movement);
      return true;
    } catch (error) {
      throw new Error('Error al registrar el movimiento: ' + error.message);
    }
  }

  async adjustStock(productId, newStock, reason) {
    try {
      const currentStock = await this.getStock(productId);
      const difference = newStock - currentStock;
      
      await this.updateStock(productId, Math.abs(difference), difference > 0 ? 'add' : 'subtract');
      await this.recordMovement(
        productId,
        Math.abs(difference),
        difference > 0 ? 'adjustment_add' : 'adjustment_subtract',
        reason
      );

      return true;
    } catch (error) {
      throw new Error('Error al ajustar el stock: ' + error.message);
    }
  }

  async checkLowStock(productId, config) {
    try {
      const productRef = doc(db, 'products', productId);
      const productDoc = await getDoc(productRef);

      if (!productDoc.exists()) {
        throw new Error('Producto no encontrado');
      }

      const productData = productDoc.data();

      if (productData.stock <= productData.minStock) {
        // Enviar notificación de stock bajo
        if (config?.notifications?.lowStock) {
          try {
            await telegramService.notifyLowStock({
              botToken: config.botToken,
              chatId: config.chatId,
              name: productData.name,
              currentStock: productData.stock,
              minStock: productData.minStock
            });
            console.log('Notificación de stock bajo enviada correctamente');
          } catch (error) {
            console.error('Error al enviar notificación de stock bajo:', error);
          }
        }
      }

      return {
        success: true,
        isLowStock: productData.stock <= productData.minStock,
        product: {
          id: productId,
          name: productData.name,
          stock: productData.stock,
          minStock: productData.minStock
        }
      };
    } catch (error) {
      console.error('Error al verificar stock bajo:', error);
      throw error;
    }
  }
}

export default new InventoryService(); 