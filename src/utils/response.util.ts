import { Response } from 'express';

interface SuccessResponse {
  success: true;
  data?: any;
  message?: string;
}

interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: any;
  };
}

export const sendSuccess = (
  res: Response,
  data?: any,
  message?: string,
  statusCode: number = 200
): Response => {
  const response: SuccessResponse = {
    success: true,
  };

  if (data !== undefined) {
    response.data = data;
  }

  if (message) {
    response.message = message;
  }

  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode: number = 500,
  code?: string,
  details?: any
): Response => {
  const response: ErrorResponse = {
    success: false,
    error: {
      message,
    },
  };

  if (code) {
    response.error.code = code;
  }

  if (details) {
    response.error.details = details;
  }

  return res.status(statusCode).json(response);
};
