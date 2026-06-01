"use client";

import React, { useState } from "react";
import { Plus, ChevronDown, Star, Sparkles, Clock, Zap, AlertTriangle, Crown } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSmsBalance } from "@/hooks/useSmsBalance";
import { DashboardSmsDetailsModal } from "./DashboardSmsDetailsModal";

interface DashboardStatusWidgetProps {
  planTitle: string;
  endedAt: string | null | undefined;
  planInitialSms: number;
  planSmsBalance: number;
  purchasedPackages: any[];
  userType: "user" | "staff" | null;
}

const formatFa = (num: number) => num.toLocaleString("fa-IR");

export const DashboardStatusWidget: React.FC<DashboardStatusWidgetProps> = ({
  planTitle,
  endedAt,
  planInitialSms,
  planSmsBalance,
  purchasedPackages,
  userType,
}) => {
  const [showSmsDetails, setShowSmsDetails] = useState(false);
  const { balance: totalRemainingSms, isLoading } = useSmsBalance();

  // محاسبه روزهای باقیمانده
  const calculateDays = (date: string | null | undefined) => {
    if (!date) return null;
    const now = new Date();
    const endDate = new Date(date);
    // تنظیم ساعت به صبح برای محاسبه دقیق روز
    now.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    const diff = endDate.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };
  
  const remainingDays = calculateDays(endedAt);
  
  // وضعیت‌های مختلف
  const isExpired = remainingDays !== null && remainingDays <= 0;
  const isExpiringSoon = remainingDays !== null && remainingDays <= 5 && remainingDays > 0;
  const isVeryLow = remainingDays !== null && remainingDays <= 2 && remainingDays > 0;
  const isHealthy = remainingDays !== null && remainingDays > 5;

  // تعیین رنگ و آیکون برای بخش اعتبار
  const getExpiryStatus = () => {
    if (isExpired) {
      return {
        text: "منقضی شده",
        color: "text-rose-600 dark:text-red-400",
        bgColor: "bg-rose-100 dark:bg-red-500/20",
        icon: <AlertTriangle size={12} className="text-rose-600 dark:text-red-400" />,
        borderColor: "border-rose-300 dark:border-red-500/50"
      };
    }
    if (isExpiringSoon) {
      return {
        text: `${formatFa(remainingDays!)} روز مانده`,
        color: isVeryLow ? "text-orange-600 dark:text-orange-400" : "text-amber-600 dark:text-amber-400",
        bgColor: isVeryLow ? "bg-orange-100 dark:bg-orange-500/20" : "bg-amber-100 dark:bg-amber-500/20",
        icon: <Clock size={12} className={isVeryLow ? "text-orange-600 dark:text-orange-400" : "text-amber-600 dark:text-amber-400"} />,
        borderColor: isVeryLow ? "border-orange-300 dark:border-orange-500/50" : "border-amber-300 dark:border-amber-500/50"
      };
    }
    return {
      text: `${formatFa(remainingDays!)} روز اعتبار`,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-100 dark:bg-emerald-500/20",
      icon: <Crown size={12} className="text-emerald-600 dark:text-emerald-400" />,
      borderColor: "border-emerald-300 dark:border-emerald-500/50"
    };
  };

  const expiryStatus = getExpiryStatus();

  // محاسبه درصد برای ProgressBar
  const totalSMS =
    planInitialSms +
    (purchasedPackages?.reduce((acc, p) => acc + (p.initial_sms || 0), 0) || 0);
  const progressPercentage =
    totalSMS > 0 ? (totalRemainingSms / totalSMS) * 100 : 0;

  const isSmsCritical = totalRemainingSms < 15;

  // محاسبه درصد پیشرفت اعتبار (برای نوار پیشرفت روزهای باقیمانده)
  const daysProgress = remainingDays && remainingDays > 0 && remainingDays <= 30 
    ? (remainingDays / 30) * 100 
    : remainingDays && remainingDays > 30 ? 100 : 0;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`bg-white/95 dark:bg-[#0F172A]/80 backdrop-blur-3xl border rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-300
          ${isExpiringSoon ? expiryStatus.borderColor : "border-slate-200/60 dark:border-white/10"}
        `}
      >
        {/* نوار وضعیت در بالای ویجت (فقط در حالت نزدیک به اتمام) */}
        {isExpiringSoon && !isExpired && (
          <div className={`px-5 py-2 text-center ${expiryStatus.bgColor} border-b ${expiryStatus.borderColor}`}>
            <div className="flex items-center justify-center gap-2">
              <Zap size={14} className={expiryStatus.color} />
              <span className={`text-xs font-bold ${expiryStatus.color}`}>
                ⚡ توجه: اشتراک شما به زودی به پایان می‌رسد!
              </span>
            </div>
          </div>
        )}

        {isExpired && (
          <div className="px-5 py-2 text-center bg-rose-100 dark:bg-red-500/20 border-b border-rose-300 dark:border-red-500/50">
            <div className="flex items-center justify-center gap-2">
              <AlertTriangle size={14} className="text-rose-600 dark:text-red-400" />
              <span className="text-xs font-bold text-rose-600 dark:text-red-400">
                ⚠️ اشتراک شما منقضی شده است. برای ادامه استفاده، تمدید کنید.
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-row items-stretch divide-x divide-x-reverse divide-slate-200/50 dark:divide-white/[0.05]">
          {/* بخش پلن فعلی */}
          <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br flex items-center justify-center border
                ${isExpiringSoon 
                  ? "from-amber-400/20 to-amber-600/10 dark:from-amber-400/20 dark:to-amber-600/10 border-amber-500/20"
                  : isExpired
                  ? "from-rose-400/20 to-rose-600/10 dark:from-rose-400/20 dark:to-rose-600/10 border-rose-500/20"
                  : "from-emerald-400/20 to-emerald-600/10 dark:from-emerald-400/20 dark:to-emerald-600/10 border-emerald-500/20"
                }`}
              >
                {isExpired ? (
                  <AlertTriangle size={18} className="text-rose-500 dark:text-rose-400" />
                ) : isExpiringSoon ? (
                  <Clock size={18} className="text-amber-500 dark:text-amber-400" />
                ) : (
                  <Star size={18} className="text-emerald-500 dark:text-emerald-400" fill="currentColor" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold tracking-tight uppercase">
                  اشتراک فعلی
                </span>
                <span className="text-sm font-black text-slate-800 dark:text-white">
                  {planTitle || "رایگان"}
                </span>
              </div>
            </div>

            {/* نمایش روزهای باقیمانده با استایل برجسته */}
            <div className={`flex items-center gap-2 mb-4 w-fit px-3 py-1.5 rounded-full ${expiryStatus.bgColor} border ${expiryStatus.borderColor}`}>
              {expiryStatus.icon}
              <span className={`text-[11px] font-bold ${expiryStatus.color}`}>
                {expiryStatus.text}
              </span>
            </div>

            {/* نوار پیشرفت روزهای باقیمانده (فقط در حالت نزدیک به اتمام) */}
            {isExpiringSoon && !isExpired && (
              <div className="mb-4">
                <div className="flex justify-between text-[9px] text-slate-500 dark:text-slate-400 mb-1">
                  <span>اعتبار باقیمانده</span>
                  <span className={expiryStatus.color}>{Math.round(daysProgress)}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200/60 dark:bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${daysProgress}%` }}
                    transition={{ duration: 0.5 }}
                    className={`h-full rounded-full ${
                      isVeryLow 
                        ? "bg-gradient-to-r from-orange-500 to-red-500"
                        : "bg-gradient-to-r from-amber-500 to-orange-500"
                    }`}
                  />
                </div>
                {isVeryLow && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[9px] text-orange-600 dark:text-orange-400 font-bold mt-1.5 flex items-center gap-1"
                  >
                    <Zap size={10} className="fill-current" />
                    {remainingDays === 1 ? "فردا آخرین مهلت شماست!" : `فقط ${formatFa(remainingDays!)} روز مونده، زودتر تمدید کن!`}
                  </motion.p>
                )}
              </div>
            )}

            {userType == "user" && (
              <Link href="/clientdashboard/pricingplan">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-2.5 rounded-2xl flex items-center justify-center gap-2 group transition-all
                    ${isExpiringSoon 
                      ? "bg-amber-500 hover:bg-amber-600 text-white shadow-lg" 
                      : isExpired
                      ? "bg-rose-500 hover:bg-rose-600 text-white shadow-lg animate-pulse"
                      : "bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20"
                    }
                  `}
                >
                  <Sparkles size={14} className={isExpiringSoon || isExpired ? "text-white" : "text-indigo-600 dark:text-indigo-400"} />
                  <span className={`text-[11px] font-black ${isExpiringSoon || isExpired ? "text-white" : "text-indigo-700 dark:text-indigo-100"}`}>
                    {isExpired ? "تمدید اشتراک" : isExpiringSoon ? "تمدید کن (قبل از اتمام)" : "ارتقای پلن"}
                  </span>
                </motion.div>
              </Link>
            )}
          </div>

          {/* بخش موجودی پیامک */}
          <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between bg-slate-50/30 dark:bg-white/[0.02]">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase mb-1">
                  شارژ باقیمانده
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span
                    className={`text-3xl font-black tracking-tighter transition-colors ${
                      isSmsCritical
                        ? "text-rose-600 dark:text-red-500"
                        : "text-slate-800 dark:text-white"
                    }`}
                  >
                    {isLoading ? "---" : formatFa(totalRemainingSms)}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
                    پیامک
                  </span>
                </div>
              </div>
              {userType == "user" && (
                <button
                  onClick={() => setShowSmsDetails(true)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                >
                  <ChevronDown
                    size={18}
                    className="text-slate-500 dark:text-slate-400"
                  />
                </button>
              )}
            </div>

            {/* نوار پیشرفت هوشمند */}
            <div className="mt-4 mb-6">
              <div className="w-full h-2 bg-slate-200/60 dark:bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-full rounded-full transition-all ${
                    isSmsCritical
                      ? "bg-gradient-to-r from-rose-500 to-rose-600 dark:from-red-500 dark:to-rose-600 shadow-[0_0_10px_rgba(244,63,94,0.4)]"
                      : "bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-500 dark:to-teal-400"
                  }`}
                />
              </div>
              {isSmsCritical && (
                <motion.span
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="text-[9px] text-rose-600 dark:text-red-400 font-bold mt-1.5 flex items-center gap-1"
                >
                  <Zap size={10} fill="currentColor" /> نیاز به شارژ فوری
                </motion.span>
              )}
            </div>

            {userType == "user" && (
              <Link href="/clientdashboard/buysms">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(16,185,129,0.15)] dark:shadow-[0_10px_20px_rgba(16,185,129,0.2)] transition-all"
                >
                  <Plus size={16} strokeWidth={4} className="text-white dark:text-emerald-950" />
                  <span className="text-xs font-black text-white dark:text-emerald-950">
                    خرید بسته پیامک
                  </span>
                </motion.div>
              </Link>
            )}
          </div>
        </div>
      </motion.div>

      <DashboardSmsDetailsModal
        isOpen={showSmsDetails}
        onClose={() => setShowSmsDetails(false)}
        planInitialSms={planInitialSms}
        planSmsBalance={planSmsBalance}
        purchasedPackages={purchasedPackages}
      />
    </div>
  );
};