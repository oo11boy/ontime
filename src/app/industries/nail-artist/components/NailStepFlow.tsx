"use client";

import { UserPlus, Settings2, CalendarRange, MousePointerClick } from "lucide-react";

const nailSteps = [
  { 
    title: "ورود به پنل ناخن‌کار", 
    desc: "با شماره همراه خود ثبت‌نام کنید و نام لاین زیبایی یا سالن خود را وارد کنید.", 
    icon: <UserPlus size={32} /> 
  },
  { 
    title: "تنظیم خدمات و شیفت", 
    desc: "زمان لازم برای ترمیم و کاشت را تعیین کرده و ساعت حضور خود در سالن را مشخص کنید.", 
    icon: <Settings2 size={32} /> 
  },
  { 
    title: "ثبت نوبت و ارسال پیامک", 
    desc: "نوبت مشتری را در تقویم ثبت کنید؛ پیامک تایید و یادآوری خودکار برای او ارسال می‌شود.", 
    icon: <CalendarRange size={32} /> 
  }
];

export default function NailStepFlow() {
  return (
    <section className="py-24 bg-slate-950 text-white relative overflow-hidden" dir="rtl">
      {/* دکوراسیون پس‌زمینه با تم صورتی/بنفش ملایم برای لاین ناخن */}
      <div className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none">
        <div className="absolute top-[20%] -right-[5%] w-[35%] h-[35%] bg-rose-600 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[20%] -left-[5%] w-[30%] h-[30%] bg-pink-600 blur-[120px] rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-3xl lg:text-5xl font-black mb-6 leading-tight">
            چگونه <span className="text-rose-500">میز ناخن</span> خود را هوشمند کنیم؟
          </h2>
          <p className="text-slate-400 font-medium max-w-2xl mx-auto">
            آنتایم به گونه‌ای طراحی شده که حتی بدون دانش فنی، بتوانید در کمتر از ۳ دقیقه تمام نوبت‌های خود را به صورت دیجیتال مدیریت کنید.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12 lg:gap-20 relative">
          {nailSteps.map((step, i) => (
            <div key={i} className="group text-center relative z-10">
              {/* نشانگر مرحله */}
              <div className="inline-block bg-slate-800 text-rose-400 text-[10px] font-black px-4 py-1.5 rounded-full border border-slate-700 mb-6 group-hover:bg-rose-600 group-hover:text-white transition-all duration-300">
                گام { (i + 1).toLocaleString('fa-IR') }
              </div>
              
              <div className="w-24 h-24 bg-slate-900 border-2 border-slate-800 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl group-hover:border-rose-500/50 group-hover:shadow-rose-500/20 transition-all duration-500 group-hover:-rotate-6">
                <div className="text-rose-500 group-hover:scale-110 transition-transform duration-500">
                  {step.icon}
                </div>
              </div>
              
              <h3 className="text-2xl font-black mb-4 group-hover:text-rose-400 transition-colors">
                {step.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed font-medium px-4">
                {step.desc}
              </p>
            </div>
          ))}

          {/* خط پیوند دهنده در دسکتاپ - بهینه شده برای سئو بصری */}
          <div className="hidden md:block absolute top-[45%] left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-transparent via-slate-700 to-transparent -z-0"></div>
        </div>


      </div>
    </section>
  );
}