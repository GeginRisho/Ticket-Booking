import React from 'react';
import { cn } from '../../utils/cn';

const Input = React.forwardRef(({
  label,
  error,
  className,
  type = 'text',
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div className="w-full text-left">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-semibold text-text-primary mb-2"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          ref={ref}
          type={type}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={cn(
            "w-full px-4 py-3 rounded-xl border bg-white text-text-primary placeholder:text-text-placeholder transition-all duration-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
            error ? "border-danger focus:border-danger focus:ring-danger/20" : "border-border",
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p
          id={`${inputId}-error`}
          className="mt-2 text-xs font-semibold text-danger"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
