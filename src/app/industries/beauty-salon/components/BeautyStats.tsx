// components/BeautySalon/BeautyStats.tsx
"use client";

import { useEffect, useState } from "react";
import { Users, CalendarCheck, MessageSquare, TrendingUp } from "lucide-react";

export default function BeautyStats() {
  const [counts, setCounts] = useState({ salons: 0, appointments: 0, sms: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setCounts(prev => ({
        salons: prev.salons < 1200 ? prev.salons + 15 : 1200,
        appointments: prev.appointments < 55000 ? prev.appointments + 600 : 55000,
        sms: prev.sms < 180000 ? prev.sms + 2000 : 180000
      }));
    }, 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 bg-slate-50 border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-6">
        {/* H2 جدید برای سئو */}
        <h2 className="text-2xl lg:text-3xl font-black text-slate-900 text-center mb-12">
          آمار اعتماد به{" "}
          <span className="text-pink-600">نرم افزار نوبت دهی آرایشگاه آنتایم</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <StatCard 
            icon={<Users className="text-pink-600" />} 
            value={counts.salons} 
            label="سالن زیبایی فعال" 
            suffix="+" 
            description="سالن زیبایی و آرایشگاه فعال در سراسر ایران"
          />
          <StatCard 
            icon={<CalendarCheck className="text-rose-600" />} 
            value={counts.appointments} 
            label="نوبت ثبت شده" 
            suffix="+" 
            description="نوبت ثبت شده توسط مشتریان از طریق لینک اختصاصی"
          />
          <StatCard 
            icon={<MessageSquare className="text-sky-600" />} 
            value={counts.sms} 
            label="پیامک یادآوری موفق" 
            suffix="+" 
            description="پیامک یادآوری خودکار و کاهش ۸۰ درصدی کنسلی"
          />
          <StatCard 
            icon={<TrendingUp className="text-emerald-600" />} 
            value={98} 
            label="رضایت آرایشگران" 
            suffix="%" 
            description="رضایت آرایشگران و سالن‌داران از سیستم نوبت دهی آنتایم"
          />
        </div>
      </div>
    </section>
  );
}

function StatCard({ icon, value, label, suffix, description }: any) {
  return (
    <div className="bg-white p-8 rounded-4xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group text-center">
      <div className="mb-4 bg-slate-50 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="flex items-baseline justify-center gap-1 mb-2">
        <span className="text-3xl font-black text-slate-900 tabular-nums">
          {value.toLocaleString("fa-IR")}
        </span>
        <span className="text-pink-600 font-black text-xl">{suffix}</span>
      </div>
      {/* H3 تغییر کرد */}
      <h3 className="text-slate-800 text-base font-bold mb-2">{label}</h3>
      {/* توضیحات مخفی برای سئو */}
      <p className="text-slate-400 text-xs hidden md:block">{description}</p>
    </div>
  );
}