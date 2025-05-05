import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';

const ReparacionesLista = () => {
  const [reparaciones, setReparaciones] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "reparaciones"), (snapshot) => {
      const datos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReparaciones(datos);
    });
    return () => unsub();
  }, []);

  const cobrar = async (id) => {
    await updateDoc(doc(db, "reparaciones", id), { pagado: true });
  };

  const imprimirEtiqueta = (reparacion) => {
    const etiqueta = `
      Cliente: ${reparacion.cliente}
      Modelo: ${reparacion.modelo}
      Problema: ${reparacion.problema}
      Precio: ${reparacion.precio}
    `;
    const ventana = window.open('', '', 'width=300,height=400');
    ventana.document.write(`<pre>${etiqueta}</pre>`);
    ventana.print();
    ventana.close();
  };

  return (
    <div>
      <h2>Lista de Reparaciones</h2>
      {reparaciones.map(rep => (
        <div key={rep.id} className="reparacion">
          <p><strong>Cliente:</strong> {rep.cliente}</p>
          <p><strong>Modelo:</strong> {rep.modelo}</p>
          <p><strong>Problema:</strong> {rep.problema}</p>
          <p><strong>Precio:</strong> ${rep.precio}</p>
          <p><strong>Estado:</strong> {rep.pagado ? 'Pagado' : 'Pendiente'}</p>
          <div>
            <button onClick={() => cobrar(rep.id)} disabled={rep.pagado}>
              <i className="fas fa-credit-card"></i> Cobrar
            </button>
            <button onClick={() => imprimirEtiqueta(rep)}>
              <i className="fas fa-print"></i> Imprimir Etiqueta
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReparacionesLista;
