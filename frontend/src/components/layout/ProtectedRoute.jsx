import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loader from '../ui/Loader';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader type="spinner" size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const getNormalizedRole = (u) => {
    if (!u) return null;
    let r = null;
    if (typeof u.role === 'object' && u.role !== null) {
      r = u.role.role_name || u.role.name;
    } else {
      r = u.role;
    }
    if (r === 'Owner') return 'Theatre Owner';
    if (r === 'Organizer') return 'Event Organizer';
    return r;
  };

  const userRole = getNormalizedRole(user);

  if (requiredRole && userRole !== requiredRole && userRole !== 'Super Admin') {
    // Redirect to unauthorized 403 fallback route
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
