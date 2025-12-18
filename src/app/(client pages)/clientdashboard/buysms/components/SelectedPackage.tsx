// components/BuySMS/SelectedPackage.tsx
import React from "react";

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
    <div className="mb-8 text-center bg-white/5 rounded-2xl py-4 px-6">
      <p className="text-lg">
        بسته انتخاب‌شده:{" "}
        <span className="font-bold text-emerald-400">
          {selected.toLocaleString("fa-IR")} پیامک
        </span>
        {" — "}
        <span className="font-bold text-emerald-400">
          {formatPrice(totalPrice)} تومان
        </span>
      </p>
    </div>
  );
};