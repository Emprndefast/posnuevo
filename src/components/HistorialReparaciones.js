// src/components/HistorialReparaciones.js
import React, { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

const HistorialReparaciones = () => {
  const [reparaciones, setReparaciones] = useState([]);

  const obtenerReparaciones = async () => {
    const querySnapshot = await getDocs(collection(db, 'reparaciones'));
    const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setReparaciones(docs);
  };

  const eliminarReparacion = async (id) => {
    await deleteDoc(doc(db, 'reparaciones', id));
    obtenerReparaciones(); // Refresca la lista
  };

  useEffect(() => {
    obtenerReparaciones();
  }, []);

  return (
    <div>
      <h2>Historial de Reparaciones</h2>
      <ul>
        {reparaciones.map(rep => (
          <li key={rep.id}>
            {rep.fecha?.toDate().toLocaleString()} - {rep.cliente} - {rep.modelo} - {rep.precio} $
            <button onClick={() => eliminarReparacion(rep.id)}>🗑️</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HistorialReparaciones;
