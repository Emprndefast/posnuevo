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
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getAuth } from 'firebase/auth';

class SaleService {
  constructor() {
    this.collection = collection(db, 'sales');
  }

  async create(saleData) {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) throw new Error('Usuario no autenticado');
      if (!user.businessId) throw new Error('Usuario no asociado a un negocio');

      const sale = {
        ...saleData,
        businessId: user.businessId,
        userId: user.uid,
        date: Timestamp.now(),
        status: 'completed',
        total: this.calculateTotal(saleData.items),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await addDoc(this.collection, sale);
      return { id: docRef.id, ...sale };
    } catch (error) {
      throw new Error('Error al crear la venta: ' + error.message);
    }
  }

  async getById(id) {
    try {
      const docRef = doc(this.collection, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      throw new Error('Venta no encontrada');
    } catch (error) {
      throw new Error('Error al obtener la venta: ' + error.message);
    }
  }

  async getAll(filters = {}) {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) throw new Error('Usuario no autenticado');
      if (!user.businessId) throw new Error('Usuario no asociado a un negocio');

      let q = query(this.collection, where('businessId', '==', user.businessId));
      
      if (filters.startDate && filters.endDate) {
        q = query(
          q,
          where('date', '>=', Timestamp.fromDate(new Date(filters.startDate))),
          where('date', '<=', Timestamp.fromDate(new Date(filters.endDate)))
        );
      }

      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }

      q = query(q, orderBy('date', 'desc'));

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error('Error al obtener las ventas: ' + error.message);
    }
  }

  async getDailySales() {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) throw new Error('Usuario no autenticado');
      if (!user.businessId) throw new Error('Usuario no asociado a un negocio');

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const q = query(
        this.collection,
        where('businessId', '==', user.businessId),
        where('date', '>=', Timestamp.fromDate(today)),
        where('status', '==', 'completed')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error('Error al obtener las ventas diarias: ' + error.message);
    }
  }

  async getTopProducts(limitCount = 5) {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) throw new Error('Usuario no autenticado');
      if (!user.businessId) throw new Error('Usuario no asociado a un negocio');

      const sales = await this.getAll({ status: 'completed' });
      
      const productMap = new Map();
      
      sales.forEach(sale => {
        sale.items.forEach(item => {
          const current = productMap.get(item.productId) || { 
            productId: item.productId,
            name: item.name,
            quantity: 0,
            total: 0
          };
          
          current.quantity += item.quantity;
          current.total += item.price * item.quantity;
          
          productMap.set(item.productId, current);
        });
      });

      return Array.from(productMap.values())
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, limitCount);
    } catch (error) {
      throw new Error('Error al obtener los productos más vendidos: ' + error.message);
    }
  }

  async cancelSale(id) {
    try {
      const docRef = doc(this.collection, id);
      await updateDoc(docRef, {
        status: 'cancelled',
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      throw new Error('Error al cancelar la venta: ' + error.message);
    }
  }

  calculateTotal(items) {
    return items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  }

  formatDate(date) {
    return format(date.toDate(), 'dd/MM/yyyy HH:mm', { locale: es });
  }

  async getSalesByPeriod(period, date) {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) throw new Error('Usuario no autenticado');
      if (!user.businessId) throw new Error('Usuario no asociado a un negocio');

      const startDate = new Date(date);
      let endDate = new Date(date);

      switch (period) {
        case 'day':
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'week':
          startDate.setDate(startDate.getDate() - startDate.getDay());
          endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'month':
          startDate.setDate(1);
          endDate.setMonth(endDate.getMonth() + 1);
          endDate.setDate(0);
          endDate.setHours(23, 59, 59, 999);
          break;
        default:
          throw new Error('Período no válido');
      }

      const q = query(
        this.collection,
        where('businessId', '==', user.businessId),
        where('date', '>=', Timestamp.fromDate(startDate)),
        where('date', '<=', Timestamp.fromDate(endDate)),
        where('status', '==', 'completed'),
        orderBy('date', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate()
      }));
    } catch (error) {
      throw new Error('Error al obtener las ventas del período: ' + error.message);
    }
  }

  async update(saleId, updatedSale) {
    try {
      const saleRef = doc(this.collection, saleId);
      const { id, ...saleData } = updatedSale;
      
      await updateDoc(saleRef, {
        ...saleData,
        updatedAt: serverTimestamp()
      });

      return { id: saleId, ...saleData };
    } catch (error) {
      console.error('Error al actualizar la venta:', error);
      throw error;
    }
  }
}

export default new SaleService(); 