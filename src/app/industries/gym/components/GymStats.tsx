// app/industries/gym/components/GymStats.tsx
"use client";

import { useEffect, useState } from "react";
import { Users, CalendarCheck, MessageSquare, Trophy, Dumbbell } from "lucide-react";

export default function GymStats() {
  const [counts, setCounts] = useState({ gyms: 0, appointments: 0, sms: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setCounts(prev => ({
        gyms: prev.gyms < 320 ? prev.gyms + 6 : 320,
        appointments: prev.appointments < 18000 ? prev.appointments + 200 : 18000,
        sms: prev.sms < 55000 ? prev.sms + 600 : 55000
      }));
    }, 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-16 md:py-20 bg-emerald-50/30 border-y border-emerald-100/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 text-center mb-8 md:mb-12">
          آمار اعتماد به{" "}
          <span className="text-emerald-600">نرم افزار نوبت دهی باشگاه بدنسازی آنتایم</span>
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 lg:gap-8">
          <StatCard 
            icon={<Dumbbell className="text-emerald-600" />} 
            value={counts.gyms} 
            label="باشگاه فعال" 
            suffix="+" 
            description="باشگاه بدنسازی و ورزشی فعال در سراسر ایران"
          />
          <StatCard 
            icon={<CalendarCheck className="text-teal-600" />} 
            value={counts.appointments} 
            label="نوبت کلاس ثبت شده" 
            suffix="+" 
            description="نوبت ثبت شده برای کلاس‌های بدنسازی، یوگا و کراس فیت"
          />
          <StatCard 
            icon={<MessageSquare className="text-sky-600" />} 
            value={counts.sms} 
            label="پیامک یادآوری تمرین" 
            suffix="+" 
            description="پیامک یادآوری خودکار جلسات تمرینی و کاهش ۸۰ درصدی کنسلی"
          />
          <StatCard 
            icon={<Trophy className="text-amber-600" />} 
            value={97} 
            label="رضایت مربیان" 
            suffix="%" 
            description="رضایت مربیان و مدیران باشگاه از سیستم نوبت دهی آنتایم"
          />
        </div>
        
        <p className="text-slate-400 text-[10px] sm:text-xs text-center mt-6 md:mt-8 hidden md:block">
          ★ سیستم نوبت دهی تخصصی باشگاه بدنسازی ★ مدیریت رزرو کلاس ورزشی ★ پیامک یادآوری خودکار اعضا ★
        </p>
      </div>
    </section>
  );
}

function StatCard({ icon, value, label, suffix, description }: any) {
  return (
    <div className="bg-white/80 backdrop-blur-sm p-5 md:p-6 lg:p-8 rounded-2xl md:rounded-[2rem] border border-emerald-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group text-center">
      <div className="mb-3 md:mb-4 bg-emerald-50 w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 group-hover:bg-emerald-100 transition-all">
        {icon}
      </div>
      <div className="flex items-baseline justify-center gap-1 mb-2">
        <span className="text-2xl md:text-3xl font-black text-slate-900 tabular-nums">
          {value.toLocaleString("fa-IR")}
        </span>
        <span className="text-emerald-600 font-black text-lg md:text-xl">{suffix}</span>
      </div>
      <h3 className="text-slate-800 text-sm md:text-base font-bold mb-1 md:mb-2">{label}</h3>
      {description && (
        <p className="text-slate-400 text-[10px] sm:text-xs hidden md:block">{description}</p>
      )}
    </div>
  );
}