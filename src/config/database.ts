import mongoose from 'mongoose';
import env from './env';

export const connectDatabase = async (): Promise<void> => {
  try {
    const options = {
      serverSelectionTimeoutMS: 15000, // Wait up to 15 seconds for server selection
      heartbeatFrequencyMS: 10000,    // Check server status every 10 seconds
    };

    await mongoose.connect(env.mongoUri, options);
    console.log('✅ MongoDB connected successfully to Cluster');

    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB connection error details:', error);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
    });
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error);
  }
};
