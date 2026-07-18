const tokenUtil = require('../utils/tokenUtil');
const UserRepository = require('../repositories/UserRepository');
const AppError = require('../utils/appError');

const protect = async (req, res, next) => {
  try {
    let token;
    
    // Check Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('You are not logged in. Please log in to access this resource.', 401));
    }

    // Verify token
    let decoded;
    try {
      decoded = tokenUtil.verifyAccessToken(token);
    } catch (err) {
      return next(new AppError('Invalid or expired access token. Please log in again.', 401));
    }

    // Check if user still exists
    const user = await UserRepository.findUserWithRole(decoded.id);
    if (!user) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    // Check if user is suspended
    if (user.status !== 'active') {
      return next(new AppError('Your account is currently inactive or suspended.', 403));
    }

    // Grant access and attach to request
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return next(new AppError('User role not identified.', 403));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }

    next();
  };
};

module.exports = {
  protect,
  restrictTo
};
