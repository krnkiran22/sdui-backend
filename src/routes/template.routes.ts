import { Router } from 'express';
import { body, param, query } from 'express-validator';
import templateController from '../controllers/template.controller';
import { validate } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';

const router = Router();

// Get all templates (public)
router.get(
  '/',
  validate([
    query('category').optional().trim(),
  ]),
  templateController.getAllTemplates
);

// Get template by ID (public)
router.get(
  '/:id',
  validate([
    param('id').isMongoId().withMessage('Invalid template ID'),
  ]),
  templateController.getTemplate
);

// Create template (authenticated)
router.post(
  '/',
  authenticate,
  authorize('super-admin'),
  validate([
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('description').optional().trim(),
    body('category')
      .isIn(['homepage', 'about', 'courses', 'departments', 'contact', 'blog', 'events', 'custom'])
      .withMessage('Invalid category'),
    body('thumbnail').optional().trim(),
    body('jsonConfig').isObject().withMessage('JSON config is required'),
    body('isPublic').optional().isBoolean(),
  ]),
  templateController.createTemplate
);

// Apply template
router.post(
  '/:id/apply',
  authenticate,
  authorize('super-admin', 'editor'),
  validate([
    param('id').isMongoId().withMessage('Invalid template ID'),
  ]),
  templateController.applyTemplate
);

export default router;
