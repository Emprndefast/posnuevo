import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import messages from '../config/messages/messages';

const useCrud = (service, options = {}) => {
  const {
    successMessage = messages.general.success,
    errorMessage = messages.general.error,
    redirectPath = null
  } = options;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const navigate = useNavigate();

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const response = await service.getAll();
      setData(response);
      setError(null);
    } catch (err) {
      setError(err.message || errorMessage);
    } finally {
      setLoading(false);
    }
  }, [service, errorMessage]);

  const fetchOne = useCallback(async (id) => {
    setLoading(true);
    try {
      const response = await service.getById(id);
      setSelectedItem(response);
      setError(null);
    } catch (err) {
      setError(err.message || errorMessage);
    } finally {
      setLoading(false);
    }
  }, [service, errorMessage]);

  const create = useCallback(async (item) => {
    setLoading(true);
    try {
      const response = await service.create(item);
      setData(prev => [...prev, response]);
      setError(null);
      if (redirectPath) {
        navigate(redirectPath);
      }
      return { success: true, message: successMessage };
    } catch (err) {
      setError(err.message || errorMessage);
      return { success: false, message: err.message || errorMessage };
    } finally {
      setLoading(false);
    }
  }, [service, successMessage, errorMessage, navigate, redirectPath]);

  const update = useCallback(async (id, item) => {
    setLoading(true);
    try {
      const response = await service.update(id, item);
      setData(prev => prev.map(i => i.id === id ? response : i));
      setSelectedItem(response);
      setError(null);
      if (redirectPath) {
        navigate(redirectPath);
      }
      return { success: true, message: successMessage };
    } catch (err) {
      setError(err.message || errorMessage);
      return { success: false, message: err.message || errorMessage };
    } finally {
      setLoading(false);
    }
  }, [service, successMessage, errorMessage, navigate, redirectPath]);

  const remove = useCallback(async (id) => {
    setLoading(true);
    try {
      await service.delete(id);
      setData(prev => prev.filter(i => i.id !== id));
      setError(null);
      return { success: true, message: successMessage };
    } catch (err) {
      setError(err.message || errorMessage);
      return { success: false, message: err.message || errorMessage };
    } finally {
      setLoading(false);
    }
  }, [service, successMessage, errorMessage]);

  const search = useCallback(async (query) => {
    setLoading(true);
    try {
      const response = await service.search(query);
      setData(response);
      setError(null);
    } catch (err) {
      setError(err.message || errorMessage);
    } finally {
      setLoading(false);
    }
  }, [service, errorMessage]);

  return {
    data,
    loading,
    error,
    selectedItem,
    fetchAll,
    fetchOne,
    create,
    update,
    remove,
    search,
    setData,
    setSelectedItem
  };
};

export default useCrud; 