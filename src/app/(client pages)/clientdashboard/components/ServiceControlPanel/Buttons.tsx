import React from "react";
import { PlusIcon, Star, MessageCirclePlus } from "lucide-react"; // این آیکون‌ها در حال حاضر استفاده نمی‌شوند

export default function Buttons() {
  return (
    <>
      <div
        className="
h-15
          py-3 sm:py-4         
          font-semibold 
          w-full 
          mt-4 
          rounded-xl sm:rounded-2xl 
          text-white 
          gap-3 sm:gap-4           
          flex 
          justify-center 
          bg-[#34D399] 
          items-center 
          cursor-pointer           
          transition-all duration-200 hover:bg-[#10B981]
        "
      >
    
        <PlusIcon color="black" size={50}  />

        <span className="font-semibold text-base sm:text-xl text-background">
          افزودن نوبت جدید
        </span>
      </div>
    </>
  );
}
