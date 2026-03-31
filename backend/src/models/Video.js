const mongoose = require('mongoose');
const { VIDEO_STATUS, SENSITIVITY } = require('../constants/videoStatus');

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
    trim: true,
  },
  filePath: {
    type: String,
    required: [true, 'File path is required'],
  },
  processedPath: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: Object.values(VIDEO_STATUS),
    default: VIDEO_STATUS.UPLOADED,
  },
  sensitivity: {
    type: String,
    enum: [...Object.values(SENSITIVITY), null],
    default: null,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
  },
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: [true, 'Tenant ID is required'],
  },
}, {
  timestamps: true,
});

videoSchema.index({ userId: 1 });
videoSchema.index({ tenantId: 1 });
videoSchema.index({ status: 1 });

module.exports = mongoose.model('Video', videoSchema);
