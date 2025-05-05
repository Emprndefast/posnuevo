import { getFirestore, collection, addDoc, updateDoc, doc, getDocs, query, where, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

class SupplierService {
  constructor() {
    this.db = getFirestore();
    this.auth = getAuth();
  }

  // Agregar proveedor
  async addSupplier(supplierData) {
    try {
      const user = this.auth.currentUser;
      if (!user) throw new Error('Usuario no autenticado');

      const supplierRef = collection(this.db, 'suppliers');
      const docRef = await addDoc(supplierRef, {
        ...supplierData,
        userId: user.uid,
        createdAt: new Date(),
        isActive: true
      });

      return docRef.id;
    } catch (error) {
      console.error('Error al agregar proveedor:', error);
      throw error;
    }
  }

  // Actualizar proveedor
  async updateSupplier(supplierId, supplierData) {
    try {
      const supplierRef = doc(this.db, 'suppliers', supplierId);
      await updateDoc(supplierRef, {
        ...supplierData,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error al actualizar proveedor:', error);
      throw error;
    }
  }

  // Eliminar proveedor
  async deleteSupplier(supplierId) {
    try {
      const supplierRef = doc(this.db, 'suppliers', supplierId);
      await deleteDoc(supplierRef);
    } catch (error) {
      console.error('Error al eliminar proveedor:', error);
      throw error;
    }
  }

  // Obtener proveedores
  async getSuppliers(filters = {}) {
    try {
      const user = this.auth.currentUser;
      if (!user) throw new Error('Usuario no autenticado');

      const suppliersRef = collection(this.db, 'suppliers');
      let q = query(suppliersRef, where('userId', '==', user.uid));

      if (filters.isActive !== undefined) {
        q = query(q, where('isActive', '==', filters.isActive));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error al obtener proveedores:', error);
      throw error;
    }
  }

  // Obtener productos de un proveedor
  async getSupplierProducts(supplierId) {
    try {
      const productsRef = collection(this.db, 'products');
      const q = query(productsRef, where('supplierId', '==', supplierId));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error al obtener productos del proveedor:', error);
      throw error;
    }
  }
}

export default new SupplierService(); 