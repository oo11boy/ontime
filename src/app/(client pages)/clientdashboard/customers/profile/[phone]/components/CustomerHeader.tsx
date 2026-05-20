import React from "react";
import { Phone } from "lucide-react";

interface CustomerHeaderProps {
  customer: {
    name: string;
    phone: string;
    category: string;
    is_blocked: boolean;
    joinDate: string;
  };
  formatPhoneStr: (phone: string) => string;
  getPersianDate: (dateStr: string) => string;
}

export const CustomerHeader: React.FC<CustomerHeaderProps> = ({
  customer,
  formatPhoneStr,
  getPersianDate,
}) => {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-xl ${
              customer.is_blocked
                ? "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400"
                : "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white"
            }`}
          >
            {customer.name[0]}
          </div>
          <div className="text-right">
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">{customer.name}</h1>
            <p
              dir="ltr"
              className="text-sm text-slate-500 dark:text-gray-300 mt-1 flex flex-row-reverse items-center gap-2"
            >
              <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              {formatPhoneStr(customer.phone)}
            </p>
            <p className="text-emerald-600 dark:text-emerald-400 text-sm font-medium mt-2">
              {customer.category || "بدون دسته‌بندی"}
            </p>
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
              عضو از {getPersianDate(customer.joinDate)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};