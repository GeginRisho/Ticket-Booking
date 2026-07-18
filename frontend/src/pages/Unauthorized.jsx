import React from 'react';
import { Link } from 'react-router-dom';
import { FiShield } from 'react-icons/fi';
import Button from '../components/ui/Button';

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center">
      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-danger mb-6 animate-pulse">
        <FiShield size={40} />
      </div>
      <h1 className="text-4xl font-extrabold text-text-primary tracking-tight sm:text-5xl mb-3">
        403 - Access Denied
      </h1>
      <p className="text-base text-text-secondary max-w-md mb-8">
        You do not have the permissions required to view this dashboard page. Please sign in with a different account.
      </p>
      <div className="flex gap-4">
        <Link to="/login">
          <Button variant="primary">Sign In</Button>
        </Link>
        <Link to="/">
          <Button variant="secondary">Back Home</Button>
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
