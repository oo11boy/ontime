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
    <div className="sticky top-0 z-50 bg-[#1a1e26]/90 backdrop-blur-xl border-b border-emerald-500/30">
      <div className="max-w-2xl mx-auto p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-md font-bold flex items-center gap-3">
            <Settings className="w-7 h-7 text-emerald-400" />
            مدیریت خدمات
          </h1>

          <div className="flex items-center gap-2">
            {/* دکمه رفرش که به هدر اضافه شد */}
            <button
              onClick={handleRefreshClick}
              disabled={isLoading || isForcingSpin}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition disabled:opacity-50 flex items-center justify-center"
            >
              <RefreshCw
                className={`w-5 h-5 ${(isLoading || isForcingSpin) ? "animate-spin text-emerald-400" : "text-gray-300"}`}
              />
            </button>

            {/* دکمه افزودن */}
            <button
              onClick={onAddClick}
              className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 transition text-white"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};