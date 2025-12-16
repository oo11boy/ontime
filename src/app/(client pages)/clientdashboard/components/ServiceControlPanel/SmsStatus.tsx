// File Path: src\app\(client pages)\clientdashboard\components\ServiceControlPanel\SmsStatus.tsx

"use client";

import React, { useState } from "react";
import { MessageCircle, Plus, Package, Calendar, ChevronDown, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface PurchasedPackage {
  id: number;
  sms_amount: number;
  remaining_sms: number;
  valid_from: string;
  expires_at: string;
  amount_paid: number;
  created_at: string;
}

interface SmsStatusProps {
  planInitialSms: number;
  planSmsBalance: number;
  purchasedSmsBalance: number;
  purchasedPackages?: PurchasedPackage[];
}

const formatNumber = (num: number): string => {
  return num.toLocaleString("fa-IR");
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleString("fa-IR", { year: "numeric", month: "long", day: "numeric" });
};

export default function SmsStatus({
  planInitialSms = 0,
  planSmsBalance = 0,
  purchasedPackages = [],
}: SmsStatusProps) {
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

  const finalPercentage = Math.min(100, Math.max(0, remainingPercentage));
  const CIRCUMFERENCE = 2 * Math.PI * 54;
  
  let dashOffset = CIRCUMFERENCE - (finalPercentage / 100) * CIRCUMFERENCE;
  
  if (finalPercentage === 100) {
    dashOffset = -1;
  } else if (finalPercentage === 0) {
    dashOffset = CIRCUMFERENCE + 1;
  }

  const isLowSms = totalRemainingSms < 20;
  const gradientId = isLowSms ? "redGradient" : "greenGradient";

  return (
    <>
      {/* کارت اصلی */}
      <div className="w-full">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-linear-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-slate-700/50 overflow-hidden"
        >
          <div className="flex flex-col items-center py-6 px-5">
            {/* دایره پیشرفت */}
            <motion.div
              className="relative w-20 h-20 mb-4"
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, ease: "backOut" }}
            >
              <motion.div
                className={`absolute inset-0 rounded-full blur-xl ${
                  isLowSms ? "bg-red-500/30" : "bg-emerald-400/25"
                }`}
                animate={{ scale: [1, 1.3, 1], opacity: [0.35, 0.15, 0.35] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />

              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  stroke="#334155"
                  strokeWidth="10"
                  fill="none"
                  opacity="0.6"
                />

                <motion.circle
                  cx="60"
                  cy="60"
                  r="54"
                  stroke={`url(#${gradientId})`}
                  strokeWidth="10"
                  fill="none"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                  initial={{ strokeDashoffset: CIRCUMFERENCE + 1 }}
                  animate={{ strokeDashoffset: dashOffset }}
                  transition={{ duration: 1.4, ease: "easeOut" }}
                />

                <defs>
                  <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#34D399" />
                    <stop offset="50%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                  <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F87171" />
                    <stop offset="50%" stopColor="#EF4444" />
                    <stop offset="100%" stopColor="#DC2626" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.12, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <MessageCircle
                    className="w-9 h-9 text-white"
                    strokeWidth={2.6}
                    fill={isLowSms ? "#EF4444" : "#10B981"}
                  />
                </motion.div>
              </div>
            </motion.div>

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

            {/* دکمه‌ها - اصلاح شده */}
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
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end justify-center"
            onClick={() => setShowDetails(false)}
          >
            <motion.div
              initial={{ y: 80 }}
              animate={{ y: 0 }}
              exit={{ y: 80 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="bg-slate-800/95 backdrop-blur-md rounded-t-3xl w-full max-w-md max-h-[85vh] overflow-hidden border-t border-slate-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-700">
                <h3 className="text-lg font-bold text-white">جزئیات اعتبار پیامک</h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-white transition"
                  aria-label="بستن"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 space-y-4 overflow-y-auto max-h-[68vh]">
                <div className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/60">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Package className="w-7 h-7 text-blue-400" />
                      <div>
                        <p className="text-base font-bold text-white">پلن ماهانه</p>
                        <p className="text-xs text-gray-400">سهمیه ثابت (از {formatNumber(planInitialSms)})</p>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-white">{formatNumber(planSmsBalance)}</p>
                  </div>
                </div>

                {purchasedPackages.length > 0 ? (
                  <div className="space-y-3">
                    <h4 className="text-base font-semibold text-white">بسته‌های خریداری‌شده</h4>
                    {purchasedPackages.map((pkg) => {
                      const used = pkg.sms_amount - pkg.remaining_sms;
                      const usedPercentage = pkg.sms_amount > 0 ? (used / pkg.sms_amount) * 100 : 0;
                      const isExpired = pkg.expires_at && new Date(pkg.expires_at) < new Date();

                      return (
                        <div key={pkg.id} className="bg-slate-700/40 rounded-xl p-3.5 border border-slate-600/60">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="text-base font-bold text-white">{formatNumber(pkg.sms_amount)} پیامک</p>
                              <p className="text-xs text-gray-400">
                                خرید: {formatDate(pkg.valid_from || pkg.created_at)}
                              </p>
                            </div>
                            <span
                              className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                                isExpired
                                  ? "bg-red-500/20 text-red-400 border border-red-500/40"
                                  : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                              }`}
                            >
                              {isExpired ? "منقضی" : "فعال"}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-3 text-sm text-gray-300">
                            <div>
                              <span className="text-gray-500">باقیمانده:</span>
                              <p className="font-medium">{formatNumber(pkg.remaining_sms)}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">مصرف:</span>
                              <p>{usedPercentage.toFixed(0)}%</p>
                            </div>
                          </div>

                          {pkg.expires_at && (
                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                              <Calendar className="w-3 h-3" />
                              انقضا: <span className={isExpired ? "text-red-400" : ""}>{formatDate(pkg.expires_at)}</span>
                            </div>
                          )}

                          <div className="mt-3 bg-slate-600/70 rounded-full h-1.5 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${usedPercentage}%` }}
                              transition={{ duration: 0.7 }}
                              className="h-full bg-linear-to-r from-emerald-500 to-teal-500"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-10 text-sm">هیچ بسته اعتباری خریداری نشده است.</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}