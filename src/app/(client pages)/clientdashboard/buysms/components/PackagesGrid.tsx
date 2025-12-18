// components/BuySMS/PackagesGrid.tsx
import React from "react";
import { SMSPackageCard } from "./SMSPackageCard";

interface SMSOption {
  count: number;
}

interface PackagesGridProps {
  smsOptions: SMSOption[];
  selected: number | null;
  pricePer100: number;
  defaultPrice: number;
  loading: boolean;
  formatPrice: (price: number) => string;
  onSelectPackage: (count: number) => void;
}

export const PackagesGrid: React.FC<PackagesGridProps> = ({
  smsOptions,
  selected,
  pricePer100,
  defaultPrice,
  loading,
  formatPrice,
  onSelectPackage,
}) => {
  if (smsOptions.length === 0) {
    return (
      <div className="col-span-1 sm:col-span-2 text-center text-gray-500 p-8">
        بسته پیامکی فعالی برای خرید در دسترس نیست.
      </div>
    );
  }

  return (
    <>
      {smsOptions.map((option) => (
        <SMSPackageCard
          key={option.count}
          option={option}
          isSelected={selected === option.count}
          pricePer100={pricePer100}
          defaultPrice={defaultPrice}
          loading={loading}
          formatPrice={formatPrice}
          onSelect={() => onSelectPackage(option.count)}
        />
      ))}
    </>
  );
};