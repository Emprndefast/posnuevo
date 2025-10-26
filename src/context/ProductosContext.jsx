import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api/products';
import api from '../api/api';

const ProductosContext = createContext();

export function ProductosProvider({ children }) {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar productos del backend MongoDB
  const loadProductos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getProducts();
      setProductos(response.data || response || []);
    } catch (err) {
      console.error('Error loading products:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar productos al montar el componente
  useEffect(() => {
    loadProductos();
  }, [loadProductos]);

  // Crear nuevo producto
  const agregarProducto = useCallback(async (productoData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await createProduct(productoData);
      const nuevoProducto = response.data || response;
      
      // Agregar al estado local
      setProductos(prev => [...prev, nuevoProducto]);
      return nuevoProducto;
    } catch (err) {
      console.error('Error creating product:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar producto existente
  const actualizarProducto = useCallback(async (productId, productoData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await updateProduct(productId, productoData);
      
      // Actualizar en el estado local
      setProductos(prev => prev.map(p => 
        p._id === productId || p.id === productId ? { ...p, ...productoData } : p
      ));
      
      return response.data || response;
    } catch (err) {
      console.error('Error updating product:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Eliminar producto
  const eliminarProducto = useCallback(async (productId) => {
    try {
      setLoading(true);
      setError(null);
      await deleteProduct(productId);
      
      // Remover del estado local
      setProductos(prev => prev.filter(p => (p._id || p.id) !== productId));
      
      return true;
    } catch (err) {
      console.error('Error deleting product:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    productos,
    setProductos,
    loading,
    error,
    loadProductos,
    agregarProducto,
    actualizarProducto,
    eliminarProducto
  };

  return (
    <ProductosContext.Provider value={value}>
      {children}
    </ProductosContext.Provider>
  );
}

export function useProductos() {
  const context = useContext(ProductosContext);
  if (!context) {
    throw new Error('useProductos must be used within ProductosProvider');
  }
  return context;
} 