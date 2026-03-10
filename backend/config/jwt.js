import jwt from 'jsonwebtoken';
import config from './env.js';

const SECRET = config.JWT.SECRET;

// Generate JWT Token
export function generateToken(userId, email, role) {
  const payload = {
    userId,
    email,
    role,
    iat: Math.floor(Date.now() / 1000)
  };

  return jwt.sign(payload, SECRET, {
    expiresIn: config.JWT.EXPIRATION
  });
}

// Generate Refresh Token
export function generateRefreshToken(userId) {
  const payload = {
    userId,
    type: 'refresh',
    iat: Math.floor(Date.now() / 1000)
  };

  return jwt.sign(payload, SECRET, {
    expiresIn: config.JWT.REFRESH_EXPIRATION
  });
}

// Verify Token
export function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, SECRET);
    return { valid: true, data: decoded };
  } catch (error) {
    return {
      valid: false,
      error: error.message,
      expired: error.name === 'TokenExpiredError'
    };
  }
}

// Decode Token (without verification)
export function decodeToken(token) {
  return jwt.decode(token);
}

export default {
  generateToken,
  generateRefreshToken,
  verifyToken,
  decodeToken
};
