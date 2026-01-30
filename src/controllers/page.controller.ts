import { Request, Response } from 'express';
import pageService from '../services/page.service';
import { sendSuccess, sendError } from '../utils/response.util';
import { asyncHandler } from '../middleware/error.middleware';

export class PageController {
  // Get all pages
  getAllPages = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const pages = await pageService.getAllPages(req.user.institutionId);

    sendSuccess(res, pages);
  });

  // Get page by ID
  getPage = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const { id } = req.params;
    const page = await pageService.getPageById(id, req.user.institutionId);

    sendSuccess(res, page);
  });

  // Create page
  createPage = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const { name, slug } = req.body;

    const page = await pageService.createPage({
      institutionId: req.user.institutionId,
      name,
      slug,
      userId: req.user.userId,
    });

    sendSuccess(res, page, 'Page created successfully', 201);
  });

  // Update page
  updatePage = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const { id } = req.params;
    const { jsonConfig, changes } = req.body;

    const page = await pageService.updatePage(
      id,
      req.user.institutionId,
      req.user.userId,
      jsonConfig,
      changes
    );

    sendSuccess(res, page, 'Page updated successfully');
  });

  // Publish page
  publishPage = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const { id } = req.params;
    const page = await pageService.publishPage(id, req.user.institutionId);

    sendSuccess(res, page, 'Page published successfully');
  });

  // Unpublish page
  unpublishPage = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const { id } = req.params;
    const page = await pageService.unpublishPage(id, req.user.institutionId);

    sendSuccess(res, page, 'Page unpublished successfully');
  });

  // Delete page
  deletePage = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const { id } = req.params;
    await pageService.deletePage(id, req.user.institutionId);

    sendSuccess(res, null, 'Page deleted successfully');
  });

  // Duplicate page
  duplicatePage = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const { id } = req.params;
    const { name, slug } = req.body;

    const page = await pageService.duplicatePage(
      id,
      req.user.institutionId,
      req.user.userId,
      name,
      slug
    );

    sendSuccess(res, page, 'Page duplicated successfully', 201);
  });

  // Get published pages (public)
  getPublishedPages = asyncHandler(async (req: Request, res: Response) => {
    const { institutionId } = req.query;

    if (!institutionId) {
      return sendError(res, 'Institution ID required', 400);
    }

    const pages = await pageService.getPublishedPages(institutionId as string);

    sendSuccess(res, pages);
  });

  // Get published page by slug (public)
  getPublishedPage = asyncHandler(async (req: Request, res: Response) => {
    const { slug } = req.params;
    const { institutionId } = req.query;

    if (!institutionId) {
      return sendError(res, 'Institution ID required', 400);
    }

    const page = await pageService.getPublishedPageBySlug(
      slug,
      institutionId as string
    );

    sendSuccess(res, page);
  });
}

export default new PageController();
