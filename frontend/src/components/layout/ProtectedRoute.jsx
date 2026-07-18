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
    if (typeof u.role === 'object' && u.role !== null) {
      return u.role.role_name || u.role.name;
    }
    return u.role;
  };

  const userRole = getNormalizedRole(user);

  if (requiredRole && userRole !== requiredRole && userRole !== 'Super Admin') {
    // Redirect to unauthorized 403 fallback route
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
