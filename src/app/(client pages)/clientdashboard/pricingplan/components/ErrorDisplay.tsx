// components/PricingPlan/ErrorDisplay.tsx
import React from "react";

interface ErrorDisplayProps {
  error: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#1a1e26] to-[#242933] px-6">
      <div className="text-red-400 text-center">
        <p className="text-lg font-medium">خطا:</p>
        <p className="mt-2">{error}</p>
      </div>
    </div>
  );
};