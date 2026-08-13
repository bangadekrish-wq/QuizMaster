import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

export const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  totalRecords,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-2 py-3">
      {totalRecords !== undefined && (
        <span className="text-xs text-slate-400">
          Showing page <span className="font-semibold text-slate-200">{currentPage}</span> of{' '}
          <span className="font-semibold text-slate-200">{totalPages}</span> ({totalRecords} total items)
        </span>
      )}
      <div className="flex items-center gap-2 ml-auto">
        <Button
          variant="secondary"
          size="sm"
          isDisabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          icon={ChevronLeft}
        >
          Previous
        </Button>
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-8 h-8 rounded-ms text-xs font-semibold transition-all ${
                page === currentPage
                  ? 'bg-brand-cyan text-dark-bg font-bold shadow-ms-glow'
                  : 'bg-dark-elevated text-slate-300 hover:bg-dark-borderLight'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
        <Button
          variant="secondary"
          size="sm"
          isDisabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          icon={ChevronRight}
          iconPosition="right"
        >
          Next
        </Button>
      </div>
    </div>
  );
};
