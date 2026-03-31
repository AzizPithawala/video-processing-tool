const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { ERROR_CODES } = require('../constants/errorCodes');
const { error } = require('../utils/responseFormatter');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    let token;

    // Primary: Authorization header
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
    // Fallback: query parameter (for video streaming where HTML5 video can't send headers)
    else if (req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return error(res, 'No token provided', ERROR_CODES.UNAUTHORIZED, 401);
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      role: decoded.role,
      tenantId: decoded.tenantId,
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return error(res, 'Token expired', ERROR_CODES.TOKEN_EXPIRED, 401);
    }
    return error(res, 'Invalid token', ERROR_CODES.INVALID_TOKEN, 401);
  }
};

module.exports = authMiddleware;
