import { Request, Response } from 'express';
import authService from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/response.util';
import { asyncHandler } from '../middleware/error.middleware';

export class AuthController {
  // Register institution
  register = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password, subdomain } = req.body;

    const result = await authService.registerInstitution({
      name,
      email,
      password,
      subdomain,
    });

    return sendSuccess(
      res,
      {
        user: {
          id: result.user._id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
        },
        institution: {
          id: result.institution._id,
          name: result.institution.name,
          subdomain: result.institution.subdomain,
        },
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
      },
      'Institution registered successfully',
      201
    );
  });

  // Login
  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    return sendSuccess(res, {
      user: {
        id: result.user._id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
        institutionId: result.user.institutionId._id ? result.user.institutionId._id.toString() : result.user.institutionId.toString(),
      },
      accessToken: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken,
    });
  });

  // Refresh token
  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    const tokens = await authService.refreshToken(refreshToken);

    return sendSuccess(res, tokens);
  });

  // Get current user
  getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const user = await authService.getUserById(req.user.userId);

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    return sendSuccess(res, {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      institutionId: user.institutionId.toString(),
    });
  });

  // Create user (by super admin)
  createUser = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const { name, email, password, role } = req.body;

    const user = await authService.createUser({
      institutionId: req.user.institutionId,
      name,
      email,
      password,
      role,
    });

    return sendSuccess(
      res,
      {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      'User created successfully',
      201
    );
  });

  // Get all institutions (public)
  getInstitutions = asyncHandler(async (_req: Request, res: Response) => {
    const institutions = await authService.getAllInstitutions();
    return sendSuccess(res, institutions);
  });
}

export default new AuthController();
