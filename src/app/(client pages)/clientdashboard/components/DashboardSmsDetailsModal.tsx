// src/app/(client pages)/clientdashboard/components/DashboardSmsDetailsModal.tsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Package, Calendar } from "lucide-react";
import { DashboardPackageItem } from "./DashboardPackageItem";

interface PurchasedPackage {
  id: number;
  sms_amount: number;
  remaining_sms: number;
  valid_from: string;
  expires_at: string;
  amount_paid: number;
  created_at: string;
}

interface DashboardSmsDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  planInitialSms: number;
  planSmsBalance: number;
  purchasedPackages: PurchasedPackage[];
}

const formatNumber = (num: number): string => {
  return num.toLocaleString("fa-IR");
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleString("fa-IR", { year: "numeric", month: "long", day: "numeric" });
};

export const DashboardSmsDetailsModal: React.FC<DashboardSmsDetailsModalProps> = ({
  isOpen,
  onClose,
  planInitialSms,
  planSmsBalance,
  purchasedPackages,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end justify-center"
          onClick={onClose}
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
                onClick={onClose}
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
                  {purchasedPackages.map((pkg) => (
                    <DashboardPackageItem key={pkg.id} package={pkg} />
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-10 text-sm">هیچ بسته اعتباری خریداری نشده است.</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};