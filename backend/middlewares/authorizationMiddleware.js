export function authorizationMiddleware(allowedRoles = []) {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'User not authenticated',
          code: 'NOT_AUTHENTICATED'
        });
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          error: 'Insufficient permissions',
          code: 'INSUFFICIENT_PERMISSIONS'
        });
      }

      next();
    } catch (error) {
      res.status(500).json({
        error: 'Authorization error',
        code: 'AUTHORIZATION_ERROR'
      });
    }
  };
}

export default authorizationMiddleware;
