import React from 'react';
import { cn } from '../../utils/cn';

const Button = React.forwardRef(({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  type = 'button',
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      className={cn(
        "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:scale-100",
        
        // Variants
        variant === 'primary' && "bg-gradient-to-r from-primary to-accent hover:from-primary-hover hover:to-accent text-text-primary shadow-sm hover:shadow",
        variant === 'secondary' && "bg-white border border-border hover:bg-hover-bg text-text-primary shadow-sm",
        variant === 'danger' && "bg-danger text-white hover:bg-red-600 shadow-sm",
        variant === 'ghost' && "bg-transparent text-text-secondary hover:bg-hover-bg hover:text-text-primary",
        
        // Sizes
        size === 'sm' && "px-3 py-1.5 text-xs",
        size === 'md' && "px-5 py-2.5 text-sm",
        size === 'lg' && "px-8 py-3.5 text-base",
        
        className
      )}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
