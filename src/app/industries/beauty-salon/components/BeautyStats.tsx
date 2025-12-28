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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <StatCard 
            icon={<Users className="text-pink-600" />} 
            value={counts.salons} 
            label="سالن زیبایی فعال" 
            suffix="+" 
          />
          <StatCard 
            icon={<CalendarCheck className="text-rose-600" />} 
            value={counts.appointments} 
            label="نوبت ثبت شده" 
            suffix="+" 
          />
          <StatCard 
            icon={<MessageSquare className="text-sky-600" />} 
            value={counts.sms} 
            label="پیامک یادآوری موفق" 
            suffix="+" 
          />
          <StatCard 
            icon={<TrendingUp className="text-emerald-600" />} 
            value={98} 
            label="رضایت آرایشگران" 
            suffix="%" 
          />
        </div>
      </div>
    </section>
  );
}

function StatCard({ icon, value, label, suffix }: any) {
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
      <h3 className="text-slate-500 text-sm font-bold">{label}</h3>
    </div>
  );
}