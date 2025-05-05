import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

const AddRepair = () => {
  const [cliente, setCliente] = useState("");
  const [modelo, setModelo] = useState("");
  const [estado, setEstado] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "reparaciones"), {
        cliente,
        modelo,
        estado,
        fecha: Timestamp.now(),
      });
      alert("Reparación guardada con éxito");
      setCliente("");
      setModelo("");
      setEstado("");
    } catch (err) {
      console.error("Error al guardar:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2>Registrar Reparación</h2>
      <input
        type="text"
        placeholder="Nombre del cliente"
        value={cliente}
        onChange={(e) => setCliente(e.target.value)}
        required
        style={styles.input}
      />
      <input
        type="text"
        placeholder="Modelo del teléfono"
        value={modelo}
        onChange={(e) => setModelo(e.target.value)}
        required
        style={styles.input}
      />
      <input
        type="text"
        placeholder="Estado"
        value={estado}
        onChange={(e) => setEstado(e.target.value)}
        required
        style={styles.input}
      />
      <button type="submit" style={styles.button}>Guardar</button>
    </form>
  );
};

const styles = {
  form: {
    maxWidth: "400px",
    margin: "20px auto",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "10px",
    background: "#f9f9f9",
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },
  input: {
    padding: "10px",
    fontSize: "16px"
  },
  button: {
    padding: "10px",
    background: "#007bff",
    color: "#fff",
    border: "none",
    fontSize: "16px",
    cursor: "pointer"
  }
};

export default AddRepair;
