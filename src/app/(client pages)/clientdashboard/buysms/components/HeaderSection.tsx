import React from "react";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface HeaderSectionProps {
  pricePer100: number;
  formatPrice: (price: number) => string;
  currentBalance: number;
}

export const HeaderSection: React.FC<HeaderSectionProps> = ({
  pricePer100,
  formatPrice,
  currentBalance,
}) => {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-2 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 
                       hover:bg-slate-200 dark:hover:bg-white/10 active:scale-95 
                       transition-all duration-200 group"
            aria-label="بازگشت"
          >
            <ArrowRight
              className="w-5 h-5 text-slate-500 dark:text-gray-300 
                         group-hover:text-slate-700 dark:group-hover:text-white 
                         transition-colors"
            />
          </button>

          <h1 className="text-lg font-black text-slate-800 dark:text-white">شارژ پنل</h1>
        </div>

        <div className="bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-full border border-slate-200 dark:border-white/10">
          <span className="text-[10px] text-slate-500 dark:text-gray-400 ml-2">موجودی:</span>
          <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
            {currentBalance.toLocaleString("fa-IR")}
          </span>
        </div>
      </div>

      <div className="flex justify-between items-center text-[11px] bg-slate-100 dark:bg-white/[0.02] p-2 rounded-lg">
        <span className="text-slate-500 dark:text-gray-500">تعرفه هر ۱۰۰ پیامک طبق پلن:</span>
        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
          {formatPrice(pricePer100)} تومان
        </span>
      </div>
    </div>
  );
};