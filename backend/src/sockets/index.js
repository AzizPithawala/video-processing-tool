const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { setIO } = require('../config/socket');
const logger = require('../utils/logger');

const initializeSocket = (io) => {
  setIO(io);

  // Authentication middleware for socket connections
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, env.JWT_SECRET);
      socket.user = {
        id: decoded.id,
        role: decoded.role,
        tenantId: decoded.tenantId,
      };

      next();
    } catch (err) {
      logger.warn('SOCKET_AUTH_FAILED', { error: err.message });
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const { id, role, tenantId } = socket.user;

    logger.info('SOCKET_CONNECTED', { userId: id, tenantId });

    // Join tenant room for scoped events
    socket.join(`tenant_${tenantId}`);

    // Handle re-subscription after reconnect
    socket.on('resubscribe', async (data) => {
      logger.info('SOCKET_RESUBSCRIBE', { userId: id, videoIds: data?.videoIds });
      // Client should fetch latest state via API
      // Socket continues from current state
    });

    socket.on('disconnect', (reason) => {
      logger.info('SOCKET_DISCONNECTED', { userId: id, reason });
    });

    socket.on('error', (err) => {
      logger.error('SOCKET_ERROR', { userId: id, error: err.message });
    });
  });

  logger.info('SOCKET_INITIALIZED', {});
};

module.exports = { initializeSocket };
