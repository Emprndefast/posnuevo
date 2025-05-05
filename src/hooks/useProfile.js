import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { toast } from '../components/ui/use-toast';
import { db } from '../firebase';

export function useProfile(user, defaultProfile) {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const ref = doc(db, 'users', user.uid, 'profile', 'main');
    getDoc(ref)
      .then((snap) => {
        if (snap.exists()) {
          setProfile(snap.data());
          setForm(snap.data());
        } else {
          const def = defaultProfile(user);
          setDoc(ref, def).then(() => {
            setProfile(def);
            setForm(def);
          });
        }
      })
      .catch(() => {
        toast({ title: 'Error al cargar el perfil.', variant: 'destructive' });
      })
      .finally(() => setLoading(false));
  }, [user, defaultProfile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const ref = doc(db, 'users', user.uid, 'profile', 'main');
      await updateDoc(ref, form);
      setProfile(form);
      toast({ title: 'Cambios guardados correctamente.', variant: 'success' });
    } catch (e) {
      toast({ title: 'Error al guardar los cambios.', variant: 'destructive' });
    }
    setSaving(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('plan.')) {
      setForm((f) => ({
        ...f,
        plan: { ...f.plan, [name.split('.')[1]]: value },
      }));
    } else if (name.startsWith('socials.')) {
      setForm((f) => ({
        ...f,
        socials: { ...f.socials, [name.split('.')[1]]: value },
      }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  return { profile, form, setForm, loading, saving, handleSave, handleChange };
}
