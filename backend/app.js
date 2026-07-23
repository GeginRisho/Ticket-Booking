const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const compression = require('compression');
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
const uploadRoutes = require('./routes/uploadRoutes');
const venueRoutes = require('./routes/venueRoutes');
const organizerRoutes = require('./routes/organizerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const cityRoutes = require('./routes/cityRoutes');
const globalErrorHandler = require('./middlewares/errorMiddleware');
const AppError = require('./utils/appError');
require('dotenv').config();

const app = express();

// Trust proxy for Render reverse proxy support (required by express-rate-limit)
app.set('trust proxy', 1);

// --- Global Middlewares ---
app.use(compression());
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, postman, curl)
    if (!origin) return callback(null, true);

    const allowedOrigins = process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
      : [];

    const isLocal = origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:');
    const isVercel = origin.endsWith('.vercel.app') || /vercel\.app$/.test(origin);
    const isExplicit = allowedOrigins.includes('*') || allowedOrigins.includes(origin);

    if (isLocal || isVercel || isExplicit || allowedOrigins.length === 0) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api', reviewRoutes);
app.use('/api', cityRoutes);
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
app.use('/api', uploadRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/organizer', organizerRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'System is healthy',
    timestamp: new Date()
  });
});


app.get('/api/diag', async (req, res, next) => {
  try {
    const { User, Role, City } = require('./models');
    const bcrypt = require('bcrypt');

    // 1. Seed Roles
    const roles = [
      { id: '11111111-1111-1111-1111-111111111111', role_name: 'Admin' },
      { id: '22222222-2222-2222-2222-222222222222', role_name: 'Customer' },
      { id: '33333333-3333-3333-3333-333333333333', role_name: 'Theatre Owner' },
      { id: '44444444-4444-4444-4444-444444444444', role_name: 'Event Organizer' },
      { id: '55555555-5555-5555-5555-555555555555', role_name: 'Super Admin' }
    ];
    for (const r of roles) {
      await Role.findOrCreate({ where: { id: r.id }, defaults: r });
    }

    // 2. Seed default City if needed
    let city = await City.findOne();
    if (!city) {
      city = await City.create({
        id: 'a3333333-3333-3333-3333-333333333333',
        city_name: 'Bangalore',
        state: 'Karnataka',
        country: 'India',
        status: 'active'
      });
    }

    // 3. Create/Update organizer@ticketshow.com
    const hashOrganizer = await bcrypt.hash('Organizer@123', 12);
    const [orgUser, orgCreated] = await User.findOrCreate({
      where: { email: 'organizer@ticketshow.com' },
      defaults: {
        id: 'd4444444-4444-4444-4444-444444444444',
        full_name: 'Showstar Organizers',
        phone: '+919876543213',
        password_hash: hashOrganizer,
        role_id: '44444444-4444-4444-4444-444444444444',
        city_id: city.id,
        status: 'active',
        email_verified: true,
        phone_verified: true,
        company_name: 'Showstar Entertainment Pvt Ltd',
        gst_number: '27AABCU9603R1ZN',
        pan_number: 'AABCU9603R',
        business_license: 'LIC-2026-ORGANIZER'
      }
    });

    if (!orgCreated) {
      await orgUser.update({
        password_hash: hashOrganizer,
        role_id: '44444444-4444-4444-4444-444444444444',
        status: 'active',
        company_name: 'Showstar Entertainment Pvt Ltd',
        gst_number: '27AABCU9603R1ZN',
        pan_number: 'AABCU9603R',
        business_license: 'LIC-2026-ORGANIZER'
      });
    }

    // 4. Create/Update admin@ticketshow.com
    const hashAdmin = await bcrypt.hash('Admin@123', 12);
    const [adminUser, adminCreated] = await User.findOrCreate({
      where: { email: 'admin@ticketshow.com' },
      defaults: {
        id: 'd1111111-1111-1111-1111-111111111111',
        full_name: 'Admin User',
        phone: '+919876543211',
        password_hash: hashAdmin,
        role_id: '11111111-1111-1111-1111-111111111111',
        city_id: city.id,
        status: 'active',
        email_verified: true,
        phone_verified: true
      }
    });
    if (!adminCreated) {
      await adminUser.update({
        password_hash: hashAdmin,
        role_id: '11111111-1111-1111-1111-111111111111',
        status: 'active'
      });
    }

    // 5. Create/Update superadmin@ticketshow.com
    const hashSuper = await bcrypt.hash('Admin@123', 12);
    const [superUser, superCreated] = await User.findOrCreate({
      where: { email: 'superadmin@ticketshow.com' },
      defaults: {
        id: 'd5555555-5555-5555-5555-555555555555',
        full_name: 'Super Admin',
        phone: '+919876543215',
        password_hash: hashSuper,
        role_id: '55555555-5555-5555-5555-555555555555',
        city_id: city.id,
        status: 'active',
        email_verified: true,
        phone_verified: true
      }
    });
    if (!superCreated) {
      await superUser.update({
        password_hash: hashSuper,
        role_id: '55555555-5555-5555-5555-555555555555',
        status: 'active'
      });
    }

    // 6. Create/Update owner@ticketshow.com
    const hashOwner = await bcrypt.hash('Owner@123', 12);
    const [ownerUser, ownerCreated] = await User.findOrCreate({
      where: { email: 'owner@ticketshow.com' },
      defaults: {
        id: 'd3333333-3333-3333-3333-333333333333',
        full_name: 'Theatre Owner',
        phone: '+919876543212',
        password_hash: hashOwner,
        role_id: '33333333-3333-3333-3333-333333333333',
        city_id: city.id,
        status: 'active',
        email_verified: true,
        phone_verified: true
      }
    });
    if (!ownerCreated) {
      await ownerUser.update({
        password_hash: hashOwner,
        role_id: '33333333-3333-3333-3333-333333333333',
        status: 'active'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Database seeded and verified on production successfully!',
      databaseUrl: process.env.DATABASE_URL ? 'PRESENT (Neon/Render)' : 'LOCAL/NOT SET'
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
      stack: err.stack
    });
  }
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
