export type UserRole = 'super-admin' | 'editor' | 'viewer';

export interface JWTPayload {
  userId: string;
  institutionId: string;
  role: UserRole;
  email: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
