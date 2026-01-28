import { useState } from 'react';
import mongoService from '../services/mongoService';

/**
 * Hook personalizado para interactuar con MongoDB
 * Reemplaza useFirebase con llamadas reales al backend MongoDB
 */
export const useMongo = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Obtener colección completa
     */
    const getCollection = async (collectionName, userId = null) => {
        setLoading(true);
        setError(null);
        try {
            const data = await mongoService.getCollection(collectionName, userId);
            return data;
        } catch (err) {
            const errorMessage = err.message || 'Error al obtener datos';
            setError(errorMessage);
            console.error(`Error en getCollection(${collectionName}):`, err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Agregar documento a colección
     */
    const addDocument = async (collectionName, data) => {
        setLoading(true);
        setError(null);
        try {
            const id = await mongoService.addDocument(collectionName, data);
            return id;
        } catch (err) {
            const errorMessage = err.message || 'Error al crear documento';
            setError(errorMessage);
            console.error(`Error en addDocument(${collectionName}):`, err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Actualizar documento existente
     */
    const updateDocument = async (collectionName, docId, data) => {
        setLoading(true);
        setError(null);
        try {
            const success = await mongoService.updateDocument(collectionName, docId, data);
            return success;
        } catch (err) {
            const errorMessage = err.message || 'Error al actualizar documento';
            setError(errorMessage);
            console.error(`Error en updateDocument(${collectionName}, ${docId}):`, err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Eliminar documento
     */
    const deleteDocument = async (collectionName, docId) => {
        setLoading(true);
        setError(null);
        try {
            const success = await mongoService.deleteDocument(collectionName, docId);
            return success;
        } catch (err) {
            const errorMessage = err.message || 'Error al eliminar documento';
            setError(errorMessage);
            console.error(`Error en deleteDocument(${collectionName}, ${docId}):`, err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Obtener documento por ID
     */
    const getDocument = async (collectionName, docId) => {
        setLoading(true);
        setError(null);
        try {
            const data = await mongoService.getDocument(collectionName, docId);
            return data;
        } catch (err) {
            const errorMessage = err.message || 'Error al obtener documento';
            setError(errorMessage);
            console.error(`Error en getDocument(${collectionName}, ${docId}):`, err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Subir archivo
     */
    const uploadFile = async (file, path = '') => {
        setLoading(true);
        setError(null);
        try {
            const url = await mongoService.uploadFile(file, path);
            return url;
        } catch (err) {
            const errorMessage = err.message || 'Error al subir archivo';
            setError(errorMessage);
            console.error('Error en uploadFile:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Suscribirse a cambios (mock por ahora)
     */
    const subscribeToCollection = (collectionName, callback, options = {}) => {
        console.warn(`subscribeToCollection(${collectionName}) - Polling not implemented yet`);
        return () => { }; // Return unsubscribe function
    };

    return {
        loading,
        error,
        getCollection,
        addDocument,
        updateDocument,
        deleteDocument,
        getDocument,
        uploadFile,
        subscribeToCollection
    };
};

export default useMongo;
