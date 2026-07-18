import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import { cn } from '../../utils/cn';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  className,
  size = 'md',
  closeOnOverlayClick = true
}) => {
  // Handle escape key closure
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeOnOverlayClick ? onClose : undefined}
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.4 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className={cn(
              "relative w-full bg-white rounded-3xl border border-border p-6 shadow-xl z-10 max-h-[90vh] overflow-y-auto",
              size === 'sm' && "max-w-sm",
              size === 'md' && "max-w-lg",
              size === 'lg' && "max-w-2xl",
              size === 'xl' && "max-w-4xl",
              className
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              {title && (
                <h3 id="modal-title" className="text-xl font-bold text-text-primary">
                  {title}
                </h3>
              )}
              <button
                onClick={onClose}
                aria-label="Close modal"
                className="p-1 rounded-full text-text-secondary hover:bg-hover-bg hover:text-text-primary transition-colors focus:ring-2 focus:ring-primary"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Body */}
            <div>{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
