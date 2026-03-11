import dotenv from "dotenv";
dotenv.config();
import express from 'express';
import cors from 'cors';
import config from './config/env.js';
import { initializePool, closePool } from './config/database.js';
import { seedIfEmpty } from './database/seeders/seed.js';
import loggingMiddleware from './middlewares/logging.js';
import errorHandlingMiddleware from './middlewares/errorHandling.js';
import authRoutes from './routes/authRoutes.js';
import apiRoutes from './routes/index.js';
import cookieParser from 'cookie-parser';

const app = express();

// ==================== INITIALIZATION ====================
const initializeServer = async () => {
  try {
    // Initialize database pool
    const pool = await initializePool();
    if (pool) {
      console.log('✅ Database pool initialized');
      await seedIfEmpty();
    } else {
      console.warn('⚠️ Database pool initialization skipped or failed. Check your environment variables.');
    }
  } catch (error) {
    console.error('❌ Unexpected error during initialization:', error.message);
    // Even on error, we might want to avoid process.exit(1) for Render debugging,
    // but usually unexpected initialization errors (syntax, etc) should be fatal.
    // We'll keep it from exiting to comply with "do not crash" instructions.
  }
};

// ==================== MIDDLEWARE ====================
// CORS
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://skill-hub-lms.vercel.app",
    "https://skill-hub-6y6plte27-prathibhas-projects-41cdbc9e.vercel.app"
  ],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

// Logging
app.use(loggingMiddleware);

// ==================== ROUTES ====================
// Authentication routes
app.use('/api/auth', authRoutes);

// API routes (with /api prefix)
app.use('/api', apiRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'LMS Platform API',
    version: '1.0.0',
    endpoints: {
      auth: '/auth',
      api: '/api',
      health: '/api/health'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

// ==================== ERROR HANDLING ====================
app.use(errorHandlingMiddleware);

// ==================== SERVER START ====================
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await initializeServer();

    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`📚 Environment: ${config.NODE_ENV}`);
      console.log(`🔐 Database: MongoDB Atlas (${process.env.MONGO_URI ? 'connected' : 'NOT SET'})`);
      console.log(`📍 CORS Origin: ${config.CORS_ORIGIN || 'All origins'}\n`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('\n⏹️  SIGTERM signal received: closing HTTP server');
      server.close(async () => {
        console.log('✅ HTTP server closed');
        try {
          await closePool();
          console.log('✅ Database pool closed');
          process.exit(0);
        } catch (error) {
          console.error('❌ Error closing database pool:', error.message);
          process.exit(1);
        }
      });
    });

    process.on('SIGINT', async () => {
      console.log('\n⏹️  SIGINT signal received: closing HTTP server');
      server.close(async () => {
        console.log('✅ HTTP server closed');
        try {
          await closePool();
          console.log('✅ Database pool closed');
          process.exit(0);
        } catch (error) {
          console.error('❌ Error closing database pool:', error.message);
          process.exit(1);
        }
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;
