// app/industries/doctors/components/DoctorStats.tsx
"use client";

import { useEffect, useState } from "react";
import { Users, CalendarCheck, MessageSquare, Award, Stethoscope } from "lucide-react";

export default function DoctorStats() {
  const [counts, setCounts] = useState({ clinics: 0, appointments: 0, sms: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setCounts(prev => ({
        clinics: prev.clinics < 450 ? prev.clinics + 8 : 450,
        appointments: prev.appointments < 25000 ? prev.appointments + 300 : 25000,
        sms: prev.sms < 80000 ? prev.sms + 1000 : 80000
      }));
    }, 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 bg-blue-50/30 border-y border-blue-100/50">
      <div className="max-w-7xl mx-auto px-6">
        {/* H2 بهینه شده برای سئو */}
        <h2 className="text-2xl lg:text-3xl font-black text-slate-900 text-center mb-12">
          آمار اعتماد به{" "}
          <span className="text-blue-600">نرم افزار نوبت دهی پزشکان آنتایم</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <StatCard 
            icon={<Stethoscope className="text-blue-600" />} 
            value={counts.clinics} 
            label="مطب و کلینیک فعال" 
            suffix="+" 
            description="مطب پزشکی و کلینیک فعال در سراسر ایران"
          />
          <StatCard 
            icon={<CalendarCheck className="text-indigo-600" />} 
            value={counts.appointments} 
            label="نوبت ویزیت ثبت شده" 
            suffix="+" 
            description="نوبت ثبت شده توسط بیماران از طریق لینک اختصاصی"
          />
          <StatCard 
            icon={<MessageSquare className="text-sky-600" />} 
            value={counts.sms} 
            label="پیامک یادآوری ویزیت" 
            suffix="+" 
            description="پیامک یادآوری خودکار و کاهش ۸۰ درصدی کنسلی"
          />
          <StatCard 
            icon={<Award className="text-emerald-600" />} 
            value={98} 
            label="رضایت پزشکان" 
            suffix="%" 
            description="رضایت پزشکان و مدیران مطب از سیستم نوبت دهی آنتایم"
          />
        </div>
        
        {/* کلمات کلیدی مخفی برای سئو */}
        <p className="text-slate-400 text-xs text-center mt-8 hidden md:block">
          ★ سیستم نوبت دهی تخصصی مطب پزشکان ★ مدیریت نوبت ویزیت ★ پیامک یادآوری خودکار بیماران ★
        </p>
      </div>
    </section>
  );
}

function StatCard({ icon, value, label, suffix, description }: any) {
  return (
    <div className="bg-white/80 backdrop-blur-sm p-8 rounded-[2.5rem] border border-blue-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group text-center">
      <div className="mb-4 bg-blue-50 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 group-hover:bg-blue-100 transition-all">
        {icon}
      </div>
      <div className="flex items-baseline justify-center gap-1 mb-2">
        <span className="text-3xl font-black text-slate-900 tabular-nums">
          {value.toLocaleString("fa-IR")}
        </span>
        <span className="text-blue-600 font-black text-xl">{suffix}</span>
      </div>
      <h3 className="text-slate-800 text-base font-bold mb-2">{label}</h3>
      {description && (
        <p className="text-slate-400 text-xs hidden md:block">{description}</p>
      )}
    </div>
  );
}