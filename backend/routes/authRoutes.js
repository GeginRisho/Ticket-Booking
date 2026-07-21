const express = require('express');
const AuthController = require('../controllers/AuthController');
const { protect } = require('../middlewares/authMiddleware');
const { authLimiter } = require('../middlewares/rateLimitMiddleware');
const {
  registerValidator,
  loginValidator,
  refreshTokenValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  changePasswordValidator,
  updateProfileValidator
} = require('../validators/authValidator');

const router = express.Router();

// Apply auth rate limiting
router.use(authLimiter);

router.post('/register', registerValidator, AuthController.register);
router.post('/login', loginValidator, AuthController.login);
router.post('/logout', AuthController.logout);
router.post('/refresh-token', refreshTokenValidator, AuthController.refreshToken);
router.post('/forgot-password', forgotPasswordValidator, AuthController.forgotPassword);
router.post('/reset-password', resetPasswordValidator, AuthController.resetPassword);

// Protected routes
router.use(protect);

router.get('/me', AuthController.getMe);
router.put('/change-password', changePasswordValidator, AuthController.changePassword);
router.get('/profile', AuthController.getProfile);
router.put('/profile', updateProfileValidator, AuthController.updateProfile);

module.exports = router;
