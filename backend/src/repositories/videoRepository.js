const Video = require('../models/Video');

const videoRepository = {
  create: async (videoData) => {
    const video = new Video(videoData);
    return video.save();
  },

  findById: async (id) => {
    return Video.findById(id);
  },

  findByTenantPaginated: async (tenantId, filters = {}, page = 1, limit = 10) => {
    const query = { tenantId };

    if (filters.status) query.status = filters.status;
    if (filters.sensitivity) query.sensitivity = filters.sensitivity;
    if (filters.userId) query.userId = filters.userId;

    const skip = (page - 1) * limit;

    const [videos, total] = await Promise.all([
      Video.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Video.countDocuments(query),
    ]);

    return {
      videos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  updateStatus: async (id, status) => {
    return Video.findByIdAndUpdate(id, { status }, { new: true });
  },

  updateSensitivity: async (id, sensitivity) => {
    return Video.findByIdAndUpdate(id, { sensitivity }, { new: true });
  },

  updateProcessedPath: async (id, processedPath) => {
    return Video.findByIdAndUpdate(id, { processedPath }, { new: true });
  },

  deleteById: async (id) => {
    return Video.findByIdAndDelete(id);
  },
};

module.exports = videoRepository;
