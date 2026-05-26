"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Crown, Calendar, Zap, AlertCircle, Clock } from "lucide-react";

interface PlanStatusBoxProps {
  expiryDate: string | null;
  daysRemaining: number;
  hasPurchasedPlan: boolean;
  onRefresh?: () => void;
}

export function PlanStatusBox({ expiryDate, daysRemaining, hasPurchasedPlan, onRefresh }: PlanStatusBoxProps) {
  const router = useRouter();
  const [daysLeft, setDaysLeft] = useState(daysRemaining);

  useEffect(() => {
    if (expiryDate) {
      const updateTimer = () => {
        const now = new Date().getTime();
        const expiry = new Date(expiryDate).getTime();
        const diff = expiry - now;
        const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
        setDaysLeft(days);
        if (days <= 0) onRefresh?.();
      };

      updateTimer();
      const interval = setInterval(updateTimer, 86400000);
      return () => clearInterval(interval);
    }
  }, [expiryDate, onRefresh]);

  // اگر هیچ وقت پلن نخریده، باکس نمایش داده نشود
  if (!hasPurchasedPlan) {
    return null;
  }

  const getStatusColor = () => {
    if (daysLeft <= 0) return "from-red-500 to-rose-500";
    if (daysLeft <= 5) return "from-orange-500 to-amber-500";
    if (daysLeft <= 10) return "from-amber-500 to-yellow-500";
    return "from-emerald-500 to-teal-500";
  };

  const getStatusText = () => {
    if (daysLeft <= 0) return "منقضی شده";
    if (daysLeft === 1) return "فردا آخرین روز";
    if (daysLeft <= 5) return "در حال اتمام";
    return "فعال";
  };

  return (
    <div className={`bg-gradient-to-r ${getStatusColor()} rounded-xl p-2.5 text-white shadow-sm`}>
      <div className="flex items-center justify-between">
<div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-1 w-full">
  <div className="flex items-center gap-2 flex-wrap min-[400px]:flex-nowrap">
    {/* آیکون */}
    <div className="w-8 h-8 min-[400px]:w-7 sm:w-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
      <Crown className="w-4 h-4 min-[400px]:w-3.5 sm:w-3.5" />
    </div>

    {/* متن‌ها - بدون truncate، فقط با wrap طبیعی */}
    <div className="flex-1">
      <div className="flex flex-wrap items-center gap-1.5">
        <p className="text-xs sm:text-[11px] font-bold whitespace-normal break-words">
          ویژگی ثبت نوبت توسط مشتری
        </p>
        <span className={`text-[9px] px-1.5 py-0.5 rounded-full whitespace-nowrap ${
          daysLeft <= 5 ? "bg-white/25" : "bg-white/20"
        }`}>
          {getStatusText()}
        </span>
      </div>
      <p className="text-[9px] opacity-80 whitespace-normal break-words">
        ۲۴ ساعته، خودکار
      </p>
    </div>
  </div>
</div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white/15 rounded-lg px-2.5 py-1">
            <Calendar className="w-3 h-3 opacity-80" />
            <span className="text-base font-bold leading-none">{daysLeft}</span>
            <span className="text-[9px] opacity-80">روز</span>
            <Zap className="w-3 h-3 opacity-70" />
          </div>
          
          {/* دکمه تمدید - همیشه نمایش داده شود */}
          <button
            onClick={() => router.push("/clientdashboard/customer-link/plans")}
            className="px-2.5 py-1 bg-white/20 hover:bg-white/30 transition rounded-lg text-[10px] font-bold"
          >
            تمدید
          </button>
        </div>
      </div>
    </div>
  );
}