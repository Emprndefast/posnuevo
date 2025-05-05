import React, { createContext, useContext, useState } from 'react';

const VentasContext = createContext();

export function VentasProvider({ children }) {
  const [ventas, setVentas] = useState([]);
  return (
    <VentasContext.Provider value={{ ventas, setVentas }}>
      {children}
    </VentasContext.Provider>
  );
}

export function useVentas() {
  return useContext(VentasContext);
} 