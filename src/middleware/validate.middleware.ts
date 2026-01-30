import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { sendError } from '../utils/response.util';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Run all validations
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // Format errors
    const extractedErrors = errors.array().map((err: any) => ({
      field: err.path || err.param,
      message: err.msg,
    }));

    sendError(
      res,
      'Validation failed',
      400,
      'VALIDATION_ERROR',
      extractedErrors
    );
  };
};
