import React from "react";

interface ErrorDisplayProps {
  error: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[#1a1e26] dark:to-[#242933] px-6 transition-colors">
      <div className="text-rose-600 dark:text-red-400 text-center">
        <p className="text-lg font-medium">خطا:</p>
        <p className="mt-2">{error}</p>
      </div>
    </div>
  );
};