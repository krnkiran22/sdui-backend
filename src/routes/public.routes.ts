import { Router } from 'express';
import { param, query } from 'express-validator';
import pageController from '../controllers/page.controller';
import authController from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';

const router = Router();

// Get all institutions
router.get('/institutions', authController.getInstitutions);

// Get all published pages
router.get(
  '/pages',
  validate([
    query('institutionId').optional().isMongoId().withMessage('Invalid institution ID'),
  ]),
  pageController.getPublishedPages
);

// Get published page by slug
router.get(
  '/pages/:slug',
  validate([
    param('slug').trim().notEmpty().withMessage('Slug is required'),
    query('institutionId').optional().isMongoId().withMessage('Invalid institution ID'),
  ]),
  pageController.getPublishedPage
);

export default router;
