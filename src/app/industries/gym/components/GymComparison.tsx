// app/industries/gym/components/GymComparison.tsx
"use client";

import { Check, X, Clock, Dumbbell, CalendarCheck } from "lucide-react";

const gymComparisonData = [
  {
    title: "یادآوری جلسه تمرینی",
    oldWay: "فراموشی نوبت کلاس توسط عضو و خالی ماندن جای تمرین که منجر به ضرر مالی باشگاه می‌شود.",
    newWay: "ارسال خودکار پیامک یادآوری هوشمند ۲۴ ساعت قبل از جلسه تمرینی به عضو.",
    seoKeyword: "پیامک یادآوری خودکار جلسات تمرینی باشگاه"
  },
  {
    title: "هماهنگی حین تمرین",
    oldWay: "قطع مداوم تمرین مربی برای پاسخ به تماس‌های تلفنی اعضا برای رزرو کلاس.",
    newWay: "ثبت سریع نوبت در تقویم دیجیتال باشگاه، بدون نیاز به تماس تلفنی.",
    seoKeyword: "رزرو آنلاین کلاس ورزشی بدون تماس تلفنی"
  },
  {
    title: "اطلاع‌رسانی هزینه کلاس‌ها",
    oldWay: "صرف وقت زیاد برای توضیح هزینه هر جلسه به اعضا در تماس تلفنی یا پیامک.",
    newWay: "مشاهده تعرفه کلاس‌ها توسط عضو بلافاصله پس از ثبت نوبت از طریق لینک اختصاصی.",
    seoKeyword: "نمایش آنلاین تعرفه کلاس‌های ورزشی"
  },
  {
    title: "هماهنگی نوبت جلسه بعدی",
    oldWay: "یادداشت نوبت روی کاغذ که عضو معمولاً آن را گم می‌کند یا فراموش می‌شود.",
    newWay: "ثبت آنی نوبت در پنل و ارسال همزمان پیامک تایید با تاریخ و ساعت دقیق برای عضو.",
    seoKeyword: "ثبت نوبت کلاس ورزشی با پیامک تایید فوری"
  },
  {
    title: "دسترسی به سوابق تمرین",
    oldWay: "جستجوی لابلای دفترچه‌های کاغذی برای پیدا کردن سابقه تمرین و رکوردهای عضو.",
    newWay: "آرشیو دیجیتال سوابق اعضا؛ تمام برنامه‌های تمرینی و رکوردها همیشه در موبایل شما.",
    seoKeyword: "مدیریت سوابق تمرین و پرونده الکترونیک اعضای باشگاه"
  }
];

export default function GymComparison() {
  return (
    <section className="py-16 md:py-20 lg:py-24 bg-slate-50" dir="rtl">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-4 md:mb-6 text-slate-900 leading-[1.2]">
            خداحافظی با <span className="text-emerald-600">دفترچه‌های کاغذی</span>
            <br />
            <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-slate-700 mt-2 block">
              با <span className="text-emerald-600">نرم افزار نوبت دهی باشگاه آنتایم</span>
            </span>
          </h2>
          <p className="text-slate-600 font-bold text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
            مقایسه مدیریت سنتی با <strong className="text-emerald-600">سیستم هوشمند نوبت دهی تخصصی باشگاه ورزشی</strong>؛ تفاوت در نظم، درآمد و رضایت اعضا
          </p>
          <p className="text-slate-400 text-[10px] sm:text-xs mt-3 md:mt-4 hidden md:block">
            ★ کاهش ۸۰ درصدی کنسلی کلاس‌های ورزشی ★ افزایش رضایت اعضا ★ صرفه‌جویی ۲۰ ساعته در ماه ★
          </p>
        </div>

        <div className="space-y-4 md:space-y-6">
          {gymComparisonData.map((item, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-11 gap-3 md:gap-4 items-center">
              <div className="md:col-span-5 bg-white p-4 md:p-6 rounded-xl md:rounded-[2rem] border border-slate-200 opacity-70 grayscale hover:grayscale-0 transition-all">
                <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3 text-red-500 font-black">
                  <X size={16} className="md:w-5 md:h-5" />
                  <span className="text-xs md:text-sm">روش سنتی (دفترچه کاغذی)</span>
                </div>
                <p className="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed">{item.oldWay}</p>
              </div>

              <div className="md:col-span-1 flex md:flex-col items-center justify-center gap-1 md:gap-2">
                <div className="h-px md:w-px md:h-8 bg-slate-300 flex-1"></div>
                <div className="text-[8px] md:text-[10px] font-black text-slate-400 bg-slate-100 px-1.5 md:px-2 py-0.5 md:py-1 rounded-md tracking-tighter uppercase">VS</div>
                <div className="h-px md:w-px md:h-8 bg-slate-300 flex-1"></div>
              </div>

              <div className="md:col-span-5 bg-emerald-600 p-4 md:p-6 rounded-xl md:rounded-[2rem] shadow-xl shadow-emerald-200">
                <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3 text-white font-black">
                  <Check size={16} className="md:w-5 md:h-5 bg-white/20 rounded-full p-0.5" />
                  <span className="text-xs md:text-sm">با نرم افزار نوبت دهی باشگاه آنتایم</span>
                </div>
                <p className="text-white/90 text-xs sm:text-sm font-bold leading-relaxed">{item.newWay}</p>
                <p className="text-white/40 text-[8px] md:text-[10px] mt-2 hidden md:block">
                  {item.seoKeyword}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 md:mt-16 flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 bg-white p-4 md:p-6 rounded-xl md:rounded-[2.5rem] border border-emerald-100 max-w-2xl mx-auto shadow-sm">
          <div className="bg-emerald-100 p-2 md:p-3 rounded-xl md:rounded-2xl text-emerald-600">
            <Clock size={20} className="md:w-6 md:h-6" />
          </div>
          <p className="text-slate-700 text-xs sm:text-sm md:text-base font-bold leading-relaxed text-center sm:text-right">
            باشگاه‌های حرفه‌ای با حذف هماهنگی‌های تلفنی و استفاده از <span className="text-emerald-600">سیستم نوبت دهی آنلاین باشگاه</span>، ماهانه <span className="text-emerald-600 text-base md:text-lg">بیش از ۲۰ ساعت</span> در وقت خود صرفه‌جویی می‌کنند.
          </p>
        </div>

        <div className="mt-8 md:mt-10 text-center">
          <p className="text-slate-400 text-[9px] sm:text-[10px] md:text-xs font-bold">
            ★ بیش از ۳۲۰ باشگاه فعال ★ ۱۸,۰۰۰ نوبت کلاس ثبت شده ★ ۵۵,۰۰۰ پیامک یادآوری موفق ★
          </p>
        </div>
      </div>
    </section>
  );
}