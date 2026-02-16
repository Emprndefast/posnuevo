import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { createAppTheme, themeColors } from '../config/theme/theme';

const ThemeContext = createContext();

export const useTheme = () => {
  return useContext(ThemeContext);
};

export const CustomThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  const [primaryColorName, setPrimaryColorName] = useState(() => {
    return localStorage.getItem('primaryColor') || 'blue';
  });

  const [secondaryColorName, setSecondaryColorName] = useState(() => {
    return localStorage.getItem('secondaryColor') || 'purple';
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('primaryColor', primaryColorName);
  }, [primaryColorName]);

  useEffect(() => {
    localStorage.setItem('secondaryColor', secondaryColorName);
  }, [secondaryColorName]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const changePrimaryColor = (colorName) => {
    if (themeColors[colorName]) {
      setPrimaryColorName(colorName);
    }
  };

  const changeSecondaryColor = (colorName) => {
    if (themeColors[colorName]) {
      setSecondaryColorName(colorName);
    }
  };

  // Obtener los valores hexadecimales
  const primaryColorHex = themeColors[primaryColorName] || themeColors.blue;
  const secondaryColorHex = themeColors[secondaryColorName] || themeColors.purple;

  const theme = createAppTheme(darkMode ? 'dark' : 'light', primaryColorHex, secondaryColorHex);

  const value = {
    darkMode,
    toggleDarkMode,
    primaryColor: primaryColorName,
    secondaryColor: secondaryColorName,
    changePrimaryColor,
    changeSecondaryColor,
    themeColors // Exponer colores disponibles
  };

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}; 