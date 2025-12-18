// src/app/(client pages)/clientdashboard/components/DashboardSmsStatus.tsx
"use client";

import React, { useState } from "react";
import { MessageCircle, Plus, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { DashboardProgressCircle } from "./DashboardProgressCircle";
import { DashboardSmsDetailsModal } from "./DashboardSmsDetailsModal";

interface PurchasedPackage {
  id: number;
  sms_amount: number;
  remaining_sms: number;
  valid_from: string;
  expires_at: string;
  amount_paid: number;
  created_at: string;
}

interface DashboardSmsStatusProps {
  planInitialSms: number;
  planSmsBalance: number;
  purchasedPackages: PurchasedPackage[];
}

const formatNumber = (num: number): string => {
  return num.toLocaleString("fa-IR");
};

export const DashboardSmsStatus: React.FC<DashboardSmsStatusProps> = ({
  planInitialSms = 0,
  planSmsBalance = 0,
  purchasedPackages = [],
}) => {
  const [showDetails, setShowDetails] = useState(false);

  // محاسبات
  const totalAllocatedFromPackages = purchasedPackages.reduce(
    (sum, pkg) => sum + pkg.sms_amount,
    0
  );

  const remainingFromPackages = purchasedPackages.reduce(
    (sum, pkg) => sum + pkg.remaining_sms,
    0
  );

  const totalAllocatedSms = planInitialSms + totalAllocatedFromPackages;
  const totalRemainingSms = planSmsBalance + remainingFromPackages;

  const remainingPercentage = totalAllocatedSms > 0
    ? (totalRemainingSms / totalAllocatedSms) * 100
    : 0;

  const isLowSms = totalRemainingSms < 20;

  return (
    <>
      <div className="w-full">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-linear-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-slate-700/50 overflow-hidden"
        >
          <div className="flex flex-col items-center py-6 px-5">
            {/* دایره پیشرفت */}
            <DashboardProgressCircle 
              percentage={remainingPercentage}
              isLowSms={isLowSms}
            />

            {/* متن مرکزی */}
            <div className="text-center">
              <p className="text-gray-400 text-xs font-medium tracking-wide">پیامک باقیمانده</p>
              <p
                className={`text-3xl font-black mt-1 tracking-tight bg-clip-text text-transparent ${
                  isLowSms
                    ? "bg-linear-to-r from-red-400 to-red-500"
                    : "bg-linear-to-r from-emerald-400 to-teal-300"
                }`}
              >
                {formatNumber(totalRemainingSms)}
              </p>
              {isLowSms && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-xs font-medium mt-1"
                >
                  اعتبار بسیار کم است!
                </motion.p>
              )}
            </div>

            {/* دکمه‌ها */}
            <div className="flex gap-2.5 mt-5">
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => setShowDetails(true)}
                className="flex items-center gap-1.5 bg-slate-700/60 hover:bg-slate-700/80 text-gray-300 hover:text-white px-3.5 py-2 rounded-xl text-xs font-medium border border-slate-600/60 transition-all duration-200"
              >
                جزئیات
                <ChevronDown className="w-3 h-3" />
              </motion.button>

              <motion.div
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
              >
                <Link
                  href="/clientdashboard/buysms"
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                    isLowSms
                      ? "bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 border-red-500/40"
                      : "bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-amber-200 border-amber-500/40"
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" strokeWidth={2.8} />
                  خرید بسته پیامک اضافه
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* مودال جزئیات */}
      <DashboardSmsDetailsModal
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        planInitialSms={planInitialSms}
        planSmsBalance={planSmsBalance}
        purchasedPackages={purchasedPackages}
      />
    </>
  );
};