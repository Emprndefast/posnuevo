const express = require('express');
const cors = require('cors');
const botRoutes = require('./src/routes/botRoutes');
const posRoutes = require('./src/routes/posRoutes');
const huggingFaceRoutes = require('./src/routes/huggingFaceRoutes');
const connectDB = require('./src/db/mongodb');
require('dotenv').config();

const app = express();

// Conectar a MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api', botRoutes);
app.use('/api', posRoutes);
app.use('/api', huggingFaceRoutes);

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
}); 