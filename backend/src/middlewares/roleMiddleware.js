const { ERROR_CODES } = require('../constants/errorCodes');
const { error } = require('../utils/responseFormatter');

const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return error(res, 'Authentication required', ERROR_CODES.UNAUTHORIZED, 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return error(res, 'Insufficient permissions', ERROR_CODES.FORBIDDEN, 403);
    }

    next();
  };
};

module.exports = roleMiddleware;
