import { Router } from 'express';
import { param } from 'express-validator';
import versionController from '../controllers/version.controller';
import { validate } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';

const router = Router();

// Get version history
router.get(
  '/:pageId',
  authenticate,
  validate([
    param('pageId').isMongoId().withMessage('Invalid page ID'),
  ]),
  versionController.getVersionHistory
);

// Get specific version
router.get(
  '/:pageId/:versionNumber',
  authenticate,
  validate([
    param('pageId').isMongoId().withMessage('Invalid page ID'),
    param('versionNumber').isInt({ min: 1 }).withMessage('Invalid version number'),
  ]),
  versionController.getVersion
);

// Restore version
router.post(
  '/:pageId/:versionNumber/restore',
  authenticate,
  authorize('super-admin', 'editor'),
  validate([
    param('pageId').isMongoId().withMessage('Invalid page ID'),
    param('versionNumber').isInt({ min: 1 }).withMessage('Invalid version number'),
  ]),
  versionController.restoreVersion
);

export default router;
