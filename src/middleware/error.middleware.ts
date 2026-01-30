import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger.util';
import { sendError } from '../utils/response.util';

export class AppError extends Error {
  statusCode: number;
  code?: string;
  details?: any;

  constructor(message: string, statusCode: number = 500, code?: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log error
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  // Handle AppError
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode, err.code, err.details);
    return;
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    sendError(res, 'Validation error', 400, 'VALIDATION_ERROR', err.message);
    return;
  }

  // Handle Mongoose duplicate key errors
  if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    sendError(res, 'Duplicate entry', 409, 'DUPLICATE_ERROR');
    return;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    sendError(res, 'Invalid token', 401, 'INVALID_TOKEN');
    return;
  }

  if (err.name === 'TokenExpiredError') {
    sendError(res, 'Token expired', 401, 'TOKEN_EXPIRED');
    return;
  }

  // Default error
  sendError(res, 'Internal server error', 500, 'INTERNAL_ERROR');
};

// Async handler wrapper to catch errors in async routes
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
