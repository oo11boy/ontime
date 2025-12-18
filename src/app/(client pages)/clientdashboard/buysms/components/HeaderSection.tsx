// components/BuySMS/HeaderSection.tsx
import React from "react";

interface HeaderSectionProps {
  pricePer100: number;
  formatPrice: (price: number) => string;
}

export const HeaderSection: React.FC<HeaderSectionProps> = ({ 
  pricePer100, 
  formatPrice 
}) => {
  return (
    <>
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-center">
        خرید پیامک اضافه
      </h1>
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