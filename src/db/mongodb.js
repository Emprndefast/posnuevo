const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pos-nt', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    logger.info(`MongoDB conectado: ${conn.connection.host}`);
  } catch (error) {
    logger.error('Error al conectar con MongoDB:', error);
    process.exit(1);
  }
};

module.exports = connectDB; 