import jwt, { SignOptions } from 'jsonwebtoken';

interface TokenPayload {
  userId: number;
  email: string;
  role: string;
}

export const generateToken = (payload: TokenPayload): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  
  const options: SignOptions = {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  } as SignOptions;
  
  return jwt.sign(payload, process.env.JWT_SECRET, options);
};

export const verifyToken = (token: string): TokenPayload => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  
  return jwt.verify(token, process.env.JWT_SECRET) as TokenPayload;
};