import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { enqueueSnackbar } from 'notistack';

const CartContext = createContext();
const CART_STORAGE_KEY = 'posent_cart';

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Cargar carrito del localStorage en mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setCart(parsedCart);
        console.log('🛒 Carrito cargado del localStorage:', parsedCart.length, 'items');
      }
    } catch (err) {
      console.error('Error al cargar carrito del localStorage:', err);
    }
    setIsHydrated(true);
  }, []);

  // Guardar carrito en localStorage cuando cambia
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
        console.log('💾 Carrito guardado en localStorage:', cart.length, 'items');
      } catch (err) {
        console.error('Error al guardar carrito en localStorage:', err);
      }
    }
  }, [cart, isHydrated]);

  const addProductToCart = useCallback((product) => {
    try {
      const existingItem = cart.find(item => item.id === product.id && !item.meta?.repair);
      
      if (existingItem) {
        setCart(cart.map(item =>
          item.id === product.id && !item.meta?.repair
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
        enqueueSnackbar(`${product.name} - cantidad actualizada`, { variant: 'info' });
      } else {
        setCart([...cart, {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          code: product.code,
          meta: { type: 'product' }
        }]);
        enqueueSnackbar(`${product.name} agregado al carrito`, { variant: 'success' });
      }
    } catch (err) {
      console.error('Error al agregar producto:', err);
      enqueueSnackbar('Error al agregar producto', { variant: 'error' });
    }
  }, [cart]);

  const addRepairToCart = useCallback((repair) => {
    try {
      const price = repair.cost || (repair.partes_reparar?.reduce((s, p) => s + (p.precio || p.price || 0) * (p.cantidad || 1), 0)) || 0;
      
      if (price <= 0) {
        enqueueSnackbar('La reparación debe tener un precio definido', { variant: 'warning' });
        return;
      }

      const repairId = `repair-${Date.now()}`;
      const partsLabel = repair.partes_reparar?.map(p => p.nombre).join(', ') || 'Reparación';
      const deviceLabel = repair.device || repair.modelo || 'Dispositivo';

      setCart([...cart, {
        id: repairId,
        name: `🔧 ${deviceLabel} - ${partsLabel}`,
        price,
        quantity: 1,
        code: 'REPAIR',
        meta: {
          type: 'repair',
          repair: true,
          repairData: repair,
          brand: repair.brand || repair.marca,
          device: deviceLabel,
          parts: repair.partes_reparar || []
        }
      }]);

      enqueueSnackbar('✅ Reparación agregada al carrito', { variant: 'success' });
    } catch (err) {
      console.error('Error al agregar reparación:', err);
      enqueueSnackbar('Error al agregar reparación al carrito', { variant: 'error' });
    }
  }, [cart]);

  const removeFromCart = useCallback((itemId) => {
    setCart(cart.filter(item => item.id !== itemId));
    enqueueSnackbar('Artículo eliminado del carrito', { variant: 'info' });
  }, [cart]);

  const updateQuantity = useCallback((itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(cart.map(item =>
      item.id === itemId ? { ...item, quantity } : item
    ));
  }, [cart, removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  }, []);

  const updateDiscount = useCallback((itemId, discount) => {
    setCart(cart.map(item =>
      item.id === itemId ? { ...item, discount: Math.max(0, discount) } : item
    ));
  }, [cart]);

  const value = {
    cart,
    setCart,
    addProductToCart,
    addRepairToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    updateDiscount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de CartProvider');
  }
  return context;
};
