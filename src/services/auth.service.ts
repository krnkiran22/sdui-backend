import { Institution, IInstitution } from '../models/Institution.model';
import { User, IUser } from '../models/User.model';
import { hashPassword, comparePassword } from '../utils/bcrypt.util';
import { generateAuthTokens, verifyRefreshToken } from '../utils/jwt.util';
import { AppError } from '../middleware/error.middleware';
import { AuthTokens, JWTPayload } from '../types/auth.types';

export class AuthService {
  // Register new institution
  async registerInstitution(data: {
    name: string;
    email: string;
    password: string;
    subdomain: string;
  }): Promise<{ institution: IInstitution; user: IUser; tokens: AuthTokens }> {
    // Check if institution already exists
    const existingInstitution = await Institution.findOne({
      $or: [{ email: data.email }, { subdomain: data.subdomain }],
    });

    if (existingInstitution) {
      throw new AppError('Institution already exists with this email or subdomain', 409, 'DUPLICATE_INSTITUTION');
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create institution
    const institution = await Institution.create({
      name: data.name,
      email: data.email,
      passwordHash,
      subdomain: data.subdomain,
    });

    // Create super admin user
    const user = await User.create({
      institutionId: institution._id,
      name: data.name,
      email: data.email,
      passwordHash,
      role: 'super-admin',
    });

    // Generate tokens
    const payload: JWTPayload = {
      userId: user._id.toString(),
      institutionId: institution._id.toString(),
      role: user.role,
      email: user.email,
    };

    const tokens = generateAuthTokens(payload);

    return { institution, user, tokens };
  }

  // Login user
  async login(email: string, password: string): Promise<{ user: IUser; tokens: AuthTokens }> {
    // Find user
    const user = await User.findOne({ email }).populate('institutionId');

    if (!user) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AppError('Account is deactivated', 403, 'ACCOUNT_DEACTIVATED');
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const payload: JWTPayload = {
      userId: user._id.toString(),
      institutionId: user.institutionId.toString(),
      role: user.role,
      email: user.email,
    };

    const tokens = generateAuthTokens(payload);

    return { user, tokens };
  }

  // Refresh access token
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      // Verify refresh token
      const decoded = verifyRefreshToken(refreshToken);

      // Check if user still exists and is active
      const user = await User.findById(decoded.userId);

      if (!user || !user.isActive) {
        throw new AppError('Invalid refresh token', 401, 'INVALID_TOKEN');
      }

      // Generate new tokens
      const payload: JWTPayload = {
        userId: user._id.toString(),
        institutionId: user.institutionId.toString(),
        role: user.role,
        email: user.email,
      };

      return generateAuthTokens(payload);
    } catch (error) {
      throw new AppError('Invalid refresh token', 401, 'INVALID_TOKEN');
    }
  }

  // Create additional user (by super admin)
  async createUser(data: {
    institutionId: string;
    name: string;
    email: string;
    password: string;
    role: 'editor' | 'viewer';
  }): Promise<IUser> {
    // Check if user already exists
    const existingUser = await User.findOne({ email: data.email });

    if (existingUser) {
      throw new AppError('User already exists with this email', 409, 'DUPLICATE_USER');
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user
    const user = await User.create({
      institutionId: data.institutionId,
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role,
    });

    return user;
  }

  // Get user by ID
  async getUserById(userId: string): Promise<IUser | null> {
    return User.findById(userId).select('-passwordHash');
  }
}

export default new AuthService();
