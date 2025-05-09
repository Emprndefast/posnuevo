/**
 * Copyright (c) 2024 Jose I. Torres - ID: ***47155*
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { CircularProgress, Box, Container, Paper, Typography, TextField, Button, Alert, Divider } from '@mui/material';
import Layout from './components/layout/Layout';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { PermissionsProvider } from './context/PermissionsContext';
import { CustomThemeProvider } from './context/ThemeContext';
import { PrivateRoute } from './components/auth/PrivateRoute';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './theme';
import { SubscriptionProvider } from './context/SubscriptionContext';
import { ConfigProvider, useConfig } from './context/ConfigContext';
import { BusinessProvider } from './context/BusinessContext';
import { TelegramProvider } from './context/TelegramContext';
import ConfigGuard from './components/guards/ConfigGuard';
import SetupWizard from './components/setup/SetupWizard';
import { PrinterProvider } from './context/PrinterContext';
import { SubscriptionGuard } from './components/SubscriptionGuard';
import { SnackbarProvider } from 'notistack';
import { setup } from 'goober';
import { createElement } from 'react';
import { PrintProvider } from './context/PrintContext';
import { testUtils } from './utils/testUtils';
import { auth } from './firebase/config';
import AIAssistant from './components/common/AIAssistant';
import HuggingFaceTest from './components/HuggingFaceTest';
import PantallaBloqueo from './components/settings/PantallaBloqueo';
import { ProductosProvider } from './context/ProductosContext';
import { VentasProvider } from './context/VentasContext';
import { ClientesProvider } from './context/ClientesContext';
import { CrmProvider } from './context/CrmContext';

// Configurar goober
setup(createElement);

// Páginas principales
import ModernDashboard from './components/dashboard/ModernDashboard';
import Products from './components/products/Products';
import Sales from './components/sales/Sales';
import { Customers } from './components/customers/Customers';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import FinancialAnalytics from './components/analytics/FinancialAnalytics';
import QuickSale from './components/sales/QuickSale';
import Inventario from './components/inventory/Inventario';
import ProductCostManager from './components/inventory/ProductCostManager';
import { InvoiceGenerator } from './components/billing/InvoiceGenerator';
import Reparaciones from './pages/Reparaciones';
import Contabilidad from './pages/contabilidad/index';
import RegistroMovimiento from './pages/contabilidad/registro';
import { Settings } from './components/settings/Settings';
import BranchManager from './components/settings/BranchManager';
import Perfil from './pages/Perfil';
import { SubscriptionPlans } from './components/subscriptions/SubscriptionPlans';
import DataExport from './components/reports/DataExport';

// Páginas de autenticación
import Login from './pages/Login';
import Register from './pages/Register';

// Páginas adicionales
import Manual from './pages/Manual';
import Terminos from './pages/Terminos';
import Privacidad from './pages/Privacidad';

// Estilos
import './styles/globals.css';

import PaymentGateways from './pages/PaymentGateways';
import EInvoicing from './pages/EInvoicing';
import Suppliers from './pages/Suppliers';
import Promotions from './pages/Promotions';
import CrmRoutes from './routes/CrmRoutes';

function TestTrial() {
  const [userId, setUserId] = useState('');
  const [days, setDays] = useState('15');
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleModifyTrial = async () => {
    try {
      const currentUser = auth.currentUser;
      const targetUserId = userId || currentUser?.uid;

      if (!targetUserId) {
        setMessage({ type: 'error', text: 'Por favor, ingresa un ID de usuario o inicia sesión' });
        return;
      }

      await testUtils.modifyTrialDate(targetUserId, parseInt(days));
      setMessage({ type: 'success', text: 'Fecha de prueba modificada exitosamente' });
    } catch (error) {
      setMessage({ type: 'error', text: `Error: ${error.message}` });
    }
  };

  const handleRestoreTrial = async () => {
    try {
      const currentUser = auth.currentUser;
      const targetUserId = userId || currentUser?.uid;

      if (!targetUserId) {
        setMessage({ type: 'error', text: 'Por favor, ingresa un ID de usuario o inicia sesión' });
        return;
      }

      await testUtils.restoreTrialDate(targetUserId);
      setMessage({ type: 'success', text: 'Fecha de prueba restaurada exitosamente' });
    } catch (error) {
      setMessage({ type: 'error', text: `Error: ${error.message}` });
    }
  };

  const handleSimulateExpiration = async () => {
    try {
      const currentUser = auth.currentUser;
      const targetUserId = userId || currentUser?.uid;

      if (!targetUserId) {
        setMessage({ type: 'error', text: 'Por favor, ingresa un ID de usuario o inicia sesión' });
        return;
      }

      await testUtils.modifySubscriptionToExpired(targetUserId);
      await testUtils.disableFreePlan(targetUserId);
      
      // Forzar cierre de sesión
      await auth.signOut();
      
      setMessage({ 
        type: 'success', 
        text: 'Suscripción modificada para simular vencimiento y plan gratuito desactivado. Serás redirigido al login...' 
      });

      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (error) {
      setMessage({ type: 'error', text: `Error: ${error.message}` });
    }
  };

  const handleEnableFreePlan = async () => {
    try {
      const currentUser = auth.currentUser;
      const targetUserId = userId || currentUser?.uid;

      if (!targetUserId) {
        setMessage({ type: 'error', text: 'Por favor, ingresa un ID de usuario o inicia sesión' });
        return;
      }

      await testUtils.enableFreePlan(targetUserId);
      setMessage({ type: 'success', text: 'Plan gratuito habilitado nuevamente' });
    } catch (error) {
      setMessage({ type: 'error', text: `Error: ${error.message}` });
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            Prueba de Período de Prueba
          </Typography>
          
          {message.text && (
            <Alert severity={message.type} sx={{ mb: 2 }}>
              {message.text}
            </Alert>
          )}

          <TextField
            fullWidth
            label="ID de Usuario (opcional)"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            margin="normal"
            helperText="Deja vacío para usar el usuario actual"
          />

          <TextField
            fullWidth
            label="Días a retroceder"
            type="number"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            margin="normal"
            helperText="Número de días para retroceder la fecha de inicio"
          />

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleModifyTrial}
              fullWidth
            >
              Modificar Fecha de Prueba
            </Button>

            <Button
              variant="outlined"
              color="secondary"
              onClick={handleRestoreTrial}
              fullWidth
            >
              Restaurar Fecha
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            Simular Vencimiento de Suscripción
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Esta opción modificará los datos de la suscripción para simular que ha vencido el período de prueba y desactivará la posibilidad de activar el plan gratuito
          </Typography>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="error"
              onClick={handleSimulateExpiration}
              fullWidth
            >
              Simular Vencimiento
            </Button>

            <Button
              variant="outlined"
              color="success"
              onClick={handleEnableFreePlan}
              fullWidth
            >
              Habilitar Plan Gratuito
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

const AppContent = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { settings } = useConfig ? useConfig() : { settings: {} };
  const hideAssistantRoutes = ['/login', '/register'];

  // --- BLOQUEO POR INACTIVIDAD ---
  const [bloqueado, setBloqueado] = React.useState(false);
  const [configProtector, setConfigProtector] = React.useState({ enabled: false, pin: '', timeout: 5 });
  const inactividadTimer = React.useRef(null);

  // Leer config desde settings o localStorage
  React.useEffect(() => {
    let config = { enabled: false, pin: '', timeout: 5 };
    if (settings && settings.protectorPantalla) {
      config = settings.protectorPantalla;
    } else if (localStorage.getItem('protectorPantalla')) {
      try {
        config = JSON.parse(localStorage.getItem('protectorPantalla'));
      } catch {}
    }
    setConfigProtector(config);
  }, [settings]);

  // Lógica de inactividad
  React.useEffect(() => {
    if (!user || !configProtector.enabled || !configProtector.pin) return;

    const resetTimer = () => {
      if (inactividadTimer.current) {
        clearTimeout(inactividadTimer.current);
      }
      
      // Convertir minutos a milisegundos
      const timeoutMs = (configProtector.timeout || 5) * 60 * 1000;
      
      inactividadTimer.current = setTimeout(() => {
        console.log('Activando bloqueo por inactividad');
        setBloqueado(true);
      }, timeoutMs);
    };

    // Lista de eventos que resetean el timer
    const eventos = [
      'mousemove',
      'mousedown',
      'keydown',
      'touchstart',
      'scroll',
      'click',
      'keypress'
    ];

    // Agregar listeners
    eventos.forEach(ev => {
      window.addEventListener(ev, resetTimer);
      console.log(`Agregado listener para: ${ev}`);
    });

    // Iniciar timer
    resetTimer();

    // Cleanup
    return () => {
      eventos.forEach(ev => window.removeEventListener(ev, resetTimer));
      if (inactividadTimer.current) {
        clearTimeout(inactividadTimer.current);
      }
    };
  }, [user, configProtector.enabled, configProtector.pin, configProtector.timeout]);

  // Al desbloquear, reiniciar timer
  const handleUnlock = () => {
    console.log('Desbloqueando pantalla');
    setBloqueado(false);
    if (inactividadTimer.current) {
      clearTimeout(inactividadTimer.current);
    }
  };
  // Al fallar 3 veces, cerrar sesión
  const handleLogout = () => {
    setBloqueado(false);
    logout && logout();
  };

  return (
    <>
      {bloqueado && user && configProtector.enabled && configProtector.pin && (
        <PantallaBloqueo
          pinGuardado={configProtector.pin}
          onUnlock={handleUnlock}
          onLogout={handleLogout}
        />
      )}
      <Routes>
        {/* Rutas públicas SIN layout */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/manual" element={<Manual />} />
        <Route path="/terminos" element={<Terminos />} />
        <Route path="/privacidad" element={<Privacidad />} />
        {/* Rutas privadas CON layout */}
        <Route
          path="*"
          element={
            <PrivateRoute>
              <Layout>
                <Routes>
                  {/* Ruta de suscripción - accesible después del login */}
                  <Route path="/subscription" element={<SubscriptionPlans />} />
                  <Route path="/subscriptions" element={<SubscriptionPlans />} />
                  <Route path="/setup-wizard" element={<PrivateRoute><ConfigGuard><SetupWizard /></ConfigGuard></PrivateRoute>} />
                  <Route path="/" element={<ModernDashboard />} />
                  <Route path="/analytics" element={<AnalyticsDashboard />} />
                  <Route path="/financial" element={<FinancialAnalytics />} />
                  <Route path="/sales" element={<Sales />} />
                  <Route path="/quick-sale" element={<QuickSale />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/inventory" element={<Inventario />} />
                  <Route path="/inventory/costs" element={<ProductCostManager />} />
                  <Route path="/customers" element={<Customers />} />
                  <Route path="/billing" element={<InvoiceGenerator />} />
                  <Route path="/reparaciones" element={<Reparaciones />} />
                  <Route path="/contabilidad" element={<Contabilidad />} />
                  <Route path="/contabilidad/registro" element={<RegistroMovimiento />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/settings/branches" element={<BranchManager />} />
                  <Route path="/perfil" element={<Perfil />} />
                  <Route path="/reports/export" element={<DataExport />} />
                  {/* Rutas de comercio */}
                  <Route path="/payment-gateways" element={<PaymentGateways />} />
                  <Route path="/e-invoicing" element={<EInvoicing />} />
                  <Route path="/suppliers" element={<Suppliers />} />
                  <Route path="/promotions" element={<Promotions />} />
                  <Route path="/test-trial" element={<TestTrial />} />
                  <Route path="/test-huggingface" element={<HuggingFaceTest />} />
                  {/* Rutas CRM */}
                  <Route path="/crm/*" element={<CrmRoutes />} />
                  {/* Redirigir cualquier otra ruta a la página principal */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            </PrivateRoute>
          }
        />
      </Routes>
      {/* Asistente IA: solo si el usuario está autenticado y no está en login ni registro */}
      {!hideAssistantRoutes.includes(location.pathname) && user && <AIAssistant />}
    </>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <LanguageProvider>
          <PermissionsProvider>
            <CustomThemeProvider>
              <ThemeProvider theme={theme}>
                <SubscriptionProvider>
                  <BusinessProvider>
                    <ConfigProvider>
                      <TelegramProvider>
                        <PrinterProvider>
                          <PrintProvider>
                            <CrmProvider>
                              <SnackbarProvider maxSnack={3}>
                                <CssBaseline />
                                <AppContent />
                              </SnackbarProvider>
                            </CrmProvider>
                          </PrintProvider>
                        </PrinterProvider>
                      </TelegramProvider>
                    </ConfigProvider>
                  </BusinessProvider>
                </SubscriptionProvider>
              </ThemeProvider>
            </CustomThemeProvider>
          </PermissionsProvider>
        </LanguageProvider>
      </AuthProvider>
    </Router>
  );
}

export default App; 