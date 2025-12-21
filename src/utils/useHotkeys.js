/**
 * Hook para manejar hotkeys en la tienda
 * Hotkeys disponibles:
 * - Ctrl+N: Nueva venta
 * - Ctrl+K: Buscar cliente
 * - Ctrl+M: Ir a reparaciones
 * - Ctrl+S: Guardar/Checkout
 * - Escape: Cancelar/Cerrar
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useHotkeys = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+N: Nueva venta
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        navigate('/ventas');
      }

      // Ctrl+K: Buscar cliente
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        navigate('/clientes');
      }

      // Ctrl+M: Reparaciones
      if (e.ctrlKey && e.key === 'm') {
        e.preventDefault();
        navigate('/repairs');
      }

      // Ctrl+P: Dashboard
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        navigate('/dashboard');
      }

      // Ctrl+L: Logout
      if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        localStorage.removeItem('token');
        navigate('/login');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return {
    shortcuts: [
      { key: 'Ctrl+N', action: 'Nueva venta' },
      { key: 'Ctrl+K', action: 'Buscar cliente' },
      { key: 'Ctrl+M', action: 'Reparaciones' },
      { key: 'Ctrl+P', action: 'Dashboard' },
      { key: 'Ctrl+L', action: 'Logout' },
    ]
  };
};

export default useHotkeys;
