import React from 'react';
import { cn } from '../../utils/cn';
import { motion } from 'framer-motion';

const GlassButton = ({ children, className, variant = 'primary', ...props }) => {
  const baseStyles = "rounded-xl px-6 py-2.5 font-medium flex items-center justify-center gap-2 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";
  
  const variants = {
    primary: "bg-gradient-to-r from-primary to-accent hover:from-primary-hover hover:to-accent text-text-primary border-transparent shadow-sm",
    secondary: "bg-white text-text-primary border border-border hover:bg-hover-bg shadow-sm",
    danger: "bg-danger text-white border-transparent hover:bg-red-600 shadow-sm"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={cn(baseStyles, variants[variant], className)}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default GlassButton;
