"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Package,
  History,
  CheckCircle2,
  ReceiptText,
  Zap,
  Info,
  Hash,
} from "lucide-react"; // اضافه کردن Hash

interface PurchasedPackage {
  id: number;
  sms_amount: number;
  remaining_sms: number;
  valid_from: string;
  expires_at: string | null;
  amount_paid: number;
  created_at: string;
  ref_number?: string; // اضافه کردن این فیلد برای کد پیگیری بانکی
}

interface DashboardSmsDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  planInitialSms: number;
  planSmsBalance: number;
  purchasedPackages: PurchasedPackage[];
}

export const DashboardSmsDetailsModal: React.FC<
  DashboardSmsDetailsModalProps
> = ({
  isOpen,
  onClose,
  planInitialSms,
  planSmsBalance,
  purchasedPackages,
}) => {
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");

  const formatDate = (dateStr: string | null | undefined): string => {
    if (!dateStr) return "تاریخ نامشخص";
    try {
      const standardizedDate = dateStr.replace(" ", "T");
      const date = new Date(standardizedDate);
      if (isNaN(date.getTime())) return "تاریخ نامعتبر";
      return date.toLocaleDateString("fa-IR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "خطا در تاریخ";
    }
  };

  const formatNumber = (num: number): string => num.toLocaleString("fa-IR");

  const { activePacks, historyPacks } = useMemo(() => {
    return {
      activePacks: purchasedPackages.filter((pkg) => pkg.remaining_sms > 0),
      historyPacks: [...purchasedPackages].sort(
        (a, b) =>
          new Date(b.created_at || b.valid_from).getTime() -
          new Date(a.created_at || a.valid_from).getTime()
      ),
    };
  }, [purchasedPackages]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="bg-slate-900 border-t border-slate-700 w-full max-w-md rounded-t-[2rem] overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Zap className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-white">
                مدیریت اعتبار پیامک
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-full transition"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          {/* Tab Switcher */}
          <div className="p-1 flex gap-1 bg-slate-950/50 mx-5 mt-5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab("active")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === "active"
                  ? "bg-emerald-600 text-white shadow-lg"
                  : "text-gray-500"
              }`}
            >
              <CheckCircle2 className="w-4 h-4" /> موجودی فعلی
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === "history"
                  ? "bg-slate-700 text-white shadow-lg"
                  : "text-gray-500"
              }`}
            >
              <History className="w-4 h-4" /> تاریخچه خرید
            </button>
          </div>

          {/* Content */}
          <div className="p-5 h-[420px] overflow-y-auto custom-scrollbar">
            <AnimatePresence mode="wait">
              {activeTab === "active" ? (
                <motion.div
                  key="active-tab"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-2xl border-r-4 border-r-emerald-500 shadow-inner">
                    <p className="text-[10px] text-emerald-400 font-bold mb-1">
                      سهمیه طرح اصلی (ماهانه)
                    </p>
                    <div className="flex justify-between items-end">
                      <span className="text-gray-400 text-xs">باقیمانده:</span>
                      <span className="text-white font-black text-xl">
                        {formatNumber(planSmsBalance)}
                        <span className="text-xs text-gray-500 font-normal mr-1">
                          / {formatNumber(planInitialSms)}
                        </span>
                      </span>
                    </div>
                  </div>

                  {activePacks.length > 0 ? (
                    activePacks.map((pkg) => (
                      <div
                        key={pkg.id}
                        className="bg-slate-800/50 border border-slate-700 p-4 rounded-2xl border-r-4 border-r-blue-500 shadow-inner"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">
                            بسته افزودنی
                          </p>
                          <span className="text-[9px] text-gray-500 italic">
                            {formatDate(pkg.created_at || pkg.valid_from)}
                          </span>
                        </div>
                        <div className="flex justify-between items-end">
                          <span className="text-gray-400 text-xs">
                            اعتبار باقیمانده:
                          </span>
                          <span className="text-white font-bold text-lg">
                            {formatNumber(pkg.remaining_sms)} پیامک
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-10 text-center text-gray-600 text-xs italic bg-slate-800/20 rounded-2xl border border-dashed border-slate-700">
                      بسته افزودنی فعالی ندارید.
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="history-tab"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-3"
                >
                  {historyPacks.map((pkg) => (
                    <div
                      key={pkg.id}
                      className="bg-slate-800/30 border border-slate-800 p-4 rounded-2xl group transition-all hover:bg-slate-800/50"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-blue-500/10 transition-colors">
                            <ReceiptText className="w-4 h-4 text-gray-400 group-hover:text-blue-400" />
                          </div>
                          <div>
                            <p className="text-gray-200 text-sm font-bold">
                              {formatNumber(pkg.sms_amount)} پیامک
                            </p>
                            <p className="text-[10px] text-gray-500 mt-0.5">
                              {formatDate(pkg.created_at || pkg.valid_from)}
                            </p>
                          </div>
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-bold text-blue-400">
                            {formatNumber(pkg.amount_paid)} تومان
                          </p>
                          <div
                            className={`mt-1 inline-block px-2 py-0.5 rounded-full text-[8px] font-bold ${
                              pkg.remaining_sms > 0
                                ? "bg-emerald-500/10 text-emerald-500"
                                : "bg-gray-500/10 text-gray-500"
                            }`}
                          >
                            {pkg.remaining_sms > 0 ? "فعال" : "پایان یافته"}
                          </div>
                        </div>
                      </div>

                      {/* بخش نمایش کد پیگیری */}
                      <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Hash className="w-3 h-3 text-gray-600" />
                          <span className="text-[10px] text-gray-500">
                            کد پیگیری:
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-gray-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                          {pkg.ref_number || "تراکنش رایگان/سیستمی"}
                        </span>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Info */}
          <div className="p-4 bg-slate-950/80 flex items-center justify-center gap-2 border-t border-slate-800">
            <Info className="w-3 h-3 text-gray-500" />
            <p className="text-[10px] text-gray-500">
              کدهای پیگیری برای استعلام از درگاه بانکی معتبر هستند.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
