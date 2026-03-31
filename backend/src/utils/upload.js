const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const env = require('../config/env');
const { ERROR_CODES } = require('../constants/errorCodes');

const ALLOWED_MIMETYPES = [
  'video/mp4',
  'video/quicktime',    // .mov
  'video/x-msvideo',    // .avi
];

const ALLOWED_EXTENSIONS = ['.mp4', '.mov', '.avi'];

const createStorage = () => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const videoId = uuidv4();
      req.videoId = videoId;

      const uploadDir = path.join(
        env.STORAGE_PATH,
        req.user.tenantId.toString(),
        req.user.id.toString(),
        videoId
      );

      fs.mkdirSync(uploadDir, { recursive: true });
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `original${ext}`);
    },
  });
};

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (!ALLOWED_MIMETYPES.includes(file.mimetype) || !ALLOWED_EXTENSIONS.includes(ext)) {
    const error = new Error('Invalid file type. Allowed: mp4, mov, avi');
    error.code = ERROR_CODES.INVALID_FILE;
    error.statusCode = 400;
    return cb(error, false);
  }

  cb(null, true);
};

const createUploadMiddleware = () => {
  const upload = multer({
    storage: createStorage(),
    fileFilter,
    limits: {
      fileSize: env.MAX_FILE_SIZE,
    },
  });

  return (req, res, next) => {
    upload.single('file')(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: `File size exceeds limit of ${env.MAX_FILE_SIZE / (1024 * 1024)}MB`,
            code: ERROR_CODES.INVALID_FILE,
          });
        }
        if (err.code === ERROR_CODES.INVALID_FILE) {
          return res.status(400).json({
            success: false,
            message: err.message,
            code: ERROR_CODES.INVALID_FILE,
          });
        }
        return res.status(500).json({
          success: false,
          message: 'Upload failed',
          code: 'SERVER_ERROR',
        });
      }
      next();
    });
  };
};

module.exports = { createUploadMiddleware };
