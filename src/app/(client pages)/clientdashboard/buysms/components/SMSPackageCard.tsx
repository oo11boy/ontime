import React from "react";

interface SMSPackageCardProps {
  option: { count: number };
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
  onSelect 
}) => {
  const totalPrice = Math.round((option.count / 100) * pricePer100);

  return (
    <div
      onClick={onSelect}
      className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
        isSelected 
          ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/5 ring-1 ring-emerald-500" 
          : "border-slate-200 dark:border-white/5 bg-white dark:bg-white/[0.03] hover:bg-slate-50 dark:hover:bg-white/[0.05]"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${isSelected ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-slate-300 dark:bg-white/10"}`} />
        <span className="text-sm font-bold tracking-tight text-slate-800 dark:text-white">
          {option.count.toLocaleString("fa-IR")} پیامک
        </span>
      </div>
      <div className="text-left">
        <span className="text-sm font-black text-slate-800 dark:text-white">
          {totalPrice.toLocaleString("fa-IR")}
        </span>
        <span className="text-[10px] text-slate-500 dark:text-gray-500 mr-1 text-xs">تومان</span>
      </div>
    </div>
  );
};