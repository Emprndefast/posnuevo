import React from 'react';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';

export default function BusinessForm({ form, handleChange }) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Nombre del negocio</Label>
        <Input
          name="businessName"
          placeholder="Ej: Reparaciones NT"
          value={form.businessName}
          onChange={handleChange}
        />
      </div>
      <div>
        <Label>RUC/NIT</Label>
        <Input name="taxId" placeholder="RUC/NIT" value={form.taxId} onChange={handleChange} />
      </div>
      <div>
        <Label>Dirección fiscal</Label>
        <Input
          name="billingAddress"
          placeholder="Dirección fiscal"
          value={form.billingAddress}
          onChange={handleChange}
        />
      </div>
      <div>
        <Label>Sector</Label>
        <Input
          name="sector"
          placeholder="Ej: Electrónicaa, Servicios, etc."
          value={form.sector || ''}
          onChange={handleChange}
        />
      </div>
    </div>
  );
}
