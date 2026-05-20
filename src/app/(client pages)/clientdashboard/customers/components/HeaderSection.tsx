import { User, MessageSquare, RefreshCw, Search, Users } from "lucide-react";
import React, { useState } from "react";
import { motion } from "framer-motion";

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  userSmsBalance: number;
  isLoadingBalance: boolean;
  onRefresh: () => void;
  isLoading: boolean;
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
  isLoading,
  onShowBulkSms,
  onShowAddClient,
  clientsCount,
}) => {
  const [isForcingSpin, setIsForcingSpin] = useState(false);

  const handleRefreshClick = () => {
    setIsForcingSpin(true);
    onRefresh();
    
    setTimeout(() => {
      setIsForcingSpin(false);
    }, 1000);
  };

  return (
    <div className="sticky top-0 z-50 bg-white/95 dark:bg-[#1a1e26]/90 backdrop-blur-xl border-b border-slate-200/60 dark:border-emerald-500/30 transition-all duration-300">
      <div className="max-w-2xl mx-auto p-4">
        {/* هدر با عنوان و موجودی */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center">
              <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">
                مشتریان
              </h1>
              <p className="text-[10px] text-slate-500 dark:text-gray-400">
                {clientsCount} مشتری فعال
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="text-xs text-slate-600 dark:text-gray-400 bg-slate-100 dark:bg-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2">
              <MessageSquare className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span className="font-medium">
                موجودی: {isLoadingBalance ? "..." : `${userSmsBalance.toLocaleString("fa-IR")} پیامک`}
              </span>
            </div>
            
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleRefreshClick}
              disabled={isLoading || isForcingSpin}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 disabled:opacity-50 transition-all"
            >
              <RefreshCw 
                className={`w-5 h-5 ${
                  (isLoading || isForcingSpin) 
                    ? 'animate-spin text-emerald-600 dark:text-emerald-400' 
                    : 'text-slate-500 dark:text-gray-400'
                }`} 
              />
            </motion.button>
          </div>
        </div>

        {/* باکس جستجو */}
        <div className="relative mt-2">
          <input
            type="text"
            placeholder="جستجو نام یا شماره..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-3.5 px-5 pr-12 bg-slate-100 dark:bg-[#242933] rounded-xl border border-slate-200 dark:border-emerald-500/40 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 dark:focus:ring-emerald-400/20 text-sm text-slate-700 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500 outline-none transition-all"
            dir="rtl"
          />
          <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>

        {/* دکمه‌های اقدام */}
        <div className="mt-4 flex flex-row gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onShowBulkSms}
            disabled={clientsCount === 0}
            className="flex-1 py-3.5 bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-700 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all text-white shadow-md dark:shadow-none"
          >
            <MessageSquare className="w-5 h-5" />
            <span>پیام همگانی</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onShowAddClient}
            className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-white shadow-md dark:shadow-none"
          >
            <User className="w-5 h-5" />
            <span>افزودن مشتری</span>
          </motion.button>
        </div>


      </div>
    </div>
  );
};