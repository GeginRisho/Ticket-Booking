const AuthService = require('../services/AuthService');

class AuthController {
  async register(req, res, next) {
    try {
      const user = await AuthService.register(req.body);
      res.status(201).json({
        status: 'success',
        message: 'Registration successful',
        data: { user }
      });
    } catch (err) {
      next(err);
    }
  }

  async registerOrganizer(req, res, next) {
    try {
      const user = await AuthService.registerOrganizer(req.body);
      res.status(201).json({
        status: 'success',
        message: 'Registration request submitted for approval',
        data: { user }
      });
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const { user, accessToken, refreshToken } = await AuthService.login(email, password);
      
      // Store refreshToken in secure HTTP-only cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.status(200).json({
        status: 'success',
        message: 'Login successful',
        token: accessToken,
        user,
        role: user.role,
        data: {
          user,
          accessToken,
          refreshToken // optionally return in body for mobile/testing clients
        }
      });
    } catch (err) {
      next(err);
    }
  }

  async logout(req, res, next) {
    try {
      const token = req.body.refreshToken || req.cookies?.refreshToken;
      await AuthService.logout(token);
      res.clearCookie('refreshToken');
      
      res.status(200).json({
        status: 'success',
        message: 'Logged out successfully'
      });
    } catch (err) {
      next(err);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const token = req.body.refreshToken || req.cookies?.refreshToken;
      const tokens = await AuthService.refreshToken(token);
      
      // Update cookie
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      res.status(200).json({
        status: 'success',
        message: 'Token refreshed successfully',
        data: tokens
      });
    } catch (err) {
      next(err);
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      const result = await AuthService.forgotPassword(email);
      res.status(200).json({
        status: 'success',
        message: result.message,
        // In real env, don't return resetToken. We do it here for validation ease.
        token: result.resetToken
      });
    } catch (err) {
      next(err);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { token, password } = req.body;
      const result = await AuthService.resetPassword(token, password);
      res.status(200).json({
        status: 'success',
        message: result.message
      });
    } catch (err) {
      next(err);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const result = await AuthService.changePassword(req.user.id, currentPassword, newPassword);
      res.status(200).json({
        status: 'success',
        message: result.message
      });
    } catch (err) {
      next(err);
    }
  }

  async getProfile(req, res, next) {
    try {
      const user = await AuthService.getProfile(req.user.id);
      res.status(200).json({
        status: 'success',
        data: { user }
      });
    } catch (err) {
      next(err);
    }
  }

  async getMe(req, res, next) {
    try {
      const user = await AuthService.getProfile(req.user.id);
      res.status(200).json({
        status: 'success',
        user,
        role: user.role,
        profile: user
      });
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const user = await AuthService.updateProfile(req.user.id, req.body);
      res.status(200).json({
        status: 'success',
        message: 'Profile updated successfully',
        data: { user }
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
