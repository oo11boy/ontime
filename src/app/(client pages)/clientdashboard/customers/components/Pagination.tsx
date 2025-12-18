// components/CustomerList/Pagination.tsx
import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-4 mt-8">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="p-2 rounded-lg bg-white/10 disabled:opacity-30"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
      <span className="text-sm text-gray-300">
        صفحه {page} از {totalPages}
      </span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="p-2 rounded-lg bg-white/10 disabled:opacity-30"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
    </div>
  );
};