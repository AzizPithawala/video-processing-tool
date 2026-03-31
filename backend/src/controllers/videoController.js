const videoService = require('../services/videoService');
const streamService = require('../services/streamService');
const { success, error } = require('../utils/responseFormatter');

const videoController = {
  upload: async (req, res, next) => {
    try {
      const result = await videoService.uploadVideo({
        file: req.file,
        title: req.body.title,
        description: req.body.description,
        userId: req.user.id,
        tenantId: req.user.tenantId,
      });

      return success(res, result, 'Video uploaded successfully', 201);
    } catch (err) {
      next(err);
    }
  },

  getAll: async (req, res, next) => {
    try {
      const { status, sensitivity, page, limit } = req.query;

      const result = await videoService.getVideos({
        tenantId: req.user.tenantId,
        userId: req.user.id,
        role: req.user.role,
        filters: { status, sensitivity },
        page,
        limit,
      });

      return success(res, result);
    } catch (err) {
      next(err);
    }
  },

  getOne: async (req, res, next) => {
    try {
      const video = await videoService.getVideo({
        videoId: req.params.videoId,
        tenantId: req.user.tenantId,
        userId: req.user.id,
        role: req.user.role,
      });

      return success(res, video);
    } catch (err) {
      next(err);
    }
  },

  delete: async (req, res, next) => {
    try {
      const result = await videoService.deleteVideo({
        videoId: req.params.videoId,
        tenantId: req.user.tenantId,
        userId: req.user.id,
        role: req.user.role,
      });

      return success(res, result, 'Video deleted successfully');
    } catch (err) {
      next(err);
    }
  },

  stream: async (req, res, next) => {
    try {
      await streamService.streamVideo(req, res, {
        videoId: req.params.videoId,
        tenantId: req.user.tenantId,
        userId: req.user.id,
        role: req.user.role,
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = videoController;
