const { body, query, validationResult } = require('express-validator');
const AppError = require('../utils/appError');

const validateResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMsgs = errors.array().map(err => err.msg).join('. ');
    return next(new AppError(errorMsgs, 400));
  }
  next();
};

const registerValidator = [
  body('full_name')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Full name must be between 2 and 100 characters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^(?:\+91|91)?[6-9]\d{9}$/).withMessage('Please provide a valid 10-digit mobile number'),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .withMessage('Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character'),
  
  body('role_name')
    .optional()
    .isIn(['Customer', 'Theatre Owner', 'Event Organizer', 'Admin', 'Super Admin']).withMessage('Invalid role specified'),
  
  body('city_id')
    .optional()
    .isUUID().withMessage('Please select a valid city'),
    
  validateResult
];

const loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty().withMessage('Password is required'),
    
  validateResult
];

const refreshTokenValidator = [
  body('refreshToken')
    .notEmpty().withMessage('Refresh token is required'),
    
  validateResult
];

const forgotPasswordValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address'),
    
  validateResult
];

const resetPasswordValidator = [
  body('token')
    .notEmpty().withMessage('Reset token is required'),
  
  body('password')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    
  validateResult
];

const changePasswordValidator = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),
  
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    
  validateResult
];

const updateProfileValidator = [
  body('full_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Full name must be between 2 and 100 characters'),
  
  body('profile_image')
    .optional()
    .trim()
    .isURL().withMessage('Profile image must be a valid URL'),
  
  body('city_id')
    .optional()
    .isUUID().withMessage('Please select a valid city'),
    
  validateResult
];

const registerOrganizerValidator = [
  body('fullName')
    .trim()
    .notEmpty().withMessage('Organizer name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Organizer name must be between 2 and 100 characters'),
  
  body('companyName')
    .trim()
    .notEmpty().withMessage('Company name is required'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^(?:\+91|91)?[6-9]\d{9}$/).withMessage('Please provide a valid 10-digit mobile number'),
  
  body('cityId')
    .notEmpty().withMessage('City location is required')
    .isUUID().withMessage('Please select a valid city'),

  body('address')
    .trim()
    .notEmpty().withMessage('Address is required'),

  body('gstNumber')
    .trim()
    .notEmpty().withMessage('GST number is required')
    .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/).withMessage('Please provide a valid GST number format'),

  body('panNumber')
    .trim()
    .notEmpty().withMessage('PAN number is required')
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).withMessage('Please provide a valid PAN number format'),

  body('businessLicense')
    .trim()
    .notEmpty().withMessage('Business license number is required'),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .withMessage('Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character'),
    
  validateResult
];

module.exports = {
  registerValidator,
  loginValidator,
  refreshTokenValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  changePasswordValidator,
  updateProfileValidator,
  registerOrganizerValidator
};
