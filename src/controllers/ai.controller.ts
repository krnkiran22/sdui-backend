import { Request, Response } from 'express';
import aiService from '../services/ai.service';
import { sendSuccess, sendError } from '../utils/response.util';
import { asyncHandler } from '../middleware/error.middleware';

export class AIController {
  // Process command
  processCommand = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const { command, context } = req.body;

    const result = await aiService.processCommand(command, context);

    if (result.success) {
      sendSuccess(res, result.operation, 'Command processed successfully');
    } else {
      sendError(res, result.error || 'Failed to process command', 500);
    }
  });

  // Generate content
  generateContent = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const { type, params } = req.body;

    const result = await aiService.generateContent(type, params);

    if (result.success) {
      sendSuccess(res, { content: result.content }, 'Content generated successfully');
    } else {
      sendError(res, result.error || 'Failed to generate content', 500);
    }
  });

  // Get suggestions
  getSuggestions = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const { pageJSON } = req.body;

    const result = await aiService.suggestImprovements(pageJSON);

    if (result.success) {
      sendSuccess(res, result.suggestions, 'Suggestions generated successfully');
    } else {
      sendError(res, result.error || 'Failed to generate suggestions', 500);
    }
  });

  // Validate design
  validateDesign = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const { pageJSON } = req.body;

    const result = await aiService.validateDesign(pageJSON);

    if (result.success) {
      sendSuccess(res, {
        isValid: result.isValid,
        issues: result.issues,
      }, 'Validation completed');
    } else {
      sendError(res, result.error || 'Failed to validate design', 500);
    }
  });
}

export default new AIController();
