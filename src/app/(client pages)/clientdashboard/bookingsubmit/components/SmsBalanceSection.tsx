"use client";

import React from "react";
import { MessageSquare, AlertCircle, ShoppingCart, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SmsBalanceSectionProps {
  userSmsBalance: number | undefined;
  isLoadingBalance: boolean;
  reserveSmsCount: number;
  remindSmsCount: number;
  totalSmsNeeded: number;
  onBuySms: () => void;
}

const SmsBalanceSection: React.FC<SmsBalanceSectionProps> = ({
  userSmsBalance,
  isLoadingBalance,
  reserveSmsCount,
  remindSmsCount,
  totalSmsNeeded,
  onBuySms,
}) => {
  const isBalanceInsufficient = !isLoadingBalance && totalSmsNeeded > (userSmsBalance ?? 0);

  return (
    <div className="bg-[#1a1e26]/50 backdrop-blur-xl rounded-[2.5rem] p-6 border border-white/5 shadow-2xl overflow-hidden relative group">
      {/* دکوراسیون پس‌زمینه */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[50px] -z-10" />
      
      {/* Header: موجودی فعلی */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="text-sm font-bold text-gray-200 tracking-tight">موجودی پنل پیامک</span>
        </div>
        
        {isLoadingBalance ? (
          <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl">
            <div className="w-4 h-4 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
            <span className="text-xs text-gray-400">در حال بروزرسانی...</span>
          </div>
        ) : (
          <div className="text-left">
            <span className="text-2xl font-black text-emerald-400">
              {userSmsBalance?.toLocaleString() ?? 0}
            </span>
            <span className="text-[10px] text-emerald-500/70 font-bold mr-1 uppercase">Sms</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {/* جزئیات هزینه‌ها */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/2 border border-white/5 p-4 rounded-2xl">
            <span className="text-[10px] text-gray-500 block mb-1">پیامک تایید رزرو</span>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold ${reserveSmsCount > 0 ? "text-white" : "text-gray-600"}`}>
                {reserveSmsCount > 0 ? `${reserveSmsCount} صفحه` : "غیرفعال"}
              </span>
              {reserveSmsCount > 0 && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />}
            </div>
          </div>

          <div className="bg-white/2 border border-white/5 p-4 rounded-2xl">
            <span className="text-[10px] text-gray-500 block mb-1">پیامک یادآوری</span>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold ${remindSmsCount > 0 ? "text-white" : "text-gray-600"}`}>
                {remindSmsCount > 0 ? `${remindSmsCount} صفحه` : "غیرفعال"}
              </span>
              {remindSmsCount > 0 && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />}
            </div>
          </div>
        </div>

        {/* مجموع هزینه */}
        <div className="bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-[2rem] flex items-center justify-between">
          <div>
            <span className="text-xs text-emerald-200/60 font-medium">مجموع هزینه این نوبت</span>
            <div className="flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              <p className="text-[10px] text-gray-500 italic">محاسبه بر اساس تعداد صفحات الگو</p>
            </div>
          </div>
          <div className="bg-emerald-500 text-[#0f1115] px-5 py-2 rounded-2xl font-black text-lg shadow-[0_10px_20px_rgba(16,185,129,0.2)]">
            {totalSmsNeeded} <span className="text-xs">پیامک</span>
          </div>
        </div>

        {/* وضعیت‌های شرطی (هشدار یا تایید) */}
        <AnimatePresence mode="wait">
          {isBalanceInsufficient ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-2"
            >
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl relative overflow-hidden group/btn">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-red-400 font-bold text-sm">موجودی ناکافی است</p>
                    <p className="text-red-400/60 text-[11px] mt-0.5">
                      شما به {totalSmsNeeded - (userSmsBalance ?? 0)} پیامک دیگر نیاز دارید
                    </p>
                  </div>
                  <button
                    onClick={onBuySms}
                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-xl transition-all active:scale-90 shadow-lg"
                  >
                    <ShoppingCart className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ) : totalSmsNeeded === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 bg-white/5 border border-dashed border-white/10 rounded-2xl text-center"
            >
              <p className="text-gray-500 text-xs font-medium">
                تنظیمات پیامک برای این نوبت غیرفعال است
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center gap-2 py-2"
            >
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              <p className="text-[11px] text-gray-500">موجودی برای این رزرو کافی است</p>
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SmsBalanceSection;