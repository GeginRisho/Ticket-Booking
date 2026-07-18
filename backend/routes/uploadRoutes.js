const express = require('express');
const multer = require('multer');
const uploadController = require('../controllers/uploadController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

router.post('/upload', protect, upload.single('file'), uploadController.uploadFile);

module.exports = router;
