import React, { useState } from 'react';
import { Box, Button, Typography, CircularProgress, Avatar } from '@mui/material';
import { doc, setDoc, getDocs, collection, query, where } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';

export default function StepFinish({ allData, uid, onFinish, onBack }) {
  const [loading, setLoading] = useState(false);

  const handleFinish = async () => {
    setLoading(true);
    let logoURL = '';
    try {
      // Subir logo si es necesario
      if (allData.business.logo && allData.business.logo.startsWith('data:')) {
        const storageRef = ref(storage, `negocios/${uid}/logo.png`);
        await uploadString(storageRef, allData.business.logo, 'data_url');
        logoURL = await getDownloadURL(storageRef);
      } else {
        logoURL = allData.business.logo || '';
      }

      // Guardar datos del negocio
      await setDoc(doc(db, 'negocios', uid), {
        ...allData.business,
        logo: logoURL,
        preferences: allData.preferences,
        mainUser: allData.mainUser,
        setupCompleted: true,
        updatedAt: new Date(),
      });

      // --- Guardar o actualizar cliente principal en "clients" ---
      const clientsRef = collection(db, 'clients');
      const q = query(clientsRef, where('email', '==', allData.mainUser.email));
      const snapshot = await getDocs(q);

      const clientData = {
        name: allData.mainUser.name,
        phone: allData.mainUser.phone,
        email: allData.mainUser.email,
        rol: allData.mainUser.rol || 'propietario', // Puedes cambiar el valor por defecto si lo deseas
        history: [],
        updatedAt: new Date(),
      };

      if (!snapshot.empty) {
        // Si existe, actualiza
        await setDoc(doc(db, 'clients', snapshot.docs[0].id), clientData, { merge: true });
      } else {
        // Si no existe, crea uno nuevo
        await setDoc(doc(clientsRef), clientData);
      }

      // Espera breve para que Firestore replique el cambio
      setTimeout(() => {
        onFinish();
      }, 800);
    } catch (error) {
      console.error('Error al guardar datos del wizard:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box textAlign="center">
      <Typography variant="h5" gutterBottom>¡Todo listo!</Typography>
      <Typography variant="body1" mb={3}>Tu sistema POS está configurado.</Typography>
      {allData.business.logo && (
        <Avatar
          src={allData.business.logo}
          alt="Logo"
          sx={{ width: 80, height: 80, mx: 'auto', mb: 2 }}
        />
      )}
      <Box display="flex" justifyContent="center" gap={2} mt={2}>
        <Button variant="outlined" onClick={onBack}>Atrás</Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleFinish}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Ir al Panel Principal'}
        </Button>
      </Box>
    </Box>
  );
}