import React from "react";
import { PlusIcon, Star, MessageCirclePlus } from "lucide-react"; // این آیکون‌ها در حال حاضر استفاده نمی‌شوند

export default function Buttons() {
  return (
    <>
      {/* دکمه افزودن نوبت - مدرن و جذاب و ریسپانسیو */}
      <div 
        className="
          py-3 sm:py-4            /* تنظیم فاصله عمودی: 3 در موبایل، 4 در صفحات بزرگتر */
          font-semibold 
          w-full 
          mt-4 
          rounded-xl sm:rounded-2xl /* کمی گردی کمتر در موبایل */
          text-white 
          gap-3 sm:gap-4            /* تنظیم فاصله بین آیکون و متن */
          flex 
          justify-center 
          bg-[#34D399] 
          items-center 
          cursor-pointer            /* برای حس بهتر دکمه */
          transition-all duration-200 hover:bg-[#10B981] /* افکت هاور برای تعامل بهتر */
        "
      >
        {/* اندازه آیکون: 32 در موبایل، 40 در صفحات بزرگتر */}
        <PlusIcon color="black" size={32} className="sm:size-40"/> 
        
        {/* اندازه متن: 16px (base) در موبایل، 20px (xl) در صفحات بزرگتر */}
        <span className="font-semibold text-base sm:text-xl text-background">
          افزودن نوبت جدید
        </span>
      </div>
    </>
  );
}