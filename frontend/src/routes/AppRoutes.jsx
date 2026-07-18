import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import Loader from '../components/ui/Loader';

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

// Dashboard lazy loaded views
const AdminDashboard = lazy(() => import('../dashboard/admin/AdminDashboard'));
const CustomerDashboard = lazy(() => import('../dashboard/customer/CustomerDashboard'));
const TheatreOwnerDashboard = lazy(() => import('../dashboard/theatre-owner/TheatreOwnerDashboard'));
const OrganizerDashboard = lazy(() => import('../dashboard/organizer/OrganizerDashboard'));

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
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/movies" element={<MoviesPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/movie/:id" element={<MovieDetails />} />
        <Route path="/event/:id" element={<EventDetails />} />

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

        {/* Protected Role-specific Dashboards */}
        <Route
          path="/dashboard/admin/*"
          element={
            <ProtectedRoute requiredRole="Admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/customer/*"
          element={
            <ProtectedRoute requiredRole="Customer">
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/theatre-owner/*"
          element={
            <ProtectedRoute requiredRole="Theatre Owner">
              <TheatreOwnerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/organizer/*"
          element={
            <ProtectedRoute requiredRole="Event Organizer">
              <OrganizerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Error Fallbacks */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
