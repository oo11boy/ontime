// app/industries/custom-booking-page/components/CustomBookingSteps.tsx
"use client";

import { UserPlus, Settings2, Share2, Sparkles, Clock } from "lucide-react";

const steps = [
  { 
    title: "ثبت‌نام در آنتایم", 
    desc: "با شماره موبایل خود ثبت‌نام کنید و اطلاعات اولیه کسب‌وکارتان را وارد کنید.", 
    time: "کمتر از ۱ دقیقه",
    seoDesc: "ثبت‌نام سریع و ساخت صفحه اختصاصی نوبت دهی",
    icon: <UserPlus size={32} /> 
  },
  { 
    title: "تنظیم اطلاعات صفحه", 
    desc: "نام بیزنس، آدرس، شماره تماس، لوگو، گالری نمونه کار، خدمات و قیمت‌ها را وارد کنید.", 
    time: "۲ تا ۳ دقیقه",
    seoDesc: "تنظیم کامل اطلاعات کسب و کار در صفحه اختصاصی",
    icon: <Settings2 size={32} /> 
  },
  { 
    title: "دریافت لینک اختصاصی", 
    desc: "صفحه شما ساخته می‌شود و لینک اختصاصی یکتا در اختیارتان قرار می‌گیرد.", 
    time: "فوری",
    seoDesc: "دریافت لینک اختصاصی نوبت دهی",
    icon: <Share2 size={32} /> 
  },
  { 
    title: "شروع دریافت نوبت", 
    desc: "لینک را در اینستاگرام، واتساپ یا وبسایت خود قرار دهید و شروع به دریافت نوبت آنلاین کنید.", 
    time: "همین الان",
    seoDesc: "دریافت نوبت آنلاین از طریق لینک اختصاصی",
    icon: <Sparkles size={32} /> 
  }
];

export default function CustomBookingSteps() {
  return (
    <section className="py-16 md:py-20 lg:py-24 bg-slate-950 text-white relative overflow-hidden" dir="rtl">
      <div className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none">
        <div className="absolute top-[20%] -right-[5%] w-[35%] h-[35%] bg-blue-600 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[20%] -left-[5%] w-[30%] h-[30%] bg-pink-600 blur-[120px] rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-10 md:mb-16 lg:mb-20">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-4 md:mb-6 leading-tight">
            ساخت صفحه اختصاصی در{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400">
              ۴ مرحله ساده
            </span>
          </h2>
          <p className="text-slate-400 font-medium max-w-2xl mx-auto text-sm sm:text-base">
            بدون نیاز به دانش فنی و در کمتر از ۵ دقیقه صفحه اختصاصی خود را بسازید
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-12 relative">
          {steps.map((step, i) => (
            <div key={i} className="group text-center relative z-10">
              <div className="inline-block bg-slate-800 text-blue-400 text-[10px] font-black px-3 md:px-4 py-1.5 rounded-full border border-slate-700 mb-4 md:mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                مرحله { (i + 1).toLocaleString('fa-IR') }
              </div>
              
              <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-900 border-2 border-slate-800 rounded-2xl md:rounded-[2.5rem] flex items-center justify-center mx-auto mb-5 md:mb-8 shadow-2xl group-hover:border-blue-500/50 group-hover:shadow-blue-500/20 transition-all duration-500 group-hover:-rotate-6">
                <div className="text-blue-500 group-hover:scale-110 transition-transform duration-500">
                  {step.icon}
                </div>
              </div>
              
              <h3 className="text-base md:text-xl lg:text-2xl font-black mb-2 md:mb-3 group-hover:text-blue-400 transition-colors">
                {step.title}
              </h3>
              
              <div className="flex items-center justify-center gap-1 text-emerald-400 text-[10px] sm:text-xs mb-2 md:mb-3">
                <Clock size={12} />
                <span>{step.time}</span>
              </div>
              
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed font-medium px-2">
                {step.desc}
              </p>
              <p className="text-slate-600 text-[10px] sm:text-xs mt-3 hidden md:block">
                {step.seoDesc}
              </p>
            </div>
          ))}

          <div className="hidden lg:block absolute top-1/3 left-[12%] right-[12%] h-[1px] bg-gradient-to-r from-transparent via-slate-700 to-transparent -z-0"></div>
        </div>
      </div>
    </section>
  );
}