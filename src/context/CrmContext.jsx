import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, onSnapshot, setDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { getAuth } from 'firebase/auth';

const CrmContext = createContext();

export const useCrm = () => {
  const context = useContext(CrmContext);
  if (!context) {
    throw new Error('useCrm debe ser usado dentro de un CrmProvider');
  }
  return context;
};

export const CrmProvider = ({ children }) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const auth = getAuth();
  const user = auth.currentUser;

  // Escuchar cambios en clientes del usuario actual
  useEffect(() => {
    if (!user) {
      setCustomers([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const q = query(collection(db, 'crm_customers'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCustomers(data);
      setLoading(false);
    }, (err) => {
      setError('Error al cargar los clientes');
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  // CRUD de clientes
  const fetchCustomers = async () => {
    if (!user) return [];
    setLoading(true);
    try {
      const q = query(collection(db, 'crm_customers'), where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCustomers(data);
      setError(null);
      return data;
    } catch (err) {
      setError('Error al cargar los clientes');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createCustomer = async (customerData) => {
    if (!user) throw new Error('Usuario no autenticado');
    const data = { ...customerData, userId: user.uid, createdAt: new Date(), updatedAt: new Date() };
    const docRef = await addDoc(collection(db, 'crm_customers'), data);
    return { id: docRef.id, ...data };
  };

  const updateCustomer = async (id, customerData) => {
    if (!user) throw new Error('Usuario no autenticado');
    const ref = doc(db, 'crm_customers', id);
    await updateDoc(ref, { ...customerData, updatedAt: new Date() });
  };

  const deleteCustomer = async (id) => {
    if (!user) throw new Error('Usuario no autenticado');
    await deleteDoc(doc(db, 'crm_customers', id));
  };

  // Subcolecciones: Seguimientos, Tareas, Notas
  const addFollowUp = async (customerId, followUpData) => {
    if (!user) throw new Error('Usuario no autenticado');
    const ref = collection(db, 'crm_customers', customerId, 'followups');
    await addDoc(ref, { ...followUpData, createdAt: new Date(), userId: user.uid });
  };

  const getFollowUps = async (customerId) => {
    const ref = collection(db, 'crm_customers', customerId, 'followups');
    const snapshot = await getDocs(ref);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };

  const addTask = async (customerId, taskData) => {
    if (!user) throw new Error('Usuario no autenticado');
    const ref = collection(db, 'crm_customers', customerId, 'tasks');
    await addDoc(ref, { ...taskData, createdAt: new Date(), userId: user.uid });
  };

  const getTasks = async (customerId) => {
    const ref = collection(db, 'crm_customers', customerId, 'tasks');
    const snapshot = await getDocs(ref);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };

  const addNote = async (customerId, noteData) => {
    if (!user) throw new Error('Usuario no autenticado');
    const ref = collection(db, 'crm_customers', customerId, 'notes');
    await addDoc(ref, { ...noteData, createdAt: new Date(), userId: user.uid });
  };

  const getNotes = async (customerId) => {
    const ref = collection(db, 'crm_customers', customerId, 'notes');
    const snapshot = await getDocs(ref);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };

  const value = {
    customers,
    loading,
    error,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    addFollowUp,
    getFollowUps,
    addTask,
    getTasks,
    addNote,
    getNotes
  };

  return (
    <CrmContext.Provider value={value}>
      {children}
    </CrmContext.Provider>
  );
}; 