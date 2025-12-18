// src/app/(client pages)/clientdashboard/components/DashboardPackageItem.tsx
import React from "react";
import { Calendar } from "lucide-react";
import { motion } from "framer-motion";

interface Package {
  id: number;
  sms_amount: number;
  remaining_sms: number;
  valid_from: string;
  expires_at: string;
  amount_paid: number;
  created_at: string;
}

interface DashboardPackageItemProps {
  package: Package;
}

const formatNumber = (num: number): string => {
  return num.toLocaleString("fa-IR");
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleString("fa-IR", { year: "numeric", month: "long", day: "numeric" });
};

export const DashboardPackageItem: React.FC<DashboardPackageItemProps> = ({ package: pkg }) => {
  const used = pkg.sms_amount - pkg.remaining_sms;
  const usedPercentage = pkg.sms_amount > 0 ? (used / pkg.sms_amount) * 100 : 0;
  const isExpired = pkg.expires_at && new Date(pkg.expires_at) < new Date();

  return (
    <div className="bg-slate-700/40 rounded-xl p-3.5 border border-slate-600/60">
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
};