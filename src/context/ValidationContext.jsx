import React, { createContext, useContext } from 'react';

const ValidationContext = createContext();

export const useValidation = () => {
  const context = useContext(ValidationContext);
  if (!context) {
    throw new Error('useValidation debe ser usado dentro de un ValidationProvider');
  }
  return context;
};

export const ValidationProvider = ({ children }) => {
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateName = (name) => {
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/;
    return nameRegex.test(name);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^\+?[\d\s-]{8,15}$/;
    return phoneRegex.test(phone);
  };

  const validateBusinessData = (data) => {
    const errors = [];
    
    if (!data.name || !validateName(data.name)) {
      errors.push('El nombre comercial es inválido');
    }
    
    if (!data.address) {
      errors.push('La dirección es requerida');
    }
    
    if (!data.phone || !validatePhone(data.phone)) {
      errors.push('El teléfono es inválido');
    }
    
    if (!data.email || !validateEmail(data.email)) {
      errors.push('El correo electrónico es inválido');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const validateUserData = (data) => {
    const errors = [];
    
    if (!data.name || !validateName(data.name)) {
      errors.push('El nombre es inválido');
    }
    
    if (!data.email || !validateEmail(data.email)) {
      errors.push('El correo electrónico es inválido');
    }
    
    if (data.phone && !validatePhone(data.phone)) {
      errors.push('El teléfono es inválido');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const validatePrinterData = (data) => {
    const errors = [];
    
    if (!data.printerType) {
      errors.push('El tipo de impresora es requerido');
    }
    
    if (!data.model) {
      errors.push('El modelo de impresora es requerido');
    }
    
    if (!data.connection) {
      errors.push('El tipo de conexión es requerido');
    }
    
    if (data.connection === 'network' && (!data.ipAddress || !data.port)) {
      errors.push('La dirección IP y el puerto son requeridos para conexión de red');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const value = {
    validateEmail,
    validateName,
    validatePhone,
    validateBusinessData,
    validateUserData,
    validatePrinterData
  };

  return (
    <ValidationContext.Provider value={value}>
      {children}
    </ValidationContext.Provider>
  );
}; 