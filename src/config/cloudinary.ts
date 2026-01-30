import { v2 as cloudinary } from 'cloudinary';
import env from './env';

export const configureCloudinary = (): void => {
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
  });

  console.log('✅ Cloudinary configured successfully');
};

export default cloudinary;
