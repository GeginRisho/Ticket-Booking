const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { Op } = require('sequelize');
const UserRepository = require('../repositories/UserRepository');
const RoleRepository = require('../repositories/RoleRepository');
const CityRepository = require('../repositories/CityRepository');
const { User, Role, City, UserRefreshToken } = require('../models');
const AppError = require('../utils/appError');
const tokenUtil = require('../utils/tokenUtil');

class AuthService {
  async register(data) {
    const { full_name, email, phone, password, role_name, city_id } = data;

    // Check if email or phone already exists
    const existingEmail = await UserRepository.findByEmail(email);
    if (existingEmail) {
      throw new AppError('Email is already registered', 400);
    }

    const existingPhone = await UserRepository.findByPhone(phone);
    if (existingPhone) {
      throw new AppError('Phone number is already registered', 400);
    }

    // Resolve Role
    const role = await RoleRepository.findByName(role_name || 'Customer');
    if (!role) {
      throw new AppError('Invalid role specified', 400);
    }

    // Validate City if provided
    if (city_id) {
      const city = await CityRepository.findById(city_id);
      if (!city) {
        throw new AppError('Invalid city specified', 400);
      }
    }

    // Hash password with 12 rounds
    const password_hash = await bcrypt.hash(password, 12);

    // Create User
    const user = await UserRepository.create({
      full_name,
      email,
      phone,
      password_hash,
      role_id: role.id,
      city_id: city_id || null,
      status: 'active',
      email_verified: false,
      phone_verified: false
    });

    const userWithAssoc = await UserRepository.findUserWithRole(user.id);
    return this._formatUserResponse(userWithAssoc);
  }

  async login(email, password) {
    const user = await UserRepository.findOne({
      where: { email },
      include: [
        { model: Role, as: 'role' },
        { model: City, as: 'city' }
      ]
    });

    if (!user || user.status === 'suspended') {
      throw new AppError('Invalid email or password', 401);
    }

    // Compare Password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    // Update last login
    await user.update({ last_login: new Date() });

    // Generate Tokens
    const tokenPayload = { id: user.id, email: user.email, role: user.role.role_name };
    const accessToken = tokenUtil.signAccessToken(tokenPayload);
    const refreshToken = tokenUtil.signRefreshToken({ id: user.id });

    // Store Refresh Token securely
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7); // 7 days

    await UserRefreshToken.create({
      user_id: user.id,
      token: refreshToken,
      expires_at: expiryDate
    });

    return {
      user: this._formatUserResponse(user),
      accessToken,
      refreshToken
    };
  }

  async logout(refreshToken) {
    if (!refreshToken) return;
    // Remove refresh token from database
    await UserRefreshToken.destroy({ where: { token: refreshToken } });
  }

  async refreshToken(refreshToken) {
    if (!refreshToken) {
      throw new AppError('Refresh token is required', 400);
    }

    // Verify token structure & expiry
    let decoded;
    try {
      decoded = tokenUtil.verifyRefreshToken(refreshToken);
    } catch (err) {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    // Find token in DB
    const storedToken = await UserRefreshToken.findOne({
      where: { token: refreshToken, user_id: decoded.id }
    });

    if (!storedToken || storedToken.expires_at < new Date()) {
      // Revoke all tokens for this user as a precaution
      if (storedToken) {
        await UserRefreshToken.destroy({ where: { user_id: decoded.id } });
      }
      throw new AppError('Invalid or expired refresh token session', 401);
    }

    // Remove old refresh token (rotation)
    await storedToken.destroy();

    // Fetch user
    const user = await UserRepository.findUserWithRole(decoded.id);
    if (!user || user.status !== 'active') {
      throw new AppError('User not found or suspended', 401);
    }

    // Generate new pair
    const tokenPayload = { id: user.id, email: user.email, role: user.role.role_name };
    const newAccessToken = tokenUtil.signAccessToken(tokenPayload);
    const newRefreshToken = tokenUtil.signRefreshToken({ id: user.id });

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);

    await UserRefreshToken.create({
      user_id: user.id,
      token: newRefreshToken,
      expires_at: expiryDate
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  }

  async forgotPassword(email) {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      // Return success anyway to prevent user enumeration
      return { message: 'If that email exists, we have sent a reset code.' };
    }

    // Generate a temporary reset JWT token (expires in 15 mins)
    const resetToken = jwtSignForgotPasswordToken(user.id);
    
    // In production, send email. Here, we log it and return it in response for API verification.
    console.log(`[PASSWORD RESET LINK]: /api/auth/reset-password?token=${resetToken}`);

    return {
      message: 'Password reset link generated successfully (check server logs/response)',
      resetToken
    };
  }

  async resetPassword(token, newPassword) {
    let decoded;
    try {
      decoded = tokenUtil.verifyAccessToken(token); // use access key for short term resets
    } catch (err) {
      throw new AppError('Invalid or expired password reset token', 400);
    }

    const user = await UserRepository.findById(decoded.id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Hash and update
    const password_hash = await bcrypt.hash(newPassword, 12);
    await user.update({ password_hash });

    // Revoke all existing refresh tokens for this user
    await UserRefreshToken.destroy({ where: { user_id: user.id } });

    return { message: 'Password has been reset successfully' };
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      throw new AppError('Incorrect current password', 400);
    }

    const password_hash = await bcrypt.hash(newPassword, 12);
    await user.update({ password_hash });

    return { message: 'Password changed successfully' };
  }

  async getProfile(userId) {
    const user = await UserRepository.findUserWithRole(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return this._formatUserResponse(user);
  }

  async updateProfile(userId, updateData) {
    const { full_name, profile_image, city_id } = updateData;

    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (city_id) {
      const city = await CityRepository.findById(city_id);
      if (!city) {
        throw new AppError('Invalid city id', 400);
      }
    }

    await user.update({
      full_name: full_name || user.full_name,
      profile_image: profile_image || user.profile_image,
      city_id: city_id !== undefined ? city_id : user.city_id
    });

    const updatedUser = await UserRepository.findUserWithRole(userId);
    return this._formatUserResponse(updatedUser);
  }

  _formatUserResponse(user) {
    return {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      profile_image: user.profile_image,
      role: user.role ? user.role.role_name : null,
      city: user.city ? { id: user.city.id, name: user.city.city_name } : null,
      status: user.status,
      email_verified: user.email_verified,
      phone_verified: user.phone_verified,
      last_login: user.last_login,
      created_at: user.created_at,
      updated_at: user.updated_at
    };
  }
}

// Helpers
const jwt = require('jsonwebtoken');
function jwtSignForgotPasswordToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '15m' });
}

module.exports = new AuthService();
