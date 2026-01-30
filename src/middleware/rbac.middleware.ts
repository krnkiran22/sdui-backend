import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.util';
import { UserRole } from '../types/auth.types';

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      sendError(
        res,
        'Insufficient permissions',
        403,
        'FORBIDDEN',
        { requiredRoles: allowedRoles, userRole: req.user.role }
      );
      return;
    }

    next();
  };
};
