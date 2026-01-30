import { Router } from 'express';
import { param } from 'express-validator';
import multer from 'multer';
import mediaController from '../controllers/media.controller';
import { validate } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images, videos, and documents
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/mpeg',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

// Upload media
router.post(
  '/upload',
  authenticate,
  authorize('super-admin', 'editor'),
  upload.single('file'),
  mediaController.uploadMedia
);

// Get all media
router.get('/', authenticate, mediaController.getAllMedia);

// Delete media
router.delete(
  '/:id',
  authenticate,
  authorize('super-admin', 'editor'),
  validate([
    param('id').isMongoId().withMessage('Invalid media ID'),
  ]),
  mediaController.deleteMedia
);

export default router;
