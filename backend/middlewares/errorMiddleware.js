const AppError = require('../utils/appError');

const handleSequelizeValidationError = (err) => {
  const messages = err.errors.map(el => el.message);
  return new AppError(`Invalid input data: ${messages.join('. ')}`, 400);
};

const handleSequelizeUniqueConstraintError = (err) => {
  const fields = Object.keys(err.fields || {}).join(', ');
  return new AppError(`Duplicate field value: ${fields || 'unique constraint violation'}. Please use another value!`, 400);
};

const handleJWTError = () => new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () => new AppError('Your token has expired! Please log in again.', 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode || 500).json({
    status: err.status || 'error',
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode || 500).json({
      status: err.status || 'error',
      message: err.message
    });
  } else {
    // Programming or other unknown error: don't leak error details
    console.error('ERROR 💥', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!'
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = Object.assign(err);
    
    if (error.name === 'SequelizeValidationError') error = handleSequelizeValidationError(error);
    if (error.name === 'SequelizeUniqueConstraintError') error = handleSequelizeUniqueConstraintError(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};
