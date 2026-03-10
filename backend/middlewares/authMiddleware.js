import { verifyToken } from '../config/jwt.js';

export function authMiddleware(req, res, next) {
  try {
    let token = null;

    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers['authorization']) {
      token = req.headers['authorization'].split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        error: 'Authentication required. Token missing.',
        code: 'NO_TOKEN'
      });
    }

    const { valid, data, expired } = verifyToken(token);

    if (!valid) {
      return res.status(expired ? 401 : 403).json({
        error: expired ? 'Token expired' : 'Invalid token',
        code: expired ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN'
      });
    }

    // Attach user info to request
    req.user = {
      userId: data.userId,
      email: data.email,
      role: data.role
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      error: 'Authentication error',
      code: 'AUTH_ERROR'
    });
  }
}

export default authMiddleware;
