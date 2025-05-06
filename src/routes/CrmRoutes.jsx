import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CustomersList from '../components/crm/CustomersList';
import CustomerDetail from '../components/crm/CustomerDetail';

const CrmRoutes = () => (
  <Routes>
    <Route path="/customers" element={<CustomersList />} />
    <Route path="/customers/:id" element={<CustomerDetail />} />
  </Routes>
);

export default CrmRoutes; 