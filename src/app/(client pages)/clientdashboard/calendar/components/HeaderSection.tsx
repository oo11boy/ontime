"use client";
import React, { useMemo, useState } from "react";
import {
  Calendar,
  RefreshCw,
  MessageSquare,
  Plus,
  Filter,
  X,
} from "lucide-react";

interface HeaderSectionProps {
  userSmsBalance: number;
  isLoadingBalance: boolean;
  isLoading: boolean;
  selectedService: string;
  filteredAppointments: any[];
  onRefresh: () => void;
  onFilterClick: () => void;
  onAddAppointment: () => void;
  onClearFilter: () => void;
}

const HeaderSection: React.FC<HeaderSectionProps> = ({
  userSmsBalance,
  isLoadingBalance,
  isLoading,
  selectedService,
  filteredAppointments,
  onRefresh,
  onFilterClick,
  onAddAppointment,
  onClearFilter,
}) => {
  const [isForcingSpin, setIsForcingSpin] = useState(false);

  const isFilterActive = selectedService !== "all";

  const filterSummary = useMemo(() => {
    if (selectedService === "all") return "همه خدمات";
    return selectedService;
  }, [selectedService]);

  const handleRefreshClick = () => {
    setIsForcingSpin(true);
    onRefresh();
    setTimeout(() => setIsForcingSpin(false), 1000);
  };

  return (
    <div className="sticky top-0 z-50 bg-gradient-to-b from-white/90 to-transparent dark:from-[#1a1e26]/90 dark:to-transparent backdrop-blur-xl border-b border-slate-200 dark:border-emerald-500/30 text-slate-800 dark:text-white transition-colors">
      <div className="max-w-2xl mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-md font-bold flex items-center gap-3">
            <Calendar className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            تقویم نوبت‌ها
          </h1>

          <div className="flex items-center gap-2">
            <div className="text-xs text-slate-600 dark:text-gray-400 bg-slate-100 dark:bg-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2">
              <MessageSquare className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              موجودی: {isLoadingBalance ? "..." : `${userSmsBalance} پیامک`}
            </div>
            <button
              onClick={handleRefreshClick}
              disabled={isLoading || isForcingSpin}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 transition disabled:opacity-50 flex items-center justify-center"
            >
              <RefreshCw
                className={`w-5 h-5 ${
                  isLoading || isForcingSpin
                    ? "animate-spin text-emerald-600 dark:text-emerald-400"
                    : "text-slate-500 dark:text-gray-300"
                }`}
              />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onFilterClick}
            className={`flex items-center justify-between rounded-xl px-4 py-3.5 border transition-all ${
              isFilterActive
                ? "bg-blue-100 dark:bg-blue-500/20 border-blue-300 dark:border-blue-500/40 text-blue-700 dark:text-blue-400"
                : "bg-slate-100 dark:bg-white/10 border-slate-200 dark:border-white/10 hover:border-emerald-500/40 text-slate-700 dark:text-gray-300"
            }`}
          >
            <span className="text-sm font-medium truncate max-w-[120px]">
              {filterSummary}
            </span>
            <Filter className="w-5 h-5" />
          </button>

          <button
            onClick={onAddAppointment}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 dark:from-emerald-500 dark:to-emerald-600 rounded-xl px-4 py-3.5 font-bold hover:from-emerald-600 hover:to-emerald-700 dark:hover:from-emerald-600 dark:hover:to-emerald-700 transition-all shadow-lg text-white"
          >
            <Plus className="w-5 h-5" />
            نوبت جدید
          </button>
        </div>

        {isFilterActive && (
          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm text-slate-500 dark:text-gray-400">
              {filteredAppointments.length} نوبت یافت شد
            </span>
            <button
              onClick={onClearFilter}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              حذف فیلتر
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export { HeaderSection };