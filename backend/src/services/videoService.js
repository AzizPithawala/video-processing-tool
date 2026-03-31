const path = require('path');
const fs = require('fs');
const videoRepository = require('../repositories/videoRepository');
const processingService = require('./processingService');
const { VIDEO_STATUS } = require('../constants/videoStatus');
const { ERROR_CODES } = require('../constants/errorCodes');
const { AppError } = require('./authService');
const logger = require('../utils/logger');

const videoService = {
  uploadVideo: async ({ file, title, description, userId, tenantId }) => {
    // Validate file presence
    if (!file) {
      throw new AppError('No file uploaded', ERROR_CODES.INVALID_FILE, 400);
    }

    // Validate title
    if (!title || !title.trim()) {
      throw new AppError('Title is required', ERROR_CODES.VALIDATION_ERROR, 400);
    }

    // Create DB record
    const video = await videoRepository.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      filePath: file.path,
      status: VIDEO_STATUS.UPLOADED,
      userId,
      tenantId,
    });

    logger.info('VIDEO_UPLOADED', { videoId: video._id, userId, title });

    // Trigger processing asynchronously (non-blocking)
    processingService.start(video._id.toString(), tenantId.toString())
      .catch((err) => {
        logger.error('PROCESSING_TRIGGER_FAILED', { videoId: video._id, error: err.message });
      });

    return {
      videoId: video._id,
      status: video.status,
    };
  },

  getVideos: async ({ tenantId, userId, role, filters, page, limit }) => {
    // Validate pagination
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;

    if (page < 1) page = 1;
    if (limit > 50) {
      throw new AppError('Limit cannot exceed 50', ERROR_CODES.INVALID_PAGINATION, 400);
    }
    if (limit < 1) limit = 10;

    const queryFilters = {};
    if (filters.status) queryFilters.status = filters.status;
    if (filters.sensitivity) queryFilters.sensitivity = filters.sensitivity;

    // Viewers and editors see only their own videos unless admin
    if (role !== 'admin') {
      queryFilters.userId = userId;
    }

    const result = await videoRepository.findByTenantPaginated(
      tenantId,
      queryFilters,
      page,
      limit
    );

    return result;
  },

  getVideo: async ({ videoId, tenantId, userId, role }) => {
    const video = await videoRepository.findById(videoId);

    if (!video) {
      throw new AppError('Video not found', ERROR_CODES.VIDEO_NOT_FOUND, 404);
    }

    // Tenant check
    if (video.tenantId.toString() !== tenantId.toString()) {
      throw new AppError('Access denied', ERROR_CODES.FORBIDDEN, 403);
    }

    // Non-admin can only see own videos
    if (role !== 'admin' && video.userId.toString() !== userId.toString()) {
      throw new AppError('Access denied', ERROR_CODES.FORBIDDEN, 403);
    }

    return video;
  },

  deleteVideo: async ({ videoId, tenantId, userId, role }) => {
    const video = await videoRepository.findById(videoId);

    if (!video) {
      throw new AppError('Video not found', ERROR_CODES.VIDEO_NOT_FOUND, 404);
    }

    // Tenant check
    if (video.tenantId.toString() !== tenantId.toString()) {
      throw new AppError('Access denied', ERROR_CODES.FORBIDDEN, 403);
    }

    // Editor can only delete own, admin can delete any
    if (role === 'editor' && video.userId.toString() !== userId.toString()) {
      throw new AppError('Cannot delete other users\' videos', ERROR_CODES.FORBIDDEN, 403);
    }

    // Delete file from disk
    try {
      if (video.filePath && fs.existsSync(video.filePath)) {
        fs.unlinkSync(video.filePath);
      }
      if (video.processedPath && fs.existsSync(video.processedPath)) {
        fs.unlinkSync(video.processedPath);
      }
      // Try to remove the video directory
      const videoDir = path.dirname(video.filePath);
      if (fs.existsSync(videoDir)) {
        fs.rmSync(videoDir, { recursive: true, force: true });
      }
    } catch (err) {
      logger.warn('FILE_DELETE_FAILED', { videoId, error: err.message });
    }

    await videoRepository.deleteById(videoId);

    logger.info('VIDEO_DELETED', { videoId, userId });

    return { videoId };
  },
};

module.exports = videoService;
