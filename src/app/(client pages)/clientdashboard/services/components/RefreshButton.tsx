import React from "react";
import { RefreshCw } from "lucide-react";

interface RefreshButtonProps {
  isLoading: boolean;
  onRefresh: () => void;
}

export const RefreshButton: React.FC<RefreshButtonProps> = ({
  isLoading,
  onRefresh,
}) => {
  return (
    <div className="px-4 mt-3">
      <button
        onClick={onRefresh}
        disabled={isLoading}
        className="w-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 rounded-xl px-4 py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition disabled:opacity-50 text-slate-700 dark:text-gray-300"
      >
        <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        {isLoading ? "در حال دریافت..." : "بروزرسانی لیست"}
      </button>
    </div>
  );
};