import mongoose from 'mongoose';
import 'dotenv/config';

export async function initializePool() {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined in your .env file.');
    }

    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected successfully to Atlas');
    return mongoose.connection;
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    process.exit(1);
  }
}

export function getPool() {
  return mongoose.connection;
}

export async function closePool() {
  await mongoose.connection.close();
  console.log('✅ MongoDB Atlas connection closed');
}

export default {
  initializePool,
  getPool,
  closePool
};

