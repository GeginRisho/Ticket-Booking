import React from 'react';
import { Link } from 'react-router-dom';
import { FiCompass } from 'react-icons/fi';
import Button from '../components/ui/Button';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center">
      <div className="w-20 h-20 bg-hover-bg rounded-full flex items-center justify-center text-primary mb-6">
        <FiCompass size={40} className="animate-spin" style={{ animationDuration: '6s' }} />
      </div>
      <h1 className="text-4xl font-extrabold text-text-primary tracking-tight sm:text-5xl mb-3">
        404 - Page Not Found
      </h1>
      <p className="text-base text-text-secondary max-w-md mb-8">
        We couldn't find the page you were looking for. It might have been moved or deleted.
      </p>
      <Link to="/">
        <Button variant="primary">Return Home</Button>
      </Link>
    </div>
  );
};

export default NotFound;
