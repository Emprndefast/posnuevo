import { db } from '../firebase/config';
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  Timestamp 
} from 'firebase/firestore';

const migrateDatabase = async () => {
  try {
    console.log('Iniciando migración de la base de datos...');

    // 1. Migrar usuarios
    console.log('Migrando usuarios...');
    const usersSnapshot = await getDocs(collection(db, 'usuarios'));
    for (const doc of usersSnapshot.docs) {
      const userData = doc.data();
      await setDoc(doc(db, 'users', doc.id), {
        ...userData,
        role: userData.role || 'employee',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
    }

    // 2. Migrar productos e inventario
    console.log('Migrando productos e inventario...');
    const productsSnapshot = await getDocs(collection(db, 'products'));
    for (const doc of productsSnapshot.docs) {
      const productData = doc.data();
      const productId = doc.id;
      
      // Crear producto
      await setDoc(doc(db, 'products', productId), {
        ...productData,
        businessId: productData.businessId || 'default',
        updatedAt: Timestamp.now()
      });

      // Crear registro de inventario
      await setDoc(doc(db, 'inventory', productId), {
        productId,
        currentStock: productData.stock || 0,
        minStock: productData.minStock || 0,
        lastUpdate: Timestamp.now(),
        movements: []
      });
    }

    // 3. Migrar reparaciones
    console.log('Migrando reparaciones...');
    const repairsSnapshot = await getDocs(collection(db, 'reparaciones'));
    for (const doc of repairsSnapshot.docs) {
      const repairData = doc.data();
      await setDoc(doc(db, 'repairs', doc.id), {
        ...repairData,
        status: repairData.status || 'pending',
        createdAt: repairData.createdAt || Timestamp.now(),
        updatedAt: Timestamp.now()
      });
    }

    // 4. Migrar servicios
    console.log('Migrando servicios...');
    const servicesSnapshot = await getDocs(collection(db, 'servicios'));
    for (const doc of servicesSnapshot.docs) {
      const serviceData = doc.data();
      await setDoc(doc(db, 'services', doc.id), {
        ...serviceData,
        active: serviceData.active !== false,
        updatedAt: Timestamp.now()
      });
    }

    // 5. Migrar contabilidad
    console.log('Migrando contabilidad...');
    const accountingSnapshot = await getDocs(collection(db, 'contabilidad'));
    for (const doc of accountingSnapshot.docs) {
      const accountingData = doc.data();
      await setDoc(doc(db, 'accounting', doc.id), {
        ...accountingData,
        type: accountingData.type || 'transaction',
        createdAt: accountingData.createdAt || Timestamp.now(),
        updatedAt: Timestamp.now()
      });
    }

    // 6. Migrar clientes
    console.log('Migrando clientes...');
    const clientsSnapshot = await getDocs(collection(db, 'clients'));
    for (const doc of clientsSnapshot.docs) {
      const clientData = doc.data();
      await setDoc(doc(db, 'clients', doc.id), {
        ...clientData,
        active: clientData.active !== false,
        createdAt: clientData.createdAt || Timestamp.now(),
        updatedAt: Timestamp.now()
      });
    }

    // 7. Migrar negocios
    console.log('Migrando negocios...');
    const businessesSnapshot = await getDocs(collection(db, 'negocios'));
    for (const doc of businessesSnapshot.docs) {
      const businessData = doc.data();
      await setDoc(doc(db, 'businesses', doc.id), {
        ...businessData,
        active: businessData.active !== false,
        updatedAt: Timestamp.now()
      });
    }

    console.log('Migración completada exitosamente');
    return true;
  } catch (error) {
    console.error('Error durante la migración:', error);
    throw error;
  }
};

export default migrateDatabase; 