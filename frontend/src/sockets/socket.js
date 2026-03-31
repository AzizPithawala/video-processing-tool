import { io } from 'socket.io-client';
import { SOCKET_EVENTS } from '../constants';

let socket = null;

export const connectSocket = (token) => {
  if (socket?.connected) return socket;

  socket = io('/', {
    auth: { token },
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected:', socket.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected:', reason);
  });

  socket.on('connect_error', (err) => {
    console.error('[Socket] Auth error:', err.message);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;

export const onUploadProgress = (callback) => {
  if (socket) socket.on(SOCKET_EVENTS.UPLOAD_PROGRESS, callback);
};

export const onProcessingProgress = (callback) => {
  if (socket) socket.on(SOCKET_EVENTS.PROCESSING_PROGRESS, callback);
};

export const onStatusUpdate = (callback) => {
  if (socket) socket.on(SOCKET_EVENTS.STATUS_UPDATE, callback);
};

export const onSensitivityResult = (callback) => {
  if (socket) socket.on(SOCKET_EVENTS.SENSITIVITY_RESULT, callback);
};

export const removeAllListeners = () => {
  if (socket) {
    socket.off(SOCKET_EVENTS.UPLOAD_PROGRESS);
    socket.off(SOCKET_EVENTS.PROCESSING_PROGRESS);
    socket.off(SOCKET_EVENTS.STATUS_UPDATE);
    socket.off(SOCKET_EVENTS.SENSITIVITY_RESULT);
  }
};
