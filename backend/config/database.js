import mongoose from 'mongoose';

export async function initializePool() {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      console.warn('⚠️ MONGO_URI is not defined. Skipping database connection for now.');
      return null;
    }

    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected successfully to Atlas');
    return mongoose.connection;
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    // On cloud environments like Render, we might want to let the server start
    // but log the error so we can debug the environment variables.
    return null;
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

