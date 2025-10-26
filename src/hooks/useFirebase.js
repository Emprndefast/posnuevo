// Firebase hook - DISABLED - Using MongoDB backend now
import { useState } from 'react';

export const useFirebase = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  console.warn('useFirebase is deprecated - Use MongoDB API services instead');

  // Mock functions to prevent errors
  const getCollection = async (collectionName) => {
    console.warn('getCollection not implemented - Use MongoDB API services');
    return [];
  };

  const addDocument = async (collectionName, data) => {
    console.warn('addDocument not implemented - Use MongoDB API services');
    return null;
  };

  const updateDocument = async (collectionName, docId, data) => {
    console.warn('updateDocument not implemented - Use MongoDB API services');
    return false;
  };

  const deleteDocument = async (collectionName, docId) => {
    console.warn('deleteDocument not implemented - Use MongoDB API services');
    return false;
  };

  const uploadFile = async (path, file) => {
    console.warn('uploadFile not implemented - Use MongoDB upload API');
    return null;
  };

  const subscribeToCollection = (collectionName, callback, options = {}) => {
    console.warn('subscribeToCollection not implemented - Use MongoDB API services');
    return () => {}; // Return unsubscribe function
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
