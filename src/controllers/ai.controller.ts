import { Request, Response } from 'express';
import aiService from '../services/ai.service';
import { CustomComponent } from '../models/CustomComponent.model';
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
      return sendSuccess(res, result.operation, 'Command processed successfully');
    } else {
      return sendError(res, result.error || 'Failed to process command', 500);
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
      return sendSuccess(res, { content: result.content }, 'Content generated successfully');
    } else {
      return sendError(res, result.error || 'Failed to generate content', 500);
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
      return sendSuccess(res, result.suggestions, 'Suggestions generated successfully');
    } else {
      return sendError(res, result.error || 'Failed to generate suggestions', 500);
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
      return sendSuccess(res, {
        isValid: result.isValid,
        issues: result.issues,
      }, 'Validation completed');
    } else {
      return sendError(res, result.error || 'Failed to validate design', 500);
    }
  });

  // Generate and save a custom component
  generateCustomComponent = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const { prompt } = req.body;

    if (!prompt) {
      return sendError(res, 'Prompt is required', 400);
    }

    const result = await aiService.generateComponent(prompt);

    if (result.success && result.component) {
      // Save the generated component to the database
      const component = await CustomComponent.create({
        institutionId: req.user.institutionId,
        name: result.component.name,
        description: result.component.description,
        type: result.component.type,
        props: result.component.props,
        jsxCode: result.component.jsxCode,
        createdBy: req.user.userId,
      });

      return sendSuccess(res, component, 'Component generated and saved successfully', 201);
    } else {
      return sendError(res, result.error || 'Failed to generate component', 500);
    }
  });

  // Get all custom components for an institution
  getCustomComponents = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const components = await CustomComponent.find({
      institutionId: req.user.institutionId,
    }).sort({ createdAt: -1 });

    return sendSuccess(res, components);
  });

  // Plan a multi-page site structure from a single prompt
  planSite = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const { prompt } = req.body;
    if (!prompt) {
      return sendError(res, 'Prompt is required', 400);
    }

    const result = await aiService.planSite(prompt);

    if (result.success) {
      return sendSuccess(res, { pages: result.pages }, 'Site planned successfully');
    } else {
      return sendError(res, result.error || 'Failed to plan site', 500);
    }
  });

  // Generate a full page HTML using Groq/Claude
  generatePageHTML = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const { prompt, currentSlug, templateType } = req.body;
    if (!prompt) {
      return sendError(res, 'Prompt is required', 400);
    }

    // Get pages for link context
    const { Page } = await import('../models/Page.model');
    const existingPages = await Page.find({ 
      institutionId: req.user.institutionId 
    }).select('name slug').sort({ createdAt: 1 });

    const result = await aiService.generateFullPageHTML(prompt, { 
      pages: existingPages.map(p => ({ name: p.name, slug: p.slug })),
      currentSlug: currentSlug || undefined,
      templateType: templateType || undefined,
    });

    if (result.success) {
      return sendSuccess(res, { html: result.html }, 'HTML generated successfully');
    } else {
      return sendError(res, result.error || 'Failed to generate HTML', 500);
    }
  });

  // Modify existing full page HTML
  modifyPageHTML = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const { prompt, currentHtml, currentSlug } = req.body;
    if (!prompt) {
      return sendError(res, 'Prompt is required', 400);
    }
    if (!currentHtml) {
      return sendError(res, 'Current HTML is required', 400);
    }

    // Fetch existing pages to provide navigation context to AI
    const { Page } = await import('../models/Page.model');
    const existingPages = await Page.find({
      institutionId: req.user.institutionId,
    }).select('name slug').sort({ createdAt: 1 });

    const pagesContext = existingPages.map((p) => ({ name: p.name, slug: p.slug }));

    const result = await aiService.modifyFullPageHTML(prompt, currentHtml, {
      pages: pagesContext,
      currentSlug: currentSlug || undefined,
    });

    if (result.success) {
      return sendSuccess(res, { html: result.html }, 'HTML modified successfully');
    } else {
      return sendError(res, result.error || 'Failed to modify HTML', 500);
    }
  });
}

export default new AIController();
