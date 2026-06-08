// app/industries/doctors/components/DoctorStepFlow.tsx
"use client";

import { UserPlus, Settings2, CalendarRange, Stethoscope } from "lucide-react";

const doctorSteps = [
  { 
    title: "ثبت‌نامه مطب و پزشکان", 
    desc: "با شماره همراه خود ثبت‌نام کنید و نام مطب و لیست پزشکان را وارد کنید.", 
    seoDesc: "فعال سازی پنل مدیریت نوبت ویزیت مطب پزشکی در کمتر از ۲ دقیقه",
    icon: <UserPlus size={32} /> 
  },
  { 
    title: "تنظیم خدمات و شیفت پزشکان", 
    desc: "زمان دقیق ویزیت برای هر پزشک (مثلاً ۱۵ دقیقه) را تعیین کرده و ساعت حضور آن‌ها را مشخص کنید.", 
    seoDesc: "ثبت تخصصی شیفت کاری پزشکان و زمان ویزیت در نرم افزار نوبت دهی مطب",
    icon: <Settings2 size={32} /> 
  },
  { 
    title: "ثبت نوبت و ارسال پیامک یادآوری", 
    desc: "نوبت بیمار را در تقویم تخصصی مطب ثبت کنید؛ پیامک تایید و یادآوری خودکار نوبت ویزیت برای بیمار ارسال می‌شود.", 
    seoDesc: "ارسال خودکار پیامک یادآوری نوبت ویزیت و کاهش ۸۰ درصدی کنسلی",
    icon: <CalendarRange size={32} /> 
  }
];

export default function DoctorStepFlow() {
  return (
    <section className="py-24 bg-slate-950 text-white relative overflow-hidden" dir="rtl">
      <div className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none">
        <div className="absolute top-[20%] -right-[5%] w-[35%] h-[35%] bg-blue-600 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[20%] -left-[5%] w-[30%] h-[30%] bg-indigo-600 blur-[120px] rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-3xl lg:text-5xl font-black mb-6 leading-tight">
            شروع کار با <span className="text-blue-500">نرم افزار نوبت دهی پزشکان آنتایم</span> چقدر ساده است؟
          </h2>
          <p className="text-slate-400 font-medium max-w-2xl mx-auto">
            آنتایم به گونه‌ای طراحی شده که حتی بدون دانش فنی، بتوانید در کمتر از ۲ دقیقه تمام نوبت‌های 
            <strong className="text-white"> ویزیت بیماران</strong> خود را به صورت دیجیتال مدیریت کنید.
            <br />
            <span className="text-blue-400 text-sm block mt-2">★ ۲ هفته رایگان ★ بدون نیاز به کارت بانکی ★</span>
          </p>
          <p className="text-slate-600 text-xs mt-4 hidden md:block">
            ★ راه اندازی سریع سیستم نوبت دهی تخصصی مطب ★ مدیریت نوبت ویزیت ★ پیامک یادآوری خودکار ★
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12 lg:gap-20 relative">
          {doctorSteps.map((step, i) => (
            <div key={i} className="group text-center relative z-10">
              <div className="inline-block bg-slate-800 text-blue-400 text-[10px] font-black px-4 py-1.5 rounded-full border border-slate-700 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                مرحله { (i + 1).toLocaleString('fa-IR') }
              </div>
              
              <div className="w-24 h-24 bg-slate-900 border-2 border-slate-800 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl group-hover:border-blue-500/50 group-hover:shadow-blue-500/20 transition-all duration-500 group-hover:-rotate-6">
                <div className="text-blue-500 group-hover:scale-110 transition-transform duration-500">
                  {step.icon}
                </div>
              </div>
              
              <h3 className="text-2xl font-black mb-4 group-hover:text-blue-400 transition-colors">
                {step.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed font-medium px-4">
                {step.desc}
              </p>
              <p className="text-slate-600 text-xs mt-3 hidden md:block">
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