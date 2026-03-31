const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
const connectDB = require('./src/config/db');
const env = require('./src/config/env');
const { initializeSocket } = require('./src/sockets/index');
const logger = require('./src/utils/logger');

const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: env.FRONTEND_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

initializeSocket(io);

// Connect to database and start server
const startServer = async () => {
  try {
    await connectDB();

    server.listen(env.PORT, () => {
      logger.info('SERVER_STARTED', { port: env.PORT });
      console.log(`\n🚀 Server running on http://localhost:${env.PORT}`);
      console.log(`📡 Socket.io ready`);
      console.log(`📊 API base: http://localhost:${env.PORT}/api/v1\n`);
    });
  } catch (error) {
    logger.error('SERVER_START_FAILED', { error: error.message });
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM_RECEIVED', {});
  server.close(() => {
    logger.info('SERVER_CLOSED', {});
    process.exit(0);
  });
});

process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED_REJECTION', { error: err.message });
});
