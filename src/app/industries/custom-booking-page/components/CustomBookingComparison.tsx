// app/industries/custom-booking-page/components/CustomBookingComparison.tsx
"use client";

import { Check, X, Clock, Smartphone, Globe, CalendarCheck } from "lucide-react";

const comparisonData = [
  {
    title: "داشتن صفحه اختصاصی",
    oldWay: "نداشتن صفحه اختصاصی - مشتریان از طریق پیج اینستاگرام یا تماس تلفنی اقدام می‌کنند.",
    newWay: "صفحه اختصاصی کامل با لینک یکتا برای کسب‌وکار شما",
    seoKeyword: "صفحه اختصاصی نوبت دهی با لینک یکتا"
  },
  {
    title: "مشاهده قیمت خدمات قبل از رزرو",
    oldWay: "مشتری باید تماس بگیرد و قیمت خدمات را بپرسد - وقت گیر برای هر دو طرف.",
    newWay: "لیست کامل خدمات با قیمت و زمان در صفحه نمایش داده می‌شود.",
    seoKeyword: "نمایش قیمت خدمات قبل از رزرو نوبت"
  },
  {
    title: "گالری نمونه کارها",
    oldWay: "مشتری باید به اینستاگرام شما مراجعه کند یا تصاویر را جداگانه ببیند.",
    newWay: "گالری اختصاصی نمونه کارها در صفحه نوبت‌دهی شما",
    seoKeyword: "نمایش نمونه کارها در صفحه نوبت دهی"
  },
  {
    title: "مدیریت نوبت توسط مشتری",
    oldWay: "مشتری باید تماس بگیرد و درخواست تغییر یا لغو نوبت بدهد.",
    newWay: "تغییر و لغو نوبت آنلاین توسط مشتری با ذکر دلیل",
    seoKeyword: "تغییر و لغو نوبت آنلاین توسط مشتری"
  },
  {
    title: "نظرات و امتیازدهی",
    oldWay: "مشتری در فضای مجازی نظر می‌دهد که ممکن است دیده نشود.",
    newWay: "سیستم نظردهی و امتیازدهی یکپارچه در صفحه اختصاصی شما",
    seoKeyword: "نظرات و امتیازدهی مشتریان در صفحه نوبت دهی"
  }
];

export default function CustomBookingComparison() {
  return (
    <section className="py-16 md:py-20 lg:py-24 bg-slate-50" dir="rtl">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-4 md:mb-6 text-slate-900 leading-[1.2]">
            روش سنتی در مقابل{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-pink-600">
              صفحه اختصاصی آنتایم
            </span>
          </h2>
          <p className="text-slate-600 font-bold text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
            مقایسه روش قدیمی مدیریت نوبت با صفحه اختصاصی هوشمند آنتایم
          </p>
        </div>

        <div className="space-y-4 md:space-y-6">
          {comparisonData.map((item, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-11 gap-3 md:gap-4 items-center">
              {/* روش سنتی */}
              <div className="md:col-span-5 bg-white p-4 md:p-6 rounded-xl md:rounded-[2rem] border border-slate-200 opacity-70 grayscale hover:grayscale-0 transition-all">
                <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3 text-red-500 font-black">
                  <X size={16} className="md:w-5 md:h-5" />
                  <span className="text-xs md:text-sm">روش سنتی</span>
                </div>
                <p className="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed">{item.oldWay}</p>
              </div>

              {/* جداکننده */}
              <div className="md:col-span-1 flex md:flex-col items-center justify-center gap-1 md:gap-2">
                <div className="h-px md:w-px md:h-8 bg-slate-300 flex-1"></div>
                <div className="text-[8px] md:text-[10px] font-black text-slate-400 bg-slate-100 px-1.5 md:px-2 py-0.5 md:py-1 rounded-md tracking-tighter uppercase">VS</div>
                <div className="h-px md:w-px md:h-8 bg-slate-300 flex-1"></div>
              </div>

              {/* صفحه اختصاصی آنتایم */}
              <div className="md:col-span-5 bg-gradient-to-r from-blue-600 to-pink-600 p-4 md:p-6 rounded-xl md:rounded-[2rem] shadow-xl shadow-blue-200">
                <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3 text-white font-black">
                  <Check size={16} className="md:w-5 md:h-5 bg-white/20 rounded-full p-0.5" />
                  <span className="text-xs md:text-sm">صفحه اختصاصی آنتایم</span>
                </div>
                <p className="text-white/90 text-xs sm:text-sm font-bold leading-relaxed">{item.newWay}</p>
                <p className="text-white/40 text-[8px] md:text-[10px] mt-2 hidden md:block">
                  {item.seoKeyword}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 md:mt-16 flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 bg-white p-4 md:p-6 rounded-xl md:rounded-[2.5rem] border border-blue-100 max-w-2xl mx-auto shadow-sm">
          <div className="bg-blue-100 p-2 md:p-3 rounded-xl md:rounded-2xl text-blue-600">
            <Clock size={20} className="md:w-6 md:h-6" />
          </div>
          <p className="text-slate-700 text-xs sm:text-sm md:text-base font-bold leading-relaxed text-center sm:text-right">
            کسب‌وکارهای حرفه‌ای با ساخت صفحه اختصاصی، ماهانه <span className="text-blue-600 text-base md:text-lg">بیش از ۳۰ ساعت</span> در وقت خود صرفه‌جویی می‌کنند.
          </p>
        </div>
      </div>
    </section>
  );
}