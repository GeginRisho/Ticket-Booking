import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { cn } from '../../utils/cn';

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  className
}) => {
  if (totalPages <= 1) return null;

  const pages = [];
  // Standard range calculation
  const range = 2; // how many pages to show around current page
  for (let i = Math.max(1, currentPage - range); i <= Math.min(totalPages, currentPage + range); i++) {
    pages.push(i);
  }

  return (
    <nav
      role="navigation"
      aria-label="Pagination Navigation"
      className={cn("flex items-center justify-between border-t border-border px-4 py-3 sm:px-6 mt-6 bg-white rounded-3xl", className)}
    >
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="relative inline-flex items-center rounded-xl border border-border bg-white px-4 py-2 text-sm font-medium text-text-primary hover:bg-hover-bg disabled:opacity-50"
        >
          Previous
        </button>
        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="relative ml-3 inline-flex items-center rounded-xl border border-border bg-white px-4 py-2 text-sm font-medium text-text-primary hover:bg-hover-bg disabled:opacity-50"
        >
          Next
        </button>
      </div>
      
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-text-secondary">
            Page <span className="font-semibold text-text-primary">{currentPage}</span> of{' '}
            <span className="font-semibold text-text-primary">{totalPages}</span>
          </p>
        </div>
        <div>
          <span className="relative inline-flex gap-1.5">
            <button
              aria-label="Go to previous page"
              disabled={currentPage === 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="relative inline-flex items-center rounded-xl border border-border bg-white p-2 text-text-secondary hover:bg-hover-bg disabled:opacity-50 focus:ring-2 focus:ring-primary"
            >
              <FiChevronLeft className="h-5 w-5" />
            </button>
            
            {pages.map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                aria-current={page === currentPage ? 'page' : undefined}
                className={cn(
                  "relative inline-flex items-center rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-primary",
                  page === currentPage
                    ? "z-10 bg-primary text-text-primary font-bold shadow-sm"
                    : "border border-border bg-white text-text-secondary hover:bg-hover-bg"
                )}
              >
                {page}
              </button>
            ))}

            <button
              aria-label="Go to next page"
              disabled={currentPage === totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className="relative inline-flex items-center rounded-xl border border-border bg-white p-2 text-text-secondary hover:bg-hover-bg disabled:opacity-50 focus:ring-2 focus:ring-primary"
            >
              <FiChevronRight className="h-5 w-5" />
            </button>
          </span>
        </div>
      </div>
    </nav>
  );
};

export default Pagination;
