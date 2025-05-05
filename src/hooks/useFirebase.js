import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '../firebase/config';

export const useFirebase = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getCollection = async (collectionName) => {
    try {
      setLoading(true);
      setError(null);
      
      // Verificar que la colección existe
      const collectionRef = collection(db, collectionName);
      const querySnapshot = await getDocs(collectionRef);
      
      if (!querySnapshot) {
        throw new Error(`No se pudo acceder a la colección ${collectionName}`);
      }
      
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return data;
    } catch (err) {
      console.error(`Error al obtener la colección ${collectionName}:`, err);
      setError(err.message);
      throw new Error(`Error al obtener la colección ${collectionName}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const addDocument = async (collectionName, data) => {
    try {
      setLoading(true);
      setError(null);
      const docRef = await addDoc(collection(db, collectionName), data);
      return docRef.id;
    } catch (err) {
      setError(err.message);
      throw new Error(`Error al agregar documento a ${collectionName}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const updateDocument = async (collectionName, docId, data) => {
    try {
      setLoading(true);
      setError(null);
      await updateDoc(doc(db, collectionName, docId), data);
      return true;
    } catch (err) {
      setError(err.message);
      throw new Error(`Error al actualizar documento ${docId} en ${collectionName}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (collectionName, docId) => {
    try {
      setLoading(true);
      setError(null);
      await deleteDoc(doc(db, collectionName, docId));
      return true;
    } catch (err) {
      setError(err.message);
      throw new Error(`Error al eliminar documento ${docId} de ${collectionName}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (path, file) => {
    try {
      setLoading(true);
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const subscribeToCollection = (collectionName, callback, options = {}) => {
    let q = collection(db, collectionName);
    
    if (options.orderBy) {
      q = query(q, orderBy(options.orderBy.field, options.orderBy.direction));
    }
    
    if (options.where) {
      q = query(q, where(options.where.field, options.where.operator, options.where.value));
    }

    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(data);
    });
  };

  return {
    loading,
    error,
    getCollection,
    addDocument,
    updateDocument,
    deleteDocument,
    uploadFile,
    subscribeToCollection
  };
}; 