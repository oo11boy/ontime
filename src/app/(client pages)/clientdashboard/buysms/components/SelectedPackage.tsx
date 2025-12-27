import React from "react";
import { Sparkles } from "lucide-react";

interface SelectedPackageProps {
  selected: number | null;
  pricePer100: number;
  formatPrice: (price: number) => string;
}

export const SelectedPackage: React.FC<SelectedPackageProps> = ({
  selected,
  pricePer100,
  formatPrice,
}) => {
  if (selected === null) return null;

  const totalPrice = Math.round((selected / 100) * pricePer100);

  return (
    <div className="mb-6 animate-in slide-in-from-top-4 duration-500">
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl py-3 px-5 flex items-center justify-between overflow-hidden relative">
        <div className="absolute -right-2 -top-2 opacity-10">
          <Sparkles className="w-12 h-12 text-emerald-400" />
        </div>
        
        <p className="text-xs text-emerald-200/80 font-medium">بسته انتخاب شده:</p>
        <div className="flex items-center gap-2">
          <span className="text-sm font-black text-emerald-400">
            {selected.toLocaleString("fa-IR")} پیامک
          </span>
          <div className="w-1 h-1 rounded-full bg-emerald-500/40" />
          <span className="text-sm font-black text-white">
            {formatPrice(totalPrice)} تومان
          </span>
        </div>
      </div>
    </div>
  );
};