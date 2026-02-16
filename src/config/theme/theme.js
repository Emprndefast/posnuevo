import { createTheme } from '@mui/material/styles';
import appConfig from '../settings/appConfig';

export const themeColors = {
  blue: '#1976d2',
  green: '#2e7d32',
  red: '#d32f2f',
  purple: '#9c27b0',
  orange: '#ed6c02',
};

const getDesignTokens = (mode, primaryColor, secondaryColor) => ({
  palette: {
    mode,
    primary: {
      main: primaryColor || appConfig.branding.primaryColor || '#1976d2',
      contrastText: '#fff',
    },
    secondary: {
      main: secondaryColor || appConfig.branding.secondaryColor || '#9c27b0',
      contrastText: '#fff',
    },
    // ... rest of palette
    success: {
      main: '#2e7d32',
      light: '#4caf50',
      dark: '#1b5e20',
      contrastText: '#fff',
    },
    info: {
      main: '#0288d1',
      light: '#03a9f4',
      dark: '#01579b',
      contrastText: '#fff',
    },
    warning: {
      main: '#ed6c02',
      light: '#ff9800',
      dark: '#e65100',
      contrastText: '#fff',
    },
    error: {
      main: '#d32f2f',
      light: '#ef5350',
      dark: '#c62828',
      contrastText: '#fff',
    },
    background: {
      default: mode === 'dark' ? '#121212' : '#f5f5f5',
      paper: mode === 'dark' ? '#1e1e1e' : '#ffffff',
    },
  },
  typography: {
    fontFamily: appConfig.branding.fontFamily,
    // ... rest
  },
  shape: {
    borderRadius: appConfig.branding.borderRadius,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: appConfig.branding.borderRadius,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: appConfig.branding.borderRadius,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: appConfig.branding.borderRadius,
        },
      },
    },
  },
});

export const createAppTheme = (mode, primaryColor, secondaryColor) => {
  return createTheme(getDesignTokens(mode, primaryColor, secondaryColor));
}; 