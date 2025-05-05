import React, { createContext, useContext, useState } from 'react';

const ClientesContext = createContext();

export function ClientesProvider({ children }) {
  const [clientes, setClientes] = useState([]);
  return (
    <ClientesContext.Provider value={{ clientes, setClientes }}>
      {children}
    </ClientesContext.Provider>
  );
}

export function useClientes() {
  return useContext(ClientesContext);
} 