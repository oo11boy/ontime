import React from "react";
import { CheckCircle2, Crown } from "lucide-react";

interface SMSPackageCardProps {
  option: { count: number };
  isSelected: boolean;
  pricePer100: number;
  defaultPrice: number;
  loading: boolean;
  formatPrice: (price: number) => string;
  onSelect: () => void;
}
export const SMSPackageCard: React.FC<SMSPackageCardProps> = ({ option, isSelected, pricePer100, onSelect }) => {
  const totalPrice = Math.round((option.count / 100) * pricePer100);

  return (
    <div
      onClick={onSelect}
      className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
        isSelected 
          ? "border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500" 
          : "border-white/5 bg-white/[0.03]"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${isSelected ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-white/10"}`} />
        <span className="text-sm font-bold tracking-tight">{option.count.toLocaleString("fa-IR")} پیامک</span>
      </div>
      <div className="text-left">
        <span className="text-sm font-black">{totalPrice.toLocaleString("fa-IR")}</span>
        <span className="text-[10px] text-gray-500 mr-1 text-xs">تومان</span>
      </div>
    </div>
  );
};