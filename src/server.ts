import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import env from './config/env';
import { connectDatabase } from './config/database';
import { connectRedis } from './config/redis';
import { configureCloudinary } from './config/cloudinary';
import { errorHandler } from './middleware/error.middleware';
import { apiLimiter } from './middleware/rateLimit.middleware';

// Import routes
import authRoutes from './routes/auth.routes';
import pageRoutes from './routes/page.routes';
import aiRoutes from './routes/ai.routes';
import mediaRoutes from './routes/media.routes';
import templateRoutes from './routes/template.routes';
import versionRoutes from './routes/version.routes';
import publicRoutes from './routes/public.routes';

import logger from './utils/logger.util';

const app: Application = express();

// Middleware
app.use(helmet()); // Security headers
app.use(compression()); // Compress responses
app.use(cors({
  origin: env.allowedOrigins,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (env.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: env.nodeEnv,
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/pages', apiLimiter, pageRoutes);
app.use('/api/ai', aiRoutes); // AI routes have their own rate limiter
app.use('/api/media', apiLimiter, mediaRoutes);
app.use('/api/templates', apiLimiter, templateRoutes);
app.use('/api/versions', apiLimiter, versionRoutes);
app.use('/api/public', publicRoutes); // No auth required

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found',
      code: 'NOT_FOUND',
    },
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await connectDatabase();

    // Connect to Redis
    await connectRedis();

    // Configure Cloudinary
    configureCloudinary();

    // Start Express server
    app.listen(env.port, () => {
      console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🚀 Server-Driven UI Website Builder API            ║
║                                                       ║
║   Environment: ${env.nodeEnv.padEnd(38)}  ║
║   Port:        ${env.port.toString().padEnd(38)}  ║
║   Status:      Running ✅                            ║
║                                                       ║
║   Health Check: http://localhost:${env.port}/health       ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
      `);
      logger.info(`Server started on port ${env.port}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

// Start the server
startServer();

export default app;
