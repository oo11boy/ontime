// app/industries/gym/components/GymStepFlow.tsx
"use client";

import { UserPlus, Settings2, CalendarRange, Dumbbell } from "lucide-react";

const gymSteps = [
  { 
    title: "ثبت‌نامه باشگاه و مربیان", 
    desc: "با شماره همراه خود ثبت‌نام کنید و نام باشگاه و لیست مربیان را وارد کنید.", 
    seoDesc: "فعال سازی پنل مدیریت نوبت کلاس‌های ورزشی در کمتر از ۲ دقیقه",
    icon: <UserPlus size={32} /> 
  },
  { 
    title: "تنظیم کلاس‌ها و شیفت مربیان", 
    desc: "زمان دقیق هر کلاس ورزشی (مثلاً ۶۰ دقیقه بدنسازی) را تعیین کرده و ساعت حضور مربیان را مشخص کنید.", 
    seoDesc: "ثبت تخصصی شیفت کاری مربیان و زمان کلاس‌ها در نرم افزار نوبت دهی باشگاه",
    icon: <Settings2 size={32} /> 
  },
  { 
    title: "ثبت نوبت و ارسال پیامک یادآوری", 
    desc: "نوبت عضو را در تقویم تخصصی باشگاه ثبت کنید؛ پیامک تایید و یادآوری خودکار جلسه تمرینی برای عضو ارسال می‌شود.", 
    seoDesc: "ارسال خودکار پیامک یادآوری جلسات تمرینی و کاهش ۸۰ درصدی کنسلی",
    icon: <CalendarRange size={32} /> 
  }
];

export default function GymStepFlow() {
  return (
    <section className="py-16 md:py-20 lg:py-24 bg-slate-950 text-white relative overflow-hidden" dir="rtl">
      <div className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none">
        <div className="absolute top-[20%] -right-[5%] w-[35%] h-[35%] bg-emerald-600 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[20%] -left-[5%] w-[30%] h-[30%] bg-teal-600 blur-[120px] rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-10 md:mb-16 lg:mb-20">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-4 md:mb-6 leading-tight">
            شروع کار با <span className="text-emerald-500">نرم افزار نوبت دهی باشگاه آنتایم</span> چقدر ساده است؟
          </h2>
          <p className="text-slate-400 font-medium max-w-2xl mx-auto text-sm sm:text-base">
            آنتایم به گونه‌ای طراحی شده که حتی بدون دانش فنی، بتوانید در کمتر از ۲ دقیقه تمام نوبت‌های 
            <strong className="text-white"> کلاس‌های ورزشی</strong> خود را به صورت دیجیتال مدیریت کنید.
            <br />
            <span className="text-emerald-400 text-xs sm:text-sm block mt-2">★ ۲ هفته رایگان ★ بدون نیاز به کارت بانکی ★</span>
          </p>
          <p className="text-slate-600 text-[10px] sm:text-xs mt-3 md:mt-4 hidden md:block">
            ★ راه اندازی سریع سیستم نوبت دهی تخصصی باشگاه ★ مدیریت رزرو کلاس ورزشی ★ پیامک یادآوری خودکار ★
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 lg:gap-20 relative">
          {gymSteps.map((step, i) => (
            <div key={i} className="group text-center relative z-10">
              <div className="inline-block bg-slate-800 text-emerald-400 text-[10px] font-black px-3 md:px-4 py-1.5 rounded-full border border-slate-700 mb-4 md:mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                مرحله { (i + 1).toLocaleString('fa-IR') }
              </div>
              
              <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-900 border-2 border-slate-800 rounded-2xl md:rounded-[2.5rem] flex items-center justify-center mx-auto mb-5 md:mb-8 shadow-2xl group-hover:border-emerald-500/50 group-hover:shadow-emerald-500/20 transition-all duration-500 group-hover:-rotate-6">
                <div className="text-emerald-500 group-hover:scale-110 transition-transform duration-500">
                  {step.icon}
                </div>
              </div>
              
              <h3 className="text-lg md:text-2xl font-black mb-3 md:mb-4 group-hover:text-emerald-400 transition-colors">
                {step.title}
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed font-medium px-2 md:px-4">
                {step.desc}
              </p>
              <p className="text-slate-600 text-[10px] sm:text-xs mt-3 hidden md:block">
                {step.seoDesc}
              </p>
            </div>
          ))}

          <div className="hidden md:block absolute top-[45%] left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-transparent via-slate-700 to-transparent -z-0"></div>
        </div>
      </div>
    </section>
  );
}