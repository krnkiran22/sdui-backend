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

export default router;
