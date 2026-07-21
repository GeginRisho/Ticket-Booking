import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import Loader from '../components/ui/Loader';
import MainLayout from '../layouts/MainLayout';
const DashboardLayout = lazy(() => import('../layouts/DashboardLayout'));

// Lazy load pages for code splitting & performance optimization
const LandingPage = lazy(() => import('../pages/LandingPage'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const MovieDetails = lazy(() => import('../pages/MovieDetails'));
const MoviesPage = lazy(() => import('../pages/MoviesPage'));
const SearchPage = lazy(() => import('../pages/SearchPage'));
const SeatBooking = lazy(() => import('../pages/SeatBooking'));
const Payment = lazy(() => import('../pages/Payment'));
const DigitalTicket = lazy(() => import('../pages/DigitalTicket'));
const EventDetails = lazy(() => import('../pages/EventDetails'));
const EventsPage = lazy(() => import('../pages/EventsPage'));
const TheatresPage = lazy(() => import('../pages/TheatresPage'));
const TheatreDetails = lazy(() => import('../pages/TheatreDetails'));
const Offers = lazy(() => import('../pages/Offers'));
const About = lazy(() => import('../pages/About'));
const Contact = lazy(() => import('../pages/Contact'));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/ResetPassword'));

// Dashboard lazy loaded views
const AdminDashboard = lazy(() => import('../dashboard/admin/AdminDashboard'));
const SuperAdminDashboard = lazy(() => import('../dashboard/super-admin/SuperAdminDashboard'));
const TheatreOwnerDashboard = lazy(() => import('../dashboard/theatre-owner/TheatreOwnerDashboard'));
const OrganizerDashboard = lazy(() => import('../dashboard/organizer/OrganizerDashboard'));

// Customer lazy loaded views
const MyBookings = lazy(() => import('../pages/MyBookings'));
const BookingHistory = lazy(() => import('../pages/BookingHistory'));
const UserProfile = lazy(() => import('../pages/UserProfile'));

// Error lazy loaded views
const Unauthorized = lazy(() => import('../pages/Unauthorized'));
const NotFound = lazy(() => import('../pages/NotFound'));

const AppRoutes = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader type="spinner" size="lg" />
        </div>
      }
    >
      <Routes>
        {/* Public routes wrapped in MainLayout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/movies" element={<MoviesPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/movie/:id" element={<MovieDetails />} />
          <Route path="/event/:id" element={<EventDetails />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/theatres" element={<TheatresPage />} />
          <Route path="/theatre/:id" element={<TheatreDetails />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          
          {/* Redesigned Standalone Customer Routes */}
          <Route path="/bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><BookingHistory /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
          
          {/* Dashboard route redirects */}
          <Route path="/wishlist" element={<Navigate to="/bookings" replace />} />
          <Route path="/notifications" element={<Navigate to="/bookings" replace />} />
          <Route path="/customer/dashboard" element={<Navigate to="/bookings" replace />} />
          <Route path="/dashboard/customer" element={<Navigate to="/bookings" replace />} />
          <Route path="/dashboard/bookings" element={<Navigate to="/bookings" replace />} />
          <Route path="/dashboard/history" element={<Navigate to="/history" replace />} />
          <Route path="/dashboard/profile" element={<Navigate to="/profile" replace />} />
          <Route path="/dashboard" element={<Navigate to="/bookings" replace />} />
          <Route path="/dashboard/:subtab" element={<Navigate to="/bookings" replace />} />
          <Route path="/dashboard/organizer" element={<Navigate to="/organizer/dashboard" replace />} />
          <Route path="/owner/dashboard" element={<Navigate to="/theatre/dashboard" replace />} />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected Customer checkouts */}
        <Route
          path="/book-seat/:id"
          element={
            <ProtectedRoute requiredRole="Customer">
              <SeatBooking />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment/:id"
          element={
            <ProtectedRoute requiredRole="Customer">
              <Payment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ticket/:id"
          element={
            <ProtectedRoute requiredRole="Customer">
              <DigitalTicket />
            </ProtectedRoute>
          }
        />

        {/* Protected Role-specific Dashboards wrapped in DashboardLayout */}
        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          {/* Admin */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/:subtab" element={<AdminDashboard />} />
          
          {/* Super Admin */}
          <Route
            path="/super-admin/dashboard"
            element={
              <ProtectedRoute requiredRole="Super Admin">
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/super-admin/:subtab"
            element={
              <ProtectedRoute requiredRole="Super Admin">
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          />
          
          {/* Theatre Owner */}
          <Route path="/theatre/dashboard" element={<TheatreOwnerDashboard />} />
          <Route path="/theatre/dashboard/:subtab" element={<TheatreOwnerDashboard />} />
          
          {/* Event Organizer */}
          <Route path="/organizer/dashboard" element={<OrganizerDashboard />} />
          <Route path="/organizer/:subtab" element={<OrganizerDashboard />} />
        </Route>

        {/* Error Fallbacks */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
