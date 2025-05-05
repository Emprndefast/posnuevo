import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; // Cambiar la importación para acceder a db

import Invoice from '../components/Invoice'; 
import DeviceLabel from '../components/DeviceLabel';
import { collection, getDocs } from 'firebase/firestore';

const RepairList = () => {
  const [repairs, setRepairs] = useState([]);

  useEffect(() => {
    // Lógica para obtener los datos de reparaciones
    const fetchRepairs = async () => {
      try {
        const repairsCollection = collection(db, 'repairs'); // Acceder a la colección de reparaciones
        const repairsSnapshot = await getDocs(repairsCollection);
        const repairsData = repairsSnapshot.docs.map(doc => doc.data());
        setRepairs(repairsData);
      } catch (error) {
        console.error("Error fetching repairs:", error);
      }
    };

    fetchRepairs();
  }, []);

  return (
    <div>
      <h2>Lista de Reparaciones</h2>
      <ul>
        {repairs.map((repair, index) => (
          <li key={index}>
            <Invoice repair={repair} />
            <DeviceLabel repair={repair} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RepairList;
