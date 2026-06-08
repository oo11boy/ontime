// app/industries/consulting/components/ConsultingStats.tsx
"use client";

import { useEffect, useState } from "react";
import { Users, CalendarCheck, MessageSquare, Award, Brain } from "lucide-react";

export default function ConsultingStats() {
  const [counts, setCounts] = useState({ centers: 0, appointments: 0, sms: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setCounts(prev => ({
        centers: prev.centers < 280 ? prev.centers + 5 : 280,
        appointments: prev.appointments < 15000 ? prev.appointments + 180 : 15000,
        sms: prev.sms < 45000 ? prev.sms + 500 : 45000
      }));
    }, 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-16 md:py-20 bg-indigo-50/30 border-y border-indigo-100/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 text-center mb-8 md:mb-12">
          آمار اعتماد به{" "}
          <span className="text-indigo-600">نرم افزار نوبت دهی روانشناس و مشاور آنتایم</span>
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 lg:gap-8">
          <StatCard 
            icon={<Brain className="text-indigo-600" />} 
            value={counts.centers} 
            label="مرکز مشاوره فعال" 
            suffix="+" 
            description="مرکز مشاوره و کلینیک روانشناسی فعال در سراسر ایران"
          />
          <StatCard 
            icon={<CalendarCheck className="text-purple-600" />} 
            value={counts.appointments} 
            label="جلسه مشاوره ثبت شده" 
            suffix="+" 
            description="جلسات مشاوره حضوری و آنلاین ثبت شده در سیستم"
          />
          <StatCard 
            icon={<MessageSquare className="text-sky-600" />} 
            value={counts.sms} 
            label="پیامک یادآوری جلسه" 
            suffix="+" 
            description="پیامک یادآوری خودکار جلسات و کاهش ۸۰ درصدی کنسلی"
          />
          <StatCard 
            icon={<Award className="text-amber-600" />} 
            value={98} 
            label="رضایت مشاوران" 
            suffix="%" 
            description="رضایت روانشناسان و مشاوران از سیستم نوبت دهی آنتایم"
          />
        </div>
        
        <p className="text-slate-400 text-[10px] sm:text-xs text-center mt-6 md:mt-8 hidden md:block">
          ★ سیستم نوبت دهی تخصصی مراکز مشاوره ★ مدیریت جلسات روانشناسی ★ پیامک یادآوری خودکار مراجعان ★
        </p>
      </div>
    </section>
  );
}

function StatCard({ icon, value, label, suffix, description }: any) {
  return (
    <div className="bg-white/80 backdrop-blur-sm p-5 md:p-6 lg:p-8 rounded-2xl md:rounded-[2rem] border border-indigo-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group text-center">
      <div className="mb-3 md:mb-4 bg-indigo-50 w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 group-hover:bg-indigo-100 transition-all">
        {icon}
      </div>
      <div className="flex items-baseline justify-center gap-1 mb-2">
        <span className="text-2xl md:text-3xl font-black text-slate-900 tabular-nums">
          {value.toLocaleString("fa-IR")}
        </span>
        <span className="text-indigo-600 font-black text-lg md:text-xl">{suffix}</span>
      </div>
      <h3 className="text-slate-800 text-sm md:text-base font-bold mb-1 md:mb-2">{label}</h3>
      {description && (
        <p className="text-slate-400 text-[10px] sm:text-xs hidden md:block">{description}</p>
      )}
    </div>
  );
}