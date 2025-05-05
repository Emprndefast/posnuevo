import { getFirestore, collection, addDoc, updateDoc, doc, getDocs, query, where, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

class PromotionService {
  constructor() {
    this.db = getFirestore();
    this.auth = getAuth();
  }

  // Crear promoción
  async createPromotion(promotionData) {
    try {
      const user = this.auth.currentUser;
      if (!user) throw new Error('Usuario no autenticado');

      const promotionRef = collection(this.db, 'promotions');
      const docRef = await addDoc(promotionRef, {
        ...promotionData,
        userId: user.uid,
        createdAt: new Date(),
        isActive: true
      });

      return docRef.id;
    } catch (error) {
      console.error('Error al crear promoción:', error);
      throw error;
    }
  }

  // Obtener todas las promociones del usuario
  async getPromotions() {
    try {
      const user = this.auth.currentUser;
      if (!user) throw new Error('Usuario no autenticado');
      const promotionsRef = collection(this.db, 'promotions');
      const q = query(promotionsRef, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error al obtener promociones:', error);
      throw error;
    }
  }

  // Actualizar promoción
  async updatePromotion(promotionId, promotionData) {
    try {
      const promotionRef = doc(this.db, 'promotions', promotionId);
      await updateDoc(promotionRef, {
        ...promotionData,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error al actualizar promoción:', error);
      throw error;
    }
  }

  // Eliminar promoción
  async deletePromotion(promotionId) {
    try {
      const promotionRef = doc(this.db, 'promotions', promotionId);
      await deleteDoc(promotionRef);
    } catch (error) {
      console.error('Error al eliminar promoción:', error);
      throw error;
    }
  }

  // Obtener promociones activas
  async getActivePromotions() {
    try {
      const user = this.auth.currentUser;
      if (!user) throw new Error('Usuario no autenticado');

      const promotionsRef = collection(this.db, 'promotions');
      // Traer todas las promociones activas del usuario (sin filtrar por fecha en la consulta)
      const q = query(
        promotionsRef,
        where('userId', '==', user.uid),
        where('isActive', '==', true)
      );

      const querySnapshot = await getDocs(q);
      const now = new Date();
      // Filtrar por fecha de fin en el frontend, soportando string, Timestamp y Date
      return querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(promotion => {
          const endDate = promotion.endDate;
          if (!endDate) return false;
          if (typeof endDate === 'string') {
            // Formato string (YYYY-MM-DD o similar)
            const parsed = new Date(endDate);
            return !isNaN(parsed) && parsed >= now;
          } else if (endDate.toDate) {
            // Firestore Timestamp
            return endDate.toDate() >= now;
          } else if (endDate instanceof Date) {
            // Objeto Date
            return endDate >= now;
          }
          return false;
        });
    } catch (error) {
      console.error('Error al obtener promociones activas:', error);
      throw error;
    }
  }

  // Aplicar promoción a una venta
  async applyPromotion(saleId, promotionId) {
    try {
      const promotionRef = doc(this.db, 'promotions', promotionId);
      const promotionDoc = await getDoc(promotionRef);
      const promotion = promotionDoc.data();

      const saleRef = doc(this.db, 'sales', saleId);
      const saleDoc = await getDoc(saleRef);
      const sale = saleDoc.data();

      // Calcular descuento según tipo de promoción
      let discount = 0;
      switch (promotion.type) {
        case 'percentage':
          discount = sale.total * (promotion.value / 100);
          break;
        case 'fixed':
          discount = promotion.value;
          break;
        case 'buyXgetY':
          // Implementar lógica para promociones tipo "compre X lleve Y"
          break;
      }

      // Actualizar venta con el descuento
      await updateDoc(saleRef, {
        discount,
        promotionId,
        total: sale.total - discount
      });

      return discount;
    } catch (error) {
      console.error('Error al aplicar promoción:', error);
      throw error;
    }
  }

  // Verificar si un producto califica para una promoción
  async checkProductPromotion(productId) {
    try {
      const promotions = await this.getActivePromotions();
      const productRef = doc(this.db, 'products', productId);
      const productDoc = await getDoc(productRef);
      const product = productDoc.data();

      return promotions.filter(promotion => {
        if (promotion.products && promotion.products.includes(productId)) {
          return true;
        }
        if (promotion.categories && promotion.categories.includes(product.category)) {
          return true;
        }
        return false;
      });
    } catch (error) {
      console.error('Error al verificar promociones del producto:', error);
      throw error;
    }
  }
}

export default new PromotionService(); 