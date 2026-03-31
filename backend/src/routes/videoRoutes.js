const express = require('express');
const videoController = require('../controllers/videoController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { createUploadMiddleware } = require('../utils/upload');
const { ROLES } = require('../constants/roles');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// POST /api/v1/videos/upload — Editor and Admin only
router.post(
  '/upload',
  roleMiddleware(ROLES.EDITOR, ROLES.ADMIN),
  createUploadMiddleware(),
  videoController.upload
);

// GET /api/v1/videos — All authenticated users
router.get('/', videoController.getAll);

// GET /api/v1/videos/stream/:videoId — All authenticated users
router.get('/stream/:videoId', videoController.stream);

// GET /api/v1/videos/:videoId — All authenticated users
router.get('/:videoId', videoController.getOne);

// DELETE /api/v1/videos/:videoId — Editor (own) and Admin (any)
router.delete(
  '/:videoId',
  roleMiddleware(ROLES.EDITOR, ROLES.ADMIN),
  videoController.delete
);

module.exports = router;
