const fs = require('fs');
const path = require('path');
const videoRepository = require('../repositories/videoRepository');
const { VIDEO_STATUS } = require('../constants/videoStatus');
const { ERROR_CODES } = require('../constants/errorCodes');
const { AppError } = require('./authService');
const logger = require('../utils/logger');

const streamService = {
  streamVideo: async (req, res, { videoId, tenantId, userId, role }) => {
    const video = await videoRepository.findById(videoId);

    if (!video) {
      throw new AppError('Video not found', ERROR_CODES.VIDEO_NOT_FOUND, 404);
    }

    // Tenant check
    if (video.tenantId.toString() !== tenantId.toString()) {
      throw new AppError('Access denied', ERROR_CODES.FORBIDDEN, 403);
    }

    // Non-admin can only stream own videos
    if (role !== 'admin' && video.userId.toString() !== userId.toString()) {
      throw new AppError('Access denied', ERROR_CODES.FORBIDDEN, 403);
    }

    // Status check — only READY videos can be streamed
    if (video.status !== VIDEO_STATUS.READY) {
      throw new AppError('Video is not ready for streaming', ERROR_CODES.STREAM_NOT_ALLOWED, 403);
    }

    // Determine which file to stream (prefer processed, fallback to original)
    const filePath = video.processedPath || video.filePath;

    if (!filePath || !fs.existsSync(filePath)) {
      throw new AppError('Video file not found', ERROR_CODES.FILE_NOT_FOUND, 404);
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    // Determine content type based on extension
    const ext = path.extname(filePath).toLowerCase();
    const contentTypes = {
      '.mp4': 'video/mp4',
      '.mov': 'video/quicktime',
      '.avi': 'video/x-msvideo',
    };
    const contentType = contentTypes[ext] || 'video/mp4';

    if (range) {
      // Parse range header
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize || end >= fileSize || start > end) {
        res.status(416).json({
          success: false,
          message: 'Requested range not satisfiable',
          code: ERROR_CODES.INVALID_RANGE,
        });
        return;
      }

      const chunkSize = end - start + 1;
      const fileStream = fs.createReadStream(filePath, { start, end });

      logger.info('STREAM_CHUNK', { videoId, start, end, chunkSize });

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': contentType,
      });

      fileStream.pipe(res);
    } else {
      // No range header, stream entire file
      logger.info('STREAM_FULL', { videoId, fileSize });

      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
      });

      fs.createReadStream(filePath).pipe(res);
    }
  },
};

module.exports = streamService;
