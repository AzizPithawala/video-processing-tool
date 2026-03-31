export const API_BASE = '/api/v1';

export const VIDEO_STATUS = {
  UPLOADED: 'UPLOADED',
  VALIDATING: 'VALIDATING',
  PROCESSING: 'PROCESSING',
  ANALYZED: 'ANALYZED',
  READY: 'READY',
  FAILED: 'FAILED',
};

export const SENSITIVITY = {
  SAFE: 'SAFE',
  FLAGGED: 'FLAGGED',
};

export const ROLES = {
  VIEWER: 'viewer',
  EDITOR: 'editor',
  ADMIN: 'admin',
};

export const SOCKET_EVENTS = {
  UPLOAD_PROGRESS: 'upload_progress',
  PROCESSING_PROGRESS: 'processing_progress',
  STATUS_UPDATE: 'status_update',
  SENSITIVITY_RESULT: 'sensitivity_result',
};
