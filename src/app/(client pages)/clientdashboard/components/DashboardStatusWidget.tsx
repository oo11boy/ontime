"use client";

import React, { useState } from "react";
import { Plus, ChevronDown, Star, Sparkles, Clock, Zap } from "lucide-react";
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
}

const formatFa = (num: number) => num.toLocaleString("fa-IR");

export const DashboardStatusWidget: React.FC<DashboardStatusWidgetProps> = ({
  planTitle,
  endedAt,
  planInitialSms,
  planSmsBalance,
  purchasedPackages,
}) => {
  const [showSmsDetails, setShowSmsDetails] = useState(false);
  const { balance: totalRemainingSms, isLoading } = useSmsBalance();

  // محاسبه روزهای باقیمانده
  const calculateDays = (date: string | null | undefined) => {
    if (!date) return null;
    const diff = new Date(date).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };
  const remainingDays = calculateDays(endedAt);

  // محاسبه درصد برای ProgressBar
  const totalSMS = planInitialSms + (purchasedPackages?.reduce((acc, p) => acc + (p.initial_sms || 0), 0) || 0);
  const progressPercentage = totalSMS > 0 ? (totalRemainingSms / totalSMS) * 100 : 0;
  
  const isCritical = totalRemainingSms < 15;

  return (
    <div className="w-full max-w-2xl mx-auto px-2">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#0F172A]/80 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
      >
        <div className="flex flex-row items-stretch divide-x divide-x-reverse divide-white/[0.05]">
          
          {/* بخش پلن فعلی */}
          <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-600/10 flex items-center justify-center border border-amber-500/20">
                <Star size={18} className="text-amber-400" fill="currentColor" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-bold tracking-tight uppercase">اشتراک فعلی</span>
                <span className="text-sm font-black text-white">{planTitle || "رایگان"}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-6 text-slate-400 bg-white/5 w-fit px-3 py-1.5 rounded-full">
              <Clock size={12} className={remainingDays !== null && remainingDays < 5 ? "text-red-400" : "text-emerald-400"} />
              <span className="text-[11px] font-bold">
                {remainingDays !== null && remainingDays > 0 ? `${formatFa(remainingDays)} روز اعتبار` : "منقضی شده"}
              </span>
            </div>

            <Link href="/clientdashboard/pricingplan">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full bg-indigo-500/10 border border-indigo-500/20 py-2.5 rounded-2xl flex items-center justify-center gap-2 group transition-all">
                <Sparkles size={14} className="text-indigo-400 group-hover:animate-pulse" />
                <span className="text-[11px] font-black text-indigo-100">ارتقای پلن</span>
              </motion.div>
            </Link>
          </div>

          {/* بخش موجودی پیامک */}
          <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between bg-white/[0.02]">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-bold uppercase mb-1">شارژ باقیمانده</span>
                <div className="flex items-baseline gap-1.5">
                  <span className={`text-3xl font-black tracking-tighter transition-colors ${isCritical ? 'text-red-500' : 'text-white'}`}>
                    {isLoading ? "---" : formatFa(totalRemainingSms)}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500">پیامک</span>
                </div>
              </div>
              <button 
                onClick={() => setShowSmsDetails(true)} 
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <ChevronDown size={18} className="text-slate-400" />
              </button>
            </div>

            {/* نوار پیشرفت هوشمند */}
            <div className="mt-4 mb-6">
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-full rounded-full ${
                    isCritical 
                    ? 'bg-gradient-to-r from-red-500 to-rose-600 shadow-[0_0_10px_rgba(244,63,94,0.4)]' 
                    : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  }`}
                />
              </div>
              {isCritical && (
                <motion.span 
                  animate={{ opacity: [1, 0.5, 1] }} 
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="text-[9px] text-red-400 font-bold mt-1.5 flex items-center gap-1"
                >
                  <Zap size={10} fill="currentColor" /> نیاز به شارژ فوری
                </motion.span>
              )}
            </div>

            <Link href="/clientdashboard/buysms">
              <motion.div 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }} 
                className="w-full bg-emerald-500 hover:bg-emerald-400 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(16,185,129,0.2)] transition-all"
              >
                <Plus size={16} strokeWidth={4} className="text-emerald-950" />
                <span className="text-xs font-black text-emerald-950">خرید بسته پیامک</span>
              </motion.div>
            </Link>
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