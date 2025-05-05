import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Inventory from '../pages/Inventory';
import Sales from '../pages/Sales';
import Clients from '../pages/Clients';
import Configuration from '../pages/Configuracion';
import Reports from '../pages/Reportes';
import Repairs from '../pages/Reparaciones';
import Profile from '../pages/Perfil';
import Manual from '../pages/Manual';
import Terms from '../pages/Terminos';
import Privacy from '../pages/Privacidad';
import PaymentGateways from '../pages/PaymentGateways';
import EInvoicing from '../pages/EInvoicing';
import Suppliers from '../pages/Suppliers';
import Promotions from '../pages/Promotions';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/inventory" element={<Inventory />} />
      <Route path="/sales" element={<Sales />} />
      <Route path="/clients" element={<Clients />} />
      <Route path="/configuration" element={<Configuration />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/repairs" element={<Repairs />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/manual" element={<Manual />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      
      {/* Nuevas rutas de comercio */}
      <Route path="/payment-gateways" element={<PaymentGateways />} />
      <Route path="/e-invoicing" element={<EInvoicing />} />
      <Route path="/suppliers" element={<Suppliers />} />
      <Route path="/promotions" element={<Promotions />} />
    </Routes>
  );
};

export default AppRoutes; 