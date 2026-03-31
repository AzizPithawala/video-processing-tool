require('dotenv').config();

const env = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRY: process.env.JWT_EXPIRY || '7d',
  REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY || '30d',
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 209715200,
  STORAGE_PATH: process.env.STORAGE_PATH || './storage/videos',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
};

module.exports = env;
