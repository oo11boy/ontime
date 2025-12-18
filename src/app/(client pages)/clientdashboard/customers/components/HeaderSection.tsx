// components/HeaderSection.tsx
import { User, MessageSquare, RefreshCw, Search } from "lucide-react";
import React from "react";

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  userSmsBalance: number;
  isLoadingBalance: boolean;
  onRefresh: () => void;
  onShowBulkSms: () => void;
  onShowAddClient: () => void;
  clientsCount: number;
}

export const HeaderSection: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  userSmsBalance,
  isLoadingBalance,
  onRefresh,
  onShowBulkSms,
  onShowAddClient,
  clientsCount,
}) => {
  return (
    <div className="sticky top-0 z-50 bg-[#1a1e26]/90 backdrop-blur-xl border-b border-emerald-500/30">
      <div className="max-w-2xl mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-md font-bold flex items-center gap-3">
            <User className="w-7 h-7 text-emerald-400" />
            مشتریان
          </h1>
          <div className="flex items-center gap-2">
            <div className="text-xs text-gray-400 bg-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2">
              <MessageSquare className="w-3 h-3" />
              موجودی: {isLoadingBalance ? "..." : `${userSmsBalance} پیامک`}
            </div>
            <button
              onClick={onRefresh}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="جستجو نام یا شماره..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-3.5 px-5 pr-12 bg-[#242933] rounded-xl border border-emerald-500/40 focus:border-emerald-400 text-sm"
          />
          <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
        </div>

        <div className="mt-4 flex text-xs flex-row gap-3">
          <button
            onClick={onShowBulkSms}
            disabled={clientsCount === 0}
            className="flex-1 py-3.5 bg-purple-600 hover:bg-purple-700 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <MessageSquare className="w-5 h-5" />
            پیام همگانی
          </button>

          <button
            onClick={onShowAddClient}
            className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 rounded-xl font-bold flex items-center justify-center gap-2"
          >
            <User className="w-5 h-5" />
            افزودن مشتری
          </button>
        </div>
      </div>
    </div>
  );
};