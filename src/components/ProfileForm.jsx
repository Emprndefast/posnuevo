import React from 'react';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';

export default function ProfileForm({ form, handleChange }) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Nombre completo</Label>
        <Input
          name="displayName"
          placeholder="Nombre completo"
          value={form.displayName}
          onChange={handleChange}
        />
      </div>
      <div>
        <Label>Email</Label>
        <Input name="email" value={form.email} disabled className="bg-muted" />
      </div>
      <div>
        <Label>Teléfono</Label>
        <Input name="phone" placeholder="Teléfono" value={form.phone} onChange={handleChange} />
      </div>
      <div>
        <Label>Dirección</Label>
        <Input
          name="address"
          placeholder="Dirección"
          value={form.address}
          onChange={handleChange}
        />
      </div>
    </div>
  );
}
