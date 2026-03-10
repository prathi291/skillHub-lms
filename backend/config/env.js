import dotenv from 'dotenv';

dotenv.config();

const requiredVars = [
  'JWT_SECRET',
  'MONGO_URI'
];

const config = {
  // Server
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000'),
  HOST: process.env.HOST || 'localhost',

  // Database (MongoDB Atlas)
  MONGO_URI: process.env.MONGO_URI,

  // JWT
  JWT: {
    SECRET: process.env.JWT_SECRET,
    EXPIRATION: process.env.JWT_EXPIRATION || '24h',
    REFRESH_EXPIRATION: process.env.JWT_REFRESH_EXPIRATION || '7d'
  },

  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],

  // Redis
  REDIS: {
    HOST: process.env.REDIS_HOST || 'localhost',
    PORT: parseInt(process.env.REDIS_PORT || '6379')
  },

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
  LOG_FILE: process.env.LOG_FILE || 'logs/app.log'
};

// Validate required environment variables
const missing = requiredVars.filter(variable => !process.env[variable]);
if (missing.length > 0) {
  console.warn(`⚠️  Missing environment variables: ${missing.join(', ')}`);
}

export default config;
