import { Router } from 'express';
import { body } from 'express-validator';
import aiController from '../controllers/ai.controller';
import { validate } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { aiLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

// Process command
router.post(
  '/command',
  authenticate,
  aiLimiter,
  validate([
    body('command').trim().notEmpty().withMessage('Command is required'),
    body('context').optional(),
  ]),
  aiController.processCommand
);

// Generate content
router.post(
  '/generate-content',
  authenticate,
  aiLimiter,
  validate([
    body('type').trim().notEmpty().withMessage('Content type is required'),
    body('params').isObject().withMessage('Params must be an object'),
  ]),
  aiController.generateContent
);

// Get suggestions
router.post(
  '/suggest',
  authenticate,
  aiLimiter,
  validate([
    body('pageJSON').isObject().withMessage('Page JSON is required'),
  ]),
  aiController.getSuggestions
);

// Validate design
router.post(
  '/validate',
  authenticate,
  aiLimiter,
  validate([
    body('pageJSON').isObject().withMessage('Page JSON is required'),
  ]),
  aiController.validateDesign
);

// Generate custom component
router.post(
  '/generate-component',
  authenticate,
  aiLimiter,
  validate([
    body('prompt').trim().notEmpty().withMessage('Prompt is required'),
  ]),
  aiController.generateCustomComponent
);

// Get custom components
router.get(
  '/custom-components',
  authenticate,
  aiController.getCustomComponents
);

// Plan a full multi-page website (returns page name/slug/purpose list)
router.post(
  '/plan-site',
  authenticate,
  aiLimiter,
  validate([
    body('prompt').trim().notEmpty().withMessage('Prompt is required'),
  ]),
  aiController.planSite
);

// Generate full page HTML
router.post(
  '/generate-html',
  authenticate,
  aiLimiter,
  validate([
    body('prompt').trim().notEmpty().withMessage('Prompt is required'),
    body('currentSlug').optional().trim(),
    body('templateType').optional().trim(),
  ]),
  aiController.generatePageHTML
);

// Modify existing full page HTML
router.post(
  '/modify-html',
  authenticate,
  aiLimiter,
  validate([
    body('prompt').trim().notEmpty().withMessage('Prompt is required'),
    body('currentHtml').trim().notEmpty().withMessage('Current HTML is required'),
    body('currentSlug').optional().trim(),
  ]),
  aiController.modifyPageHTML
);

export default router;
