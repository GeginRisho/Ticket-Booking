const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const movieRoutes = require('./routes/movieRoutes');
const theatreRoutes = require('./routes/theatreRoutes');
const screenRoutes = require('./routes/screenRoutes');
const showRoutes = require('./routes/showRoutes');
const eventRoutes = require('./routes/eventRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const couponRoutes = require('./routes/couponRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const globalErrorHandler = require('./middlewares/errorMiddleware');
const AppError = require('./utils/appError');
require('dotenv').config();

const app = express();

// --- Global Security Middlewares ---
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api', reviewRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/theatres', theatreRoutes);
app.use('/api', screenRoutes);
app.use('/api/shows', showRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'System is healthy',
    timestamp: new Date()
  });
});

// Swagger documentation endpoint (mock redirect to public hosted / local static)
app.get('/docs', (req, res) => {
  res.sendFile(require('path').join(__dirname, 'swagger.json'));
});

// Handle unhandled routes
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Centralized error handler middleware
app.use(globalErrorHandler);

module.exports = app;
