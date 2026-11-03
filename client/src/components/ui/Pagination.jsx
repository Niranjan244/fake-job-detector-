import React from 'react';
import Button from './Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({
  page,
  totalPages,
  totalItems,
  onPageChange,
  className = '',
}) {
  if (totalPages <= 1) return null;

  return (
    <div
      className={`px-6 py-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 bg-slate-50/50 ${className}`}
    >
      <span>
        Page <strong className="text-slate-800">{page}</strong> of{' '}
        <strong className="text-slate-800">{totalPages}</strong>
        {totalItems !== undefined && (
          <span className="text-slate-400 ml-1.5">
            ({totalItems} total)
          </span>
        )}
      </span>

      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          icon={ChevronLeft}
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
