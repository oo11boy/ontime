"use client";
import React, { useState } from "react";
import { Settings, Plus, RefreshCw } from "lucide-react";

interface HeaderSectionProps {
  onAddClick: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const HeaderSection: React.FC<HeaderSectionProps> = ({
  onAddClick,
  onRefresh,
  isLoading,
}) => {
  const [isForcingSpin, setIsForcingSpin] = useState(false);

  const handleRefreshClick = () => {
    setIsForcingSpin(true);
    onRefresh();
    setTimeout(() => setIsForcingSpin(false), 1000);
  };

  return (
    <div className="sticky top-0 z-50 bg-white/90 dark:bg-[#1a1e26]/90 backdrop-blur-xl border-b border-slate-200 dark:border-emerald-500/30 transition-colors">
      <div className="max-w-2xl mx-auto p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-md font-bold flex items-center gap-3 text-slate-800 dark:text-white">
            <Settings className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            مدیریت خدمات
          </h1>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefreshClick}
              disabled={isLoading || isForcingSpin}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 transition disabled:opacity-50 flex items-center justify-center"
            >
              <RefreshCw
                className={`w-5 h-5 ${(isLoading || isForcingSpin) ? "animate-spin text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-gray-300"}`}
              />
            </button>

            <button
              onClick={onAddClick}
              className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 transition text-white"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};