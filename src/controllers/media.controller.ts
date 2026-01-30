import { Request, Response } from 'express';
import mediaService from '../services/media.service';
import { sendSuccess, sendError } from '../utils/response.util';
import { asyncHandler } from '../middleware/error.middleware';

export class MediaController {
  // Upload media
  uploadMedia = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    if (!req.file) {
      return sendError(res, 'No file uploaded', 400);
    }

    const media = await mediaService.uploadFile(
      req.file,
      req.user.institutionId,
      req.user.userId
    );

    sendSuccess(res, media, 'File uploaded successfully', 201);
  });

  // Get all media
  getAllMedia = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const media = await mediaService.getAllMedia(req.user.institutionId);

    sendSuccess(res, media);
  });

  // Delete media
  deleteMedia = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const { id } = req.params;
    await mediaService.deleteMedia(id, req.user.institutionId);

    sendSuccess(res, null, 'Media deleted successfully');
  });
}

export default new MediaController();
