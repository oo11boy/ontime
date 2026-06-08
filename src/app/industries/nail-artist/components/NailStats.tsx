"use client";

import { useEffect, useState } from "react";
import { Users, CalendarCheck, MessageSquare, Heart, Sparkles, Clock } from "lucide-react";

export default function NailStats() {
  const [counts, setCounts] = useState({ artists: 0, refills: 0, sms: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setCounts(prev => ({
        artists: prev.artists < 850 ? prev.artists + 10 : 850,
        refills: prev.refills < 42000 ? prev.refills + 500 : 42000,
        sms: prev.sms < 125000 ? prev.sms + 1500 : 125000
      }));
    }, 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 bg-rose-50/30 border-y border-rose-100/50">
      <div className="max-w-7xl mx-auto px-6">
        {/* H2 بهینه شده برای سئو - مختص ناخن‌کاران */}
        <h2 className="text-2xl lg:text-3xl font-black text-slate-900 text-center mb-12">
          آمار اعتماد به{" "}
          <span className="text-rose-600">نرم افزار نوبت دهی ناخن کار آنتایم</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <StatCard 
            icon={<Users className="text-rose-600" />} 
            value={counts.artists} 
            label="ناخن‌کار و مدرس فعال" 
            suffix="+" 
            description="ناخن‌کاران و مدرسان کاشت ناخن در سراسر ایران"
          />
          <StatCard 
            icon={<CalendarCheck className="text-pink-600" />} 
            value={counts.refills} 
            label="نوبت کاشت و ترمیم" 
            suffix="+" 
            description="نوبت ثبت شده برای خدمات کاشت، ترمیم و ژلیش ناخن"
          />
          <StatCard 
            icon={<MessageSquare className="text-amber-600" />} 
            value={counts.sms} 
            label="پیامک یادآوری ترمیم" 
            suffix="+" 
            description="پیامک یادآوری خودکار نوبت ترمیم و کاهش ۸۰ درصدی کنسلی"
          />
          <StatCard 
            icon={<Heart className="text-rose-500" />} 
            value={99} 
            label="رضایت ناخن‌کاران" 
            suffix="%" 
            description="رضایت ناخن‌کاران و سالن‌های تخصصی کاشت ناخن از سیستم آنتایم"
          />
        </div>
        
        {/* کلمات کلیدی مخفی برای سئو */}
        <p className="text-slate-400 text-xs text-center mt-8 hidden md:block">
          ★ سیستم نوبت دهی تخصصی کاشت ناخن ★ مدیریت نوبت ترمیم ★ پیامک یادآوری خودکار ناخن‌کاران ★
        </p>
      </div>
    </section>
  );
}

function StatCard({ icon, value, label, suffix, description }: any) {
  return (
    <div className="bg-white/80 backdrop-blur-sm p-8 rounded-[2.5rem] border border-rose-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group text-center">
      <div className="mb-4 bg-rose-50 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 group-hover:bg-rose-100 transition-all">
        {icon}
      </div>
      <div className="flex items-baseline justify-center gap-1 mb-2">
        <span className="text-3xl font-black text-slate-900 tabular-nums">
          {value.toLocaleString("fa-IR")}
        </span>
        <span className="text-rose-600 font-black text-xl">{suffix}</span>
      </div>
      {/* H3 بهبود یافته */}
      <h3 className="text-slate-800 text-base font-bold mb-2">{label}</h3>
      {/* توضیحات مخفی برای سئو */}
      {description && (
        <p className="text-slate-400 text-xs hidden md:block">{description}</p>
      )}
    </div>
  );
}