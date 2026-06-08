// app/industries/doctors/components/DoctorComparison.tsx
"use client";

import { Check, X, Clock, Stethoscope, CalendarCheck } from "lucide-react";

const doctorComparisonData = [
  {
    title: "یادآوری نوبت ویزیت",
    oldWay: "فراموشی نوبت توسط بیمار و خالی ماندن وقت ویزیت که منجر به ضرر مالی مطب می‌شود.",
    newWay: "ارسال خودکار پیامک یادآوری هوشمند ۲۴ ساعت قبل از نوبت ویزیت به بیمار.",
    seoKeyword: "پیامک یادآوری خودکار نوبت ویزیت بیماران"
  },
  {
    title: "هماهنگی حین ویزیت",
    oldWay: "قطع مداوم کار پزشک یا منشی برای پاسخ به تماس‌های تلفنی بیماران.",
    newWay: "ثبت سریع نوبت در تقویم دیجیتال مطب، بدون نیاز به تماس تلفنی.",
    seoKeyword: "ثبت نوبت آنلاین ویزیت بدون تماس تلفنی"
  },
  {
    title: "اطلاع‌رسانی هزینه ویزیت",
    oldWay: "صرف وقت زیاد برای توضیح هزینه ویزیت به هر بیمار در تماس تلفنی.",
    newWay: "مشاهده تعرفه ویزیت توسط بیمار بلافاصله پس از ثبت نوبت از طریق لینک اختصاصی.",
    seoKeyword: "نمایش آنلاین تعرفه ویزیت پزشک"
  },
  {
    title: "هماهنگی نوبت نوبت بعدی",
    oldWay: "یادداشت نوبت روی برگه کاغذی که بیمار معمولاً آن را گم می‌کند.",
    newWay: "ثبت آنی نوبت در پنل و ارسال همزمان پیامک تایید با تاریخ و ساعت دقیق برای بیمار.",
    seoKeyword: "ثبت نوبت ویزیت با پیامک تایید فوری"
  },
  {
    title: "دسترسی به سوابق بیمار",
    oldWay: "جستجوی لابلای پرونده‌های کاغذی برای پیدا کردن سابقه ویزیت قبلی بیمار.",
    newWay: "آرشیو دیجیتال سوابق بیماران؛ تمام نسخه‌ها و یادداشت‌های درمانی همیشه در موبایل شما.",
    seoKeyword: "مدیریت سوابق ویزیت و پرونده الکترونیک بیمار"
  }
];

export default function DoctorComparison() {
  return (
    <section className="py-24 bg-slate-50" dir="rtl">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-black mb-6 text-slate-900 leading-[1.2]">
            خداحافظی با <span className="text-blue-600">دفترچه‌های کاغذی</span>
            <br />
            <span className="text-2xl lg:text-3xl text-slate-700 mt-2 block">
              با <span className="text-blue-600">نرم افزار نوبت دهی پزشکان آنتایم</span>
            </span>
          </h2>
          <p className="text-slate-600 font-bold text-lg max-w-2xl mx-auto">
            مقایسه مدیریت سنتی با <strong className="text-blue-600">سیستم هوشمند نوبت دهی تخصصی مطب پزشکان</strong>؛ تفاوت در نظم، درآمد و رضایت بیماران
          </p>
          <p className="text-slate-400 text-xs mt-4 hidden md:block">
            ★ کاهش ۸۰ درصدی کنسلی نوبت ویزیت ★ افزایش رضایت بیماران ★ صرفه‌جویی ۲۰ ساعته در ماه ★
          </p>
        </div>

        <div className="space-y-6">
          {doctorComparisonData.map((item, index) => (
            <div key={index} className="grid md:grid-cols-11 gap-4 items-center">
              {/* وضعیت قدیمی */}
              <div className="md:col-span-5 bg-white p-6 rounded-[2rem] border border-slate-200 opacity-70 grayscale hover:grayscale-0 transition-all">
                <div className="flex items-center gap-3 mb-3 text-red-500 font-black">
                  <X size={20} />
                  <span>روش سنتی (دفترچه کاغذی)</span>
                </div>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">{item.oldWay}</p>
              </div>

              {/* جداکننده میانی */}
              <div className="md:col-span-1 flex md:flex-col items-center justify-center gap-2">
                <div className="h-px md:w-px md:h-8 bg-slate-300 flex-1"></div>
                <div className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-1 rounded-md tracking-tighter uppercase">VS</div>
                <div className="h-px md:w-px md:h-8 bg-slate-300 flex-1"></div>
              </div>

              {/* وضعیت جدید آنتایم */}
              <div className="md:col-span-5 bg-blue-600 p-6 rounded-[2rem] shadow-xl shadow-blue-200">
                <div className="flex items-center gap-3 mb-3 text-white font-black">
                  <Check size={20} className="bg-white/20 rounded-full p-0.5" />
                  <span>با نرم افزار نوبت دهی پزشکان آنتایم</span>
                </div>
                <p className="text-white/90 text-sm font-bold leading-relaxed">{item.newWay}</p>
                <p className="text-white/40 text-[10px] mt-2 hidden md:block">
                  {item.seoKeyword}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 flex items-center justify-center gap-4 bg-white p-6 rounded-[2.5rem] border border-blue-100 max-w-2xl mx-auto shadow-sm">
          <div className="bg-blue-100 p-3 rounded-2xl text-blue-600">
            <Clock size={24} />
          </div>
          <p className="text-slate-700 text-sm lg:text-base font-bold leading-relaxed">
            مطب‌های پزشکی حرفه‌ای با حذف هماهنگی‌های تلفنی و استفاده از <span className="text-blue-600">سیستم نوبت دهی آنلاین مطب</span>، ماهانه <span className="text-blue-600 text-lg">بیش از ۲۰ ساعت</span> در وقت خود صرفه‌جویی می‌کنند.
          </p>
        </div>

        {/* بیلبورد اعتماد اجتماعی - تخصصی پزشکان */}
        <div className="mt-10 text-center">
          <p className="text-slate-400 text-xs font-bold">
            ★ بیش از ۴۵۰ مطب و کلینیک فعال ★ ۲۵,۰۰۰ نوبت ویزیت ثبت شده ★ ۸۰,۰۰۰ پیامک یادآوری موفق ★
          </p>
        </div>
      </div>
    </section>
  );
}