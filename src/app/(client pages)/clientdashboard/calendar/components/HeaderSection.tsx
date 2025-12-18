import React from "react";
import { Calendar, RefreshCw, MessageSquare, Plus, Filter, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface HeaderSectionProps {
  userSmsBalance: number;
  isLoadingBalance: boolean;
  isLoading: boolean;
  filters: {
    status: 'all' | 'active' | 'cancelled' | 'done';
    service: string;
  };
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
  filters,
  filteredAppointments,
  onRefresh,
  onFilterClick,
  onAddAppointment,
  onClearFilter,
}) => {

  return (
    <div className="sticky top-0 z-50 bg-linear-to-b from-[#1a1e26]/90 to-transparent backdrop-blur-xl border-b border-emerald-500/30">
      <div className="max-w-2xl mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-md font-bold flex items-center gap-3">
            <Calendar className="w-7 h-7 text-emerald-400" />
            تقویم نوبت‌ها
          </h1>
          
          <div className="flex items-center gap-2">
            <div className="text-xs text-gray-400 bg-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2">
              <MessageSquare className="w-3 h-3" />
              موجودی: {isLoadingBalance ? '...' : `${userSmsBalance} پیامک`}
            </div>
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onFilterClick}
            className="flex items-center justify-between bg-white/10 rounded-xl px-4 py-3.5 border border-white/10 hover:border-emerald-500/50 transition-all"
          >
            <span className="text-sm font-medium">
              {filters.status === 'all' ? 'همه وضعیت‌ها' : 
               filters.status === 'active' ? 'فقط فعال' :
               filters.status === 'cancelled' ? 'کنسل شده‌ها' : 'انجام شده‌ها'}
            </span>
            <Filter className="w-5 h-5 text-emerald-400" />
          </button>
          
          <button
            onClick={onAddAppointment}
            className="flex items-center justify-center gap-2 bg-linear-to-r from-emerald-500 to-emerald-600 rounded-xl px-4 py-3.5 font-bold hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg"
          >
            <Plus className="w-5 h-5" />
            نوبت جدید
          </button>
        </div>
        
        {filters.status !== 'all' && (
          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm text-gray-400">
              {filteredAppointments.length} نوبت یافت شد
            </span>
            <button
              onClick={onClearFilter}
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
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

export default HeaderSection;