import React from 'react';
import { FiInbox } from 'react-icons/fi';
import Button from './Button';
import { cn } from '../../utils/cn';

const EmptyState = ({
  icon: Icon = FiInbox,
  title = "No data available",
  description = "There are no records to display at this moment.",
  actionLabel,
  onActionClick,
  className
}) => {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center bg-white border border-border rounded-[24px] shadow-sm min-h-[300px]", className)}>
      <div className="w-16 h-16 bg-hover-bg rounded-full flex items-center justify-center text-primary mb-4 animate-bounce">
        <Icon size={28} />
      </div>
      <h3 className="text-lg font-bold text-text-primary mb-2">
        {title}
      </h3>
      <p className="text-sm text-text-secondary max-w-sm mb-6">
        {description}
      </p>
      {actionLabel && onActionClick && (
        <Button onClick={onActionClick} size="md" variant="primary">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
