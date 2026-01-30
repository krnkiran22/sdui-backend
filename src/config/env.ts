import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
  port: number;
  nodeEnv: string;
  mongoUri: string;
  redisUrl: string;
  jwtSecret: string;
  jwtRefreshSecret: string;
  jwtExpiresIn: string;
  jwtRefreshExpiresIn: string;
  cloudinary: {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
  };
  anthropicApiKey?: string;
  openaiApiKey?: string;
  allowedOrigins: string[];
}

const env: EnvConfig = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || '',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  jwtSecret: process.env.JWT_SECRET || '',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  openaiApiKey: process.env.OPENAI_API_KEY,
  allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(','),
};

// Validate critical environment variables
const validateEnv = () => {
  const requiredEnvVars = ['mongoUri', 'jwtSecret', 'jwtRefreshSecret'];
  const missingEnvVars = requiredEnvVars.filter((envVar) => !env[envVar as keyof EnvConfig]);

  if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  }

  if (!env.anthropicApiKey && !env.openaiApiKey) {
    console.warn('Warning: No AI API key configured. AI features will be disabled.');
  }
};

validateEnv();

export default env;
