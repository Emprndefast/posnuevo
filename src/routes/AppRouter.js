import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/Home';
import NewRepair from '../pages/NewRepair';
import RepairList from '../pages/RepairList';
import PrintLabel from '../pages/PrintLabel';
import TestTrial from '../pages/TestTrial';
import { SubscriptionGuard } from '../components/SubscriptionGuard';
import { SubscriptionPlans } from '../components/subscriptions/SubscriptionPlans';

const ProtectedRoute = ({ children }) => (
  <SubscriptionGuard>
    {children}
  </SubscriptionGuard>
);

const AppRouter = () => (
  <Router>
    <Routes>
      {/* Ruta pública para la página de suscripciones */}
      <Route path='/subscription' element={<SubscriptionPlans />} />
      
      {/* Ruta para pruebas de período de prueba */}
      <Route path='/test-trial' element={<TestTrial />} />
      
      {/* Rutas protegidas que requieren suscripción */}
      <Route path='/' element={
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      } />
      <Route path='/new' element={
        <ProtectedRoute>
          <NewRepair />
        </ProtectedRoute>
      } />
      <Route path='/list' element={
        <ProtectedRoute>
          <RepairList />
        </ProtectedRoute>
      } />
      <Route path='/print/:id' element={
        <ProtectedRoute>
          <PrintLabel />
        </ProtectedRoute>
      } />

      {/* Redirigir cualquier otra ruta a la página principal */}
      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
  </Router>
);

export default AppRouter;