const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    logger.info('DB_CONNECTED', { host: conn.connection.host });
  } catch (error) {
    logger.error('DB_CONNECTION_FAILED', { error: error.message });
    process.exit(1);
  }
};

module.exports = connectDB;
