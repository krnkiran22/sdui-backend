import { v2 as cloudinary } from 'cloudinary';
import { Media, IMedia } from '../models/Media.model';
import { AppError } from '../middleware/error.middleware';

export class MediaService {
  // Upload file to Cloudinary
  async uploadFile(
    file: Express.Multer.File,
    institutionId: string,
    userId: string
  ): Promise<IMedia> {
    try {
      // Determine resource type
      let resourceType: 'image' | 'video' | 'raw' = 'image';
      let mediaType: 'image' | 'video' | 'document' = 'image';

      if (file.mimetype.startsWith('video/')) {
        resourceType = 'video';
        mediaType = 'video';
      } else if (
        file.mimetype === 'application/pdf' ||
        file.mimetype.includes('document')
      ) {
        resourceType = 'raw';
        mediaType = 'document';
      }

      // Upload to Cloudinary
      const result = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `institutions/${institutionId}`,
            resource_type: resourceType,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        uploadStream.end(file.buffer);
      });

      // Save media record
      const media = await Media.create({
        institutionId,
        filename: file.originalname,
        cloudinaryUrl: result.secure_url,
        cloudinaryPublicId: result.public_id,
        type: mediaType,
        size: file.size,
        uploadedBy: userId,
      });

      return media;
    } catch (error) {
      console.error('File upload error:', error);
      throw new AppError('Failed to upload file', 500, 'UPLOAD_ERROR');
    }
  }

  // Get all media for institution
  async getAllMedia(institutionId: string): Promise<IMedia[]> {
    return Media.find({ institutionId })
      .sort({ uploadedAt: -1 })
      .populate('uploadedBy', 'name email');
  }

  // Delete media
  async deleteMedia(mediaId: string, institutionId: string): Promise<void> {
    const media = await Media.findOne({ _id: mediaId, institutionId });

    if (!media) {
      throw new AppError('Media not found', 404, 'MEDIA_NOT_FOUND');
    }

    try {
      // Delete from Cloudinary
      await cloudinary.uploader.destroy(media.cloudinaryPublicId);

      // Delete from database
      await media.deleteOne();
    } catch (error) {
      console.error('Media deletion error:', error);
      throw new AppError('Failed to delete media', 500, 'DELETE_ERROR');
    }
  }
}

export default new MediaService();
