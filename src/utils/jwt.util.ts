import jwt from 'jsonwebtoken';
import env from '../config/env';
import { JWTPayload, AuthTokens } from '../types/auth.types';

export const generateAccessToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, env.jwtSecret as jwt.Secret, {
    expiresIn: env.jwtExpiresIn as any,
  });
};

export const generateRefreshToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, env.jwtRefreshSecret as jwt.Secret, {
    expiresIn: env.jwtRefreshExpiresIn as any,
  });
};

export const generateAuthTokens = (payload: JWTPayload): AuthTokens => {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

export const verifyAccessToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, env.jwtSecret) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
};

export const verifyRefreshToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, env.jwtRefreshSecret) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};
