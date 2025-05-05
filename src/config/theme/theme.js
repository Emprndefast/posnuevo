import { createTheme } from '@mui/material/styles';
import appConfig from '../settings/appConfig';

const getDesignTokens = (mode) => ({
  palette: {
    mode,
    primary: {
      main: appConfig.branding.primaryColor || '#1976d2',
      light: '#4dabf5',
      dark: '#1769aa',
      contrastText: '#fff',
    },
    secondary: {
      main: appConfig.branding.secondaryColor || '#9c27b0',
      light: '#ff4081',
      dark: '#c51162',
      contrastText: '#fff',
    },
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
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
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

export const createAppTheme = (mode) => {
  return createTheme(getDesignTokens(mode));
}; 