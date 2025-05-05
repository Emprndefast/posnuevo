import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { SubscriptionPlans } from '../components/subscriptions/SubscriptionPlans';
import { BackupManager } from '../components/backup/BackupManager';
import QuickSale from '../components/sales/QuickSale';
import { Sales } from '../components/sales/Sales';
import DataExport from '../components/reports/DataExport';
import { ProtectedRoute } from '../components/auth/PrivateRoute';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/suscripciones" element={<SubscriptionPlans />} />
      <Route 
        path="/respaldos" 
        element={
          <ProtectedRoute>
            <BackupManager />
          </ProtectedRoute>
        } 
      />
      <Route
        path="/sales"
        element={
          <ProtectedRoute>
            <Sales />
          </ProtectedRoute>
        }
      />
      <Route
        path="/quick-sale"
        element={
          <ProtectedRoute>
            <QuickSale />
          </ProtectedRoute>
        }
      />
      <Route
        path="/data-export"
        element={
          <ProtectedRoute>
            <DataExport />
          </ProtectedRoute>
        }
      />
      {/* Otras rutas aquí */}
    </Routes>
  );
}; 