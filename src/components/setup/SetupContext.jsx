import { createContext, useContext, useState } from 'react';

const SetupContext = createContext();

export const SetupProvider = ({ children }) => {
  const [step, setStep] = useState(0);
  const [businessData, setBusinessData] = useState({
    name: '',
    type: '',
    currency: '',
    taxes: [],
    address: '',
    schedule: {},
    employees: 0,
    usesInventory: false,
    sellsProducts: false,
    sellsServices: false,
    usesCashRegister: false
  });
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <SetupContext.Provider value={{
      step, setStep,
      businessData, setBusinessData,
      chatHistory, setChatHistory,
      isLoading, setIsLoading
    }}>
      {children}
    </SetupContext.Provider>
  );
};

export const useSetup = () => useContext(SetupContext); 