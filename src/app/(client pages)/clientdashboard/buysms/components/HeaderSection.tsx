import React from "react";
import { MessageSquareQuote } from "lucide-react"; // اگر از لوساید استفاده می‌کنید برای زیبایی

interface HeaderSectionProps {
  pricePer100: number;
  formatPrice: (price: number) => string;
  currentBalance: number; // 👈 اضافه شدن موجودی فعلی
}

export const HeaderSection: React.FC<HeaderSectionProps> = ({ 
  pricePer100, 
  formatPrice,
  currentBalance
}) => {
  return (
    <>
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-center">
        خرید پیامک اضافه
      </h1>

      {/* بخش نمایش موجودی فعلی که با خرید آپدیت می‌شود */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
            <MessageSquareQuote className="w-5 h-5 text-blue-400" />
          </div>
          <span className="text-sm text-gray-300">موجودی فعلی شما:</span>
        </div>
        <div className="text-right">
          <span className="text-xl font-bold text-white">
            {currentBalance.toLocaleString("fa-IR")}
          </span>
          <span className="text-xs text-gray-400 mr-1">پیامک</span>
        </div>
      </div>

      <div className="mb-8 text-center">
        <p className="text-sm text-gray-400">
          قیمت هر ۱۰۰ پیامک بر اساس پلن شما:
        </p>
        <p className="text-2xl font-bold text-emerald-400">
          {formatPrice(pricePer100)} تومان
        </p>
      </div>
    </>
  );
};