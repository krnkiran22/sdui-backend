import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.util';
import { sendError } from '../utils/response.util';
import { JWTPayload } from '../types/auth.types';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendError(res, 'No token provided', 401, 'UNAUTHORIZED');
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      // Verify token
      const decoded = verifyAccessToken(token);
      req.user = decoded;
      next();
    } catch (error) {
      sendError(res, 'Invalid or expired token', 401, 'INVALID_TOKEN');
      return;
    }
  } catch (error) {
    sendError(res, 'Authentication failed', 500, 'AUTH_ERROR');
    return;
  }
};
export const optionalAuthenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Proceed without req.user
    }

    const token = authHeader.substring(7);

    try {
      const decoded = verifyAccessToken(token);
      req.user = decoded;
      next();
    } catch (error) {
      // Invalid token - we could either error or just proceed without user
      // For optional auth, usually we just proceed without user
      next();
    }
  } catch (error) {
    next();
  }
};
