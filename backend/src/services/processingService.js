const fs = require('fs');
const path = require('path');
const videoRepository = require('../repositories/videoRepository');
const { VIDEO_STATUS, SENSITIVITY, ALLOWED_TRANSITIONS } = require('../constants/videoStatus');
const { SOCKET_EVENTS } = require('../constants/events');
const { ERROR_CODES } = require('../constants/errorCodes');
const { getIO } = require('../config/socket');
const logger = require('../utils/logger');

const MAX_RETRIES = 3;
const RETRY_BASE_DELAY = 5000; // 5 seconds

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const emitToTenant = (tenantId, event, data) => {
  try {
    const io = getIO();
    io.to(`tenant_${tenantId}`).emit(event, data);
  } catch (err) {
    logger.warn('SOCKET_EMIT_FAILED', { event, error: err.message });
  }
};

const transitionStatus = async (videoId, newStatus, tenantId) => {
  const video = await videoRepository.findById(videoId);
  if (!video) {
    throw new Error(`Video ${videoId} not found`);
  }

  const allowedNext = ALLOWED_TRANSITIONS[video.status];
  if (!allowedNext || !allowedNext.includes(newStatus)) {
    throw new Error(`Invalid transition: ${video.status} → ${newStatus}`);
  }

  await videoRepository.updateStatus(videoId, newStatus);
  logger.info('STATUS_TRANSITION', { videoId, from: video.status, to: newStatus });

  return newStatus;
};

const processingService = {
  start: async (videoId, tenantId, retryCount = 0) => {
    try {
      logger.info('PROCESSING_STARTED', { videoId, attempt: retryCount + 1 });

      // Step 1: VALIDATING
      await transitionStatus(videoId, VIDEO_STATUS.VALIDATING, tenantId);
      emitToTenant(tenantId, SOCKET_EVENTS.PROCESSING_PROGRESS, {
        videoId,
        progress: 10,
        stage: VIDEO_STATUS.VALIDATING,
      });

      // Simulate validation (1.5s)
      await sleep(1500);

      // Validate file integrity
      const video = await videoRepository.findById(videoId);
      if (!video || !video.filePath) {
        throw new Error('File not found for processing');
      }

      if (!fs.existsSync(video.filePath)) {
        throw new Error('Video file missing from disk');
      }

      // Step 2: PROCESSING
      await transitionStatus(videoId, VIDEO_STATUS.PROCESSING, tenantId);
      emitToTenant(tenantId, SOCKET_EVENTS.PROCESSING_PROGRESS, {
        videoId,
        progress: 40,
        stage: VIDEO_STATUS.PROCESSING,
      });

      // Simulate processing (2s)
      await sleep(2000);

      // Step 3: ANALYZED — Sensitivity analysis (simulated)
      await transitionStatus(videoId, VIDEO_STATUS.ANALYZED, tenantId);
      emitToTenant(tenantId, SOCKET_EVENTS.PROCESSING_PROGRESS, {
        videoId,
        progress: 80,
        stage: VIDEO_STATUS.ANALYZED,
      });

      // Simulate analysis (1s)
      await sleep(1000);

      // Determine sensitivity (simulated: random for demo)
      const sensitivityResult = Math.random() > 0.3 ? SENSITIVITY.SAFE : SENSITIVITY.FLAGGED;
      await videoRepository.updateSensitivity(videoId, sensitivityResult);

      // Copy original as processed (simulated processing)
      const processedPath = video.filePath.replace('original', 'processed');
      const processedDir = path.dirname(processedPath);
      if (!fs.existsSync(processedDir)) {
        fs.mkdirSync(processedDir, { recursive: true });
      }
      fs.copyFileSync(video.filePath, processedPath);
      await videoRepository.updateProcessedPath(videoId, processedPath);

      // Step 4: READY
      await transitionStatus(videoId, VIDEO_STATUS.READY, tenantId);

      // Emit final events
      emitToTenant(tenantId, SOCKET_EVENTS.STATUS_UPDATE, {
        videoId,
        status: VIDEO_STATUS.READY,
      });

      emitToTenant(tenantId, SOCKET_EVENTS.SENSITIVITY_RESULT, {
        videoId,
        result: sensitivityResult,
      });

      emitToTenant(tenantId, SOCKET_EVENTS.PROCESSING_PROGRESS, {
        videoId,
        progress: 100,
        stage: 'COMPLETE',
      });

      logger.info('PROCESSING_COMPLETED', { videoId, sensitivity: sensitivityResult });

    } catch (error) {
      logger.error('PROCESSING_ERROR', { videoId, error: error.message, attempt: retryCount + 1 });

      if (retryCount < MAX_RETRIES - 1) {
        const delay = RETRY_BASE_DELAY * (retryCount + 1); // Linear backoff
        logger.info('PROCESSING_RETRY', { videoId, retryIn: delay, attempt: retryCount + 2 });
        await sleep(delay);
        return processingService.start(videoId, tenantId, retryCount + 1);
      }

      // Max retries exhausted → FAILED
      try {
        await videoRepository.updateStatus(videoId, VIDEO_STATUS.FAILED);
        emitToTenant(tenantId, SOCKET_EVENTS.STATUS_UPDATE, {
          videoId,
          status: VIDEO_STATUS.FAILED,
        });
      } catch (failErr) {
        logger.error('FAILED_STATUS_UPDATE_ERROR', { videoId, error: failErr.message });
      }

      logger.error('PROCESSING_FAILED', { videoId });
    }
  },
};

module.exports = processingService;
