import React from 'react';

// کامپوننت بدون دریافت هیچ پراپی تعریف شده است
const BookingCard = () => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-5 mb-5 w-full mx-auto border-r-4 border-blue-500 hover:shadow-xl transition-shadow duration-300">
      
      {/* Header Section */}
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-dashed border-gray-200">
        <div className="flex items-center">
          {/* Doctor Avatar */}
          {/* آواتار: اولین حرف نام دکتر را به صورت ثابت قرار می‌دهیم */}
          <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-full flex justify-center items-center text-lg font-bold ml-3">
            د
          </div>
          {/* Doctor Info (Hardcoded) */}
          <div className="text-right">
            <div className="text-base font-semibold text-gray-800">
             رضا احمدی
            </div>
            <div className="text-sm text-gray-500">
             09354502369
            </div>
          </div>
        </div>
        {/* Location Icon */}
        <div className="text-xl text-green-500">
          📍
        </div>
      </div>

      {/* Body Section */}
      <div className="mb-4 pb-2 text-right">
        {/* Date and Time (Hardcoded) */}
        <div className="flex items-center text-sm text-gray-600 mb-2">
          {/* Date */}
          <span className="ml-2 text-yellow-500 text-base">📅</span>
          <span>چهارشنبه، ۳۰ آبان</span>
          {/* Time */}
          <span className="mr-4 ml-2 text-yellow-500 text-base">🕒</span>
          <span>ساعت ۱۱:۰۰ صبح</span>
        </div>
        {/* Location Text (Hardcoded) */}
        <div className="text-sm text-gray-600 mt-1">
          <span className="font-medium">یادداشت:</span> اصلاح ریش و اصلاح مو
        </div>
      </div>

      {/* Actions Section */}
      <div className="flex justify-end items-center pt-3 border-t border-dashed border-gray-200 gap-3">

        {/* Cancel Button */}
        <button
          className="bg-red-100 text-red-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
        >
          لغو نوبت
        </button>
        {/* Details Button */}
        <button
          className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          مشاهده پروفایل
        </button>
      </div>
    </div>
  );
};

export default BookingCard;