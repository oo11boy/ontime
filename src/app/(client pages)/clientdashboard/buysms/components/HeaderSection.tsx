import React from "react";
import { ArrowRight } from "lucide-react"; // آیکن بازگشت مناسب برای RTL
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
    router.back(); // یا router.push('/dashboard') اگر مسیر خاصی مد نظر است
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center">
        {/* دکمه بازگشت + عنوان */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-2 rounded-full bg-white/5 border border-white/10 
                       hover:bg-white/10 active:scale-95 
                       transition-all duration-200 
                       group"
            aria-label="بازگشت"
          >
            <ArrowRight
              className="w-5 h-5 text-gray-300 
                         group-hover:text-white 
                         transition-colors"
            />
          </button>

          <h1 className="text-lg font-black text-white">شارژ پنل</h1>
        </div>

        {/* موجودی */}
        <div className="bg-white/5 px-3 py-1 rounded-full border border-white/10">
          <span className="text-[10px] text-gray-400 ml-2">موجودی:</span>
          <span className="text-sm font-bold text-blue-400">
            {currentBalance.toLocaleString("fa-IR")}
          </span>
        </div>
      </div>

      {/* تعرفه */}
      <div className="flex justify-between items-center text-[11px] bg-white/[0.02] p-2 rounded-lg">
        <span className="text-gray-500">تعرفه هر ۱۰۰ پیامک طبق پلن:</span>
        <span className="text-emerald-400 font-bold">
          {formatPrice(pricePer100)} تومان
        </span>
      </div>
    </div>
  );
};