import React from "react";
import { SMSPackageCard } from "./SMSPackageCard";
import { PackageSearch } from "lucide-react"; // برای جذابیت بصری بخش خالی

interface SMSOption { count: number; }

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
      <div className="flex   flex-col items-center justify-center py-16 px-6 bg-white/[0.02] rounded-[2.5rem] border border-dashed border-white/10 group">
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
            <PackageSearch className="w-8 h-8 text-gray-600" />
        </div>
        <p className="text-gray-400 font-medium text-center">
            در حال حاضر بسته پیامکی فعالی برای نمایش وجود ندارد.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* گرادینت محو شونده برای اسکرول (UX بهتر) */}
      <div className="absolute -top-4 left-0 right-0 h-4 bg-gradient-to-t from-transparent to-[#1a1e26] z-10" />
      
      <div 
        className="grid grid-cols-1 overflow-auto gap-4   px-1 pb-8 
                   scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent
                   hover:scrollbar-thumb-white/20 transition-colors"
      >
        {smsOptions.map((option, index) => (
          <div 
            key={option.count}
            className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <SMSPackageCard
              option={option}
              isSelected={selected === option.count}
              pricePer100={pricePer100}
              defaultPrice={defaultPrice}
              loading={loading}
              formatPrice={formatPrice}
              onSelect={() => onSelectPackage(option.count)}
            />
          </div>
        ))}
      </div>

      <div className="absolute -bottom-4 left-0 right-0 h-8 bg-gradient-to-b from-transparent to-[#1a1e26] z-10" />
    </div>
  );
};