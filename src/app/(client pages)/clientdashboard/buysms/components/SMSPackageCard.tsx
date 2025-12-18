// components/BuySMS/SMSPackageCard.tsx
import React from "react";

interface SMSPackageCardProps {
  option: {
    count: number;
  };
  isSelected: boolean;
  pricePer100: number;
  defaultPrice: number;
  loading: boolean;
  formatPrice: (price: number) => string;
  onSelect: () => void;
}

export const SMSPackageCard: React.FC<SMSPackageCardProps> = ({
  option,
  isSelected,
  pricePer100,
  defaultPrice,
  loading,
  formatPrice,
  onSelect,
}) => {
  const totalPrice = Math.round((option.count / 100) * pricePer100);
  const hasDiscount = pricePer100 < defaultPrice;
  const discountPercentage = hasDiscount
    ? Math.round(((defaultPrice - pricePer100) / defaultPrice) * 100)
    : 0;

  return (
    <div
      onClick={() => !loading && onSelect()}
      className={`relative cursor-pointer rounded-3xl p-6 flex flex-col items-center gap-4 text-center transition-all border-2 ${
        isSelected
          ? "border-emerald-500 shadow-2xl shadow-emerald-500/30 bg-white/10 scale-105"
          : "border-white/10 hover:border-emerald-500/60 hover:shadow-xl hover:bg-white/5"
      } ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
    >
      {isSelected && (
        <div className="absolute top-4 right-4 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      )}

      <div className="text-2xl font-bold">
        {option.count.toLocaleString("fa-IR")} پیامک
      </div>

      <div className="text-3xl font-bold text-white">
        {formatPrice(totalPrice)}
      </div>

      <div className="text-sm text-gray-400">تومان</div>

      {hasDiscount && (
        <div className="text-xs text-emerald-400 mt-1">
          تخفیف‌دار ({discountPercentage}%)
        </div>
      )}

      <div className="text-xs text-gray-500 mt-6">
        اعتبار: ۳۰ روز از تاریخ خرید
      </div>
    </div>
  );
};