import { Router } from 'express';
import { body } from 'express-validator';
import authController from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';
import { authLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

// Register institution
router.post(
  '/register',
  authLimiter,
  validate([
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
    body('subdomain')
      .trim()
      .notEmpty()
      .matches(/^[a-z0-9-]+$/)
      .withMessage('Subdomain must contain only lowercase letters, numbers, and hyphens'),
  ]),
  authController.register
);

// Login
router.post(
  '/login',
  authLimiter,
  validate([
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ]),
  authController.login
);

// Refresh token
router.post(
  '/refresh',
  validate([
    body('refreshToken').notEmpty().withMessage('Refresh token is required'),
  ]),
  authController.refreshToken
);

// Get current user
router.get('/me', authenticate, authController.getCurrentUser);

// Create user (super admin only)
router.post(
  '/users',
  authenticate,
  authorize('super-admin'),
  validate([
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
    body('role')
      .isIn(['editor', 'viewer'])
      .withMessage('Role must be either editor or viewer'),
  ]),
  authController.createUser
);

export default router;
