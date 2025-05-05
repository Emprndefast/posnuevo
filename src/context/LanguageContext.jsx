import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageContext = createContext();

export const languages = {
  es: {
    name: 'Español',
    code: 'es',
    flag: '🇪🇸'
  },
  en: {
    name: 'English',
    code: 'en',
    flag: '🇺🇸'
  },
  pt: {
    name: 'Português',
    code: 'pt',
    flag: '🇧🇷'
  },
  fr: {
    name: 'Français',
    code: 'fr',
    flag: '🇫🇷'
  }
};

export const LanguageProvider = ({ children }) => {
  const { i18n } = useTranslation();
  
  // Lista de idiomas soportados
  const languages = [
    { code: 'es', name: 'Español' },
    { code: 'en', name: 'English' }
  ];

  // Función para detectar el idioma del sistema
  const detectSystemLanguage = () => {
    // Obtener el idioma del navegador
    const browserLang = navigator.language.split('-')[0];
    
    // Verificar si el idioma está soportado
    const isSupported = languages.some(lang => lang.code === browserLang);
    
    // Retornar el idioma detectado si está soportado, o español por defecto
    return isSupported ? browserLang : 'es';
  };

  // Estado para el idioma actual
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    // Intentar obtener el idioma guardado en localStorage
    const savedLanguage = localStorage.getItem('appLanguage');
    
    // Si no hay idioma guardado, detectar el del sistema
    return savedLanguage || detectSystemLanguage();
  });

  // Efecto para inicializar el idioma
  useEffect(() => {
    const initializeLanguage = async () => {
      try {
        // Cambiar el idioma en i18n
        await i18n.changeLanguage(currentLanguage);
        // Guardar el idioma en localStorage
        localStorage.setItem('appLanguage', currentLanguage);
        
        // Configurar el atributo lang del HTML
        document.documentElement.lang = currentLanguage;
        
        // Configurar la dirección del texto (para idiomas RTL si se agregan en el futuro)
        document.documentElement.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';
      } catch (error) {
        console.error('Error al inicializar el idioma:', error);
      }
    };

    initializeLanguage();
  }, [currentLanguage, i18n]);

  // Función para cambiar el idioma
  const changeLanguage = async (langCode) => {
    try {
      await i18n.changeLanguage(langCode);
      setCurrentLanguage(langCode);
      localStorage.setItem('appLanguage', langCode);
    } catch (error) {
      console.error('Error al cambiar el idioma:', error);
    }
  };

  return (
    <LanguageContext.Provider value={{ 
      currentLanguage, 
      changeLanguage, 
      languages,
      detectSystemLanguage 
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage debe ser usado dentro de un LanguageProvider');
  }
  return context;
}; 