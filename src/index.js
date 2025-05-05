// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import './i18n';
import { ThemeProvider } from './pages/ThemeContext';
import * as serviceWorkerRegistration from './serviceWorkerRegistration'; // para PWA
import { initializeTrialChecks } from './server/cron';

// Inicializar verificaciones de prueba
initializeTrialChecks();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ThemeProvider>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </ThemeProvider>
);

// Esto hace tu app PWA
serviceWorkerRegistration.register();
