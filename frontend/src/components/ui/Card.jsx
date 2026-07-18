import React from 'react';
import { cn } from '../../utils/cn';

const Card = ({
  children,
  className,
  hoverable = false,
  onClick,
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={cn(
        "bg-white border border-border rounded-[24px] p-6 shadow-sm transition-all duration-300",
        hoverable && "hover:shadow-md hover:-translate-y-1 cursor-pointer",
        onClick && "cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
