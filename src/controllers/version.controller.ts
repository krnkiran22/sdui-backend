import { Request, Response } from 'express';
import versionService from '../services/version.service';
import { sendSuccess, sendError } from '../utils/response.util';
import { asyncHandler } from '../middleware/error.middleware';

export class VersionController {
  // Get version history
  getVersionHistory = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const { pageId } = req.params;

    const versions = await versionService.getVersionHistory(pageId);

    sendSuccess(res, versions);
  });

  // Get specific version
  getVersion = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const { pageId, versionNumber } = req.params;

    const version = await versionService.getVersion(pageId, parseInt(versionNumber));

    sendSuccess(res, version);
  });

  // Restore version
  restoreVersion = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const { pageId, versionNumber } = req.params;

    await versionService.restoreVersion(
      pageId,
      parseInt(versionNumber),
      req.user.userId
    );

    sendSuccess(res, null, 'Version restored successfully');
  });
}

export default new VersionController();
