import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Hook para gestionar atajos de teclado globales con opciones
 */
export const useHotkeys = (hotkeysMap = {}, options = {}) => {
  const { 
    enabled = true, 
    preventDefault = true,
    ignoreInputs = true 
  } = options;

  const handleKeyDown = useCallback((event) => {
    if (!enabled) return;

    // Ignorar si está escribiendo en un input/textarea
    if (ignoreInputs) {
      const activeElement = document.activeElement;
      if (['INPUT', 'TEXTAREA'].includes(activeElement?.tagName)) {
        return;
      }
    }

    // Construir combinación de teclas
    const modifiers = [];
    if (event.ctrlKey || event.metaKey) modifiers.push('Ctrl');
    if (event.altKey) modifiers.push('Alt');
    if (event.shiftKey) modifiers.push('Shift');

    const key = event.key.length === 1 ? event.key.toUpperCase() : event.key;
    const combination = modifiers.length > 0 
      ? [...modifiers, key].join('+')
      : key;

    // Ejecutar acción si existe
    if (hotkeysMap[combination]) {
      if (preventDefault) event.preventDefault();
      hotkeysMap[combination]();
    }
  }, [hotkeysMap, enabled, preventDefault, ignoreInputs]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};

/**
 * Hotkeys predefinidas optimizadas
 */
export const DEFAULT_HOTKEYS = {
  'Ctrl+N': { label: 'Nueva Venta', action: 'sales.new' },
  'Ctrl+I': { label: 'Inventario', action: 'inventory' },
  'Ctrl+K': { label: 'Buscar', action: 'search' },
  'Ctrl+P': { label: 'Imprimir', action: 'print' },
  'Ctrl+S': { label: 'Guardar', action: 'save' },
  'Ctrl+,': { label: 'Configuración', action: 'settings' },
  'Escape': { label: 'Cerrar Modal', action: 'closeModal' },
  'Ctrl+E': { label: 'Exportar', action: 'export' },
  'Alt+D': { label: 'Dashboard', action: 'dashboard' },
  'Alt+V': { label: 'Ventas', action: 'sales' },
  'Alt+C': { label: 'Clientes', action: 'customers' },
  'Alt+R': { label: 'Reparaciones', action: 'repairs' }
};

/**
 * Componente mejorado de Cheat Sheet
 */
export const HotkeysCheatSheet = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      animation: 'fadeIn 0.2s'
    }} onClick={onClose}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '32px',
        maxWidth: '700px',
        maxHeight: '85vh',
        overflow: 'auto',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        animation: 'slideUp 0.3s'
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '24px' }}>⌨️ Atajos de Teclado</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '0',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px'
        }}>
          {Object.entries(DEFAULT_HOTKEYS).map(([hotkey, config]) => (
            <div key={hotkey} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 14px',
              borderRadius: '6px',
              backgroundColor: '#f8f9fa',
              border: '1px solid #e9ecef',
              transition: 'all 0.2s'
            }} onMouseEnter={(e) => e.target.style.backgroundColor = '#e7f3ff'} onMouseLeave={(e) => e.target.style.backgroundColor = '#f8f9fa'}>
              <span style={{ fontSize: '14px', color: '#333' }}>{config.label}</span>
              <code style={{
                backgroundColor: '#2d3748',
                color: '#48bb78',
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: '600',
                fontFamily: 'monospace',
                whiteSpace: 'nowrap'
              }}>
                {hotkey}
              </code>
            </div>
          ))}
        </div>

        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  );
};
