const logger = require('../utils/logger');

const errorMiddleware = (err, req, res, next) => {
  logger.error('UNHANDLED_ERROR', {
    message: err.message,
    code: err.code,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  const statusCode = err.statusCode || 500;
  const code = err.code || 'SERVER_ERROR';
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    code,
  });
};

module.exports = errorMiddleware;
