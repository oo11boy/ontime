"use client";

import { useEffect, useState } from "react";
import { Users, CalendarCheck, MessageSquare, Heart } from "lucide-react";

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
      <div className="max-w-7xl mx-auto px-6 text-center mb-12">
        <h2 className="text-2xl font-black text-slate-800">اعتماد جامعه ناخن‌کاران ایران به آنتایم</h2>
        <p className="text-slate-500 mt-2 font-medium">قدرت گرفته از سیستم هوشمند مدیریت نوبت و مشتری</p>
      </div>
      
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <StatCard 
            icon={<Users className="text-rose-600" />} 
            value={counts.artists} 
            label="ناخن‌کار و مدرس فعال" 
            suffix="+" 
          />
          <StatCard 
            icon={<CalendarCheck className="text-pink-600" />} 
            value={counts.refills} 
            label="نوبت کاشت و ترمیم" 
            suffix="+" 
          />
          <StatCard 
            icon={<MessageSquare className="text-amber-600" />} 
            value={counts.sms} 
            label="یادآوری خودکار پیامکی" 
            suffix="+" 
          />
          <StatCard 
            icon={<Heart className="text-rose-500" />} 
            value={99} 
            label="رضایت کلاینت‌ها" 
            suffix="%" 
          />
        </div>
      </div>
    </section>
  );
}

function StatCard({ icon, value, label, suffix }: any) {
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
      <h3 className="text-slate-600 text-[13px] font-black">{label}</h3>
    </div>
  );
}