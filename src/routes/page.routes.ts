import { Router } from 'express';
import { body, param } from 'express-validator';
import pageController from '../controllers/page.controller';
import { validate } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';

const router = Router();

// Get all pages
router.get('/', authenticate, pageController.getAllPages);

// Get page by ID
router.get(
  '/:id',
  authenticate,
  validate([
    param('id').isMongoId().withMessage('Invalid page ID'),
  ]),
  pageController.getPage
);

// Create page
router.post(
  '/',
  authenticate,
  authorize('super-admin', 'editor'),
  validate([
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('slug')
      .trim()
      .notEmpty()
      .matches(/^[a-z0-9-]+$/)
      .withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),
  ]),
  pageController.createPage
);

// Update page
router.put(
  '/:id',
  authenticate,
  authorize('super-admin', 'editor'),
  validate([
    param('id').isMongoId().withMessage('Invalid page ID'),
    body('jsonConfig').notEmpty().withMessage('JSON config is required'),
  ]),
  pageController.updatePage
);

// Publish page
router.post(
  '/:id/publish',
  authenticate,
  authorize('super-admin', 'editor'),
  validate([
    param('id').isMongoId().withMessage('Invalid page ID'),
  ]),
  pageController.publishPage
);

// Unpublish page
router.post(
  '/:id/unpublish',
  authenticate,
  authorize('super-admin', 'editor'),
  validate([
    param('id').isMongoId().withMessage('Invalid page ID'),
  ]),
  pageController.unpublishPage
);

// Delete page
router.delete(
  '/:id',
  authenticate,
  authorize('super-admin', 'editor'),
  validate([
    param('id').isMongoId().withMessage('Invalid page ID'),
  ]),
  pageController.deletePage
);

// Duplicate page
router.post(
  '/:id/duplicate',
  authenticate,
  authorize('super-admin', 'editor'),
  validate([
    param('id').isMongoId().withMessage('Invalid page ID'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('slug')
      .trim()
      .notEmpty()
      .matches(/^[a-z0-9-]+$/)
      .withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),
  ]),
  pageController.duplicatePage
);

export default router;
