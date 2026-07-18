import React from 'react';
import { FiAlertCircle } from 'react-icons/fi';
import Button from './Button';
import { cn } from '../../utils/cn';

const ErrorState = ({
  title = "Something went wrong",
  description = "We encountered an error while trying to fetch the requested records.",
  onRetry,
  className
}) => {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center bg-white border border-border rounded-[24px] shadow-sm min-h-[300px]", className)}>
      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-danger mb-4">
        <FiAlertCircle size={28} />
      </div>
      <h3 className="text-lg font-bold text-text-primary mb-2">
        {title}
      </h3>
      <p className="text-sm text-text-secondary max-w-sm mb-6">
        {description}
      </p>
      {onRetry && (
        <Button onClick={onRetry} size="md" variant="secondary">
          Try Again
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
