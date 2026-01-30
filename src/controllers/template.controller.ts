import { Request, Response } from 'express';
import templateService from '../services/template.service';
import { sendSuccess, sendError } from '../utils/response.util';
import { asyncHandler } from '../middleware/error.middleware';

export class TemplateController {
  // Get all templates
  getAllTemplates = asyncHandler(async (req: Request, res: Response) => {
    const { category } = req.query;

    const templates = await templateService.getAllTemplates(category as string);

    sendSuccess(res, templates);
  });

  // Get template by ID
  getTemplate = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const template = await templateService.getTemplateById(id);

    sendSuccess(res, template);
  });

  // Create template
  createTemplate = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const { name, description, category, thumbnail, jsonConfig, isPublic } = req.body;

    const template = await templateService.createTemplate({
      name,
      description,
      category,
      thumbnail,
      jsonConfig,
      isPublic,
      userId: req.user.userId,
    });

    sendSuccess(res, template, 'Template created successfully', 201);
  });

  // Apply template
  applyTemplate = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const { id } = req.params;

    const jsonConfig = await templateService.applyTemplate(id);

    sendSuccess(res, jsonConfig, 'Template applied successfully');
  });
}

export default new TemplateController();
