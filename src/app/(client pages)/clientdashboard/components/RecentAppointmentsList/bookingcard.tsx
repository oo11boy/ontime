import React from "react";

const BookingCard = () => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-5 mb-5 w-full mx-auto border-r-4 border-emerald-500 hover:shadow-xl transition-shadow duration-300">
      
      {/* Header Section */}
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-dashed border-gray-200">
        <div className="flex items-center">
          {/* آواتار - فقط رنگ رو هماهنگ کردیم */}
          <div className="bg-emerald-100 text-emerald-700 w-12 h-12 rounded-full flex justify-center items-center text-lg font-bold ml-3">
            د
          </div>
          
          {/* اطلاعات دکتر - اندازه متن دقیقاً مثل قبل */}
          <div className="text-right">
            <div className="text-base font-semibold text-gray-800">
              رضا احمدی
            </div>
            <div className="text-sm text-gray-500">
              09354502369
            </div>
          </div>
        </div>
        
   
      </div>

      {/* Body Section */}
      <div className="mb-4 pb-2 text-right">
        {/* تاریخ و ساعت - اندازه متن دقیقاً مثل قبل */}
        <div className="flex items-center text-text-xs text-gray-600 mb-2">
          <span className="ml-2 text-yellow-500 text-xs">تقویم</span>
          <span className="text-xs">چهارشنبه، ۳۰ آبان</span>
          
          <span className="mr-4 ml-2 text-yellow-500 text-base">ساعت</span>
          <span className="text-xs">ساعت ۱۱:۰۰ صبح</span>
        </div>
        
        {/* یادداشت */}
        <div className="text-sm text-gray-600 mt-1">
          <span className="font-medium">یادداشت:</span> اصلاح ریش و اصلاح مو
        </div>
      </div>

      {/* Actions Section */}
      <div className="flex justify-end items-center pt-3 border-t border-dashed border-gray-200 gap-3">
        {/* دکمه لغو */}
        <button className="bg-red-100 text-red-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors">
          لغو نوبت
        </button>
        
        {/* دکمه مشاهده - فقط رنگ رو سبز تم کردیم */}
        <button className="bg-linear-to-r from-emerald-500 to-emerald-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:from-emerald-600 hover:to-emerald-700 transition-colors">
          مشاهده پروفایل
        </button>
      </div>
    </div>
  );
};

export default BookingCard;