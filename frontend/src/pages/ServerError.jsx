import React from 'react';
import { FiAlertTriangle } from 'react-icons/fi';
import Button from '../components/ui/Button';

const ServerError = ({ onReset }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center">
      <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mb-6">
        <FiAlertTriangle size={40} />
      </div>
      <h1 className="text-4xl font-extrabold text-text-primary tracking-tight sm:text-5xl mb-3">
        500 - Server Error
      </h1>
      <p className="text-base text-text-secondary max-w-md mb-8">
        Something went wrong on our servers. Please refresh the page or try again later.
      </p>
      <Button
        variant="primary"
        onClick={onReset || (() => window.location.reload())}
      >
        Reload Page
      </Button>
    </div>
  );
};

export default ServerError;
