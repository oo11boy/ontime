import { Users, Award, Sparkles, TrendingUp, Calendar } from "lucide-react";
import { BusinessData } from "./types";
import { useEffect, useState } from "react";

interface StatsCardsProps {
  business: BusinessData;
}

export function StatsCards({ business }: StatsCardsProps) {
  const [counters, setCounters] = useState({
    visits: 0,
    satisfaction: 0,
    services: 0
  });

  // انیمیشن شمارنده (افکت لوکس)
  useEffect(() => {
    const targetVisits = business.total_visits || 0;
    const targetServices = business.services?.length || 0;
    const targetSatisfaction = 100;
    
    const duration = 1000; // 1 ثانیه
    const stepTime = 20; // هر 20 میلی‌ثانیه آپدیت
    const steps = duration / stepTime;
    
    let currentStep = 0;
    
    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      setCounters({
        visits: Math.min(Math.floor(targetVisits * progress), targetVisits),
        satisfaction: Math.min(Math.floor(targetSatisfaction * progress), targetSatisfaction),
        services: Math.min(Math.floor(targetServices * progress), targetServices)
      });
      
      if (currentStep >= steps) {
        setCounters({
          visits: targetVisits,
          satisfaction: targetSatisfaction,
          services: targetServices
        });
        clearInterval(interval);
      }
    }, stepTime);
    
    return () => clearInterval(interval);
  }, [business.total_visits, business.services?.length]);

  return (
    <div className="mb-8 md:mb-10 animate-fadeInUp">
      {/* هدر بخش با استایل جدید */}
      <div className="flex items-center gap-2 mb-4 md:mb-5">
        <div className="w-1 h-5 md:h-6 bg-gradient-to-b from-emerald-400 to-teal-500 rounded-full" />
        <h3 className="font-bold text-white text-base md:text-lg tracking-tight">
          آمار و عملکرد
        </h3>
        <div className="flex-1" />
        <TrendingUp size={14} className="text-emerald-400/60" />
      </div>

      {/* گرید کارت‌ها با ریسپانسیو بهتر */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        {/* کارت بازدید کل */}
        <div className="group relative bg-gradient-to-br from-white/8 to-white/0 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-5 text-center border border-white/10 hover:border-emerald-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10 hover:scale-105 cursor-default overflow-hidden">
          {/* افکت گرادینت متحرک در هاور */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/10 group-hover:via-emerald-500/5 group-hover:to-transparent transition-all duration-500" />
          
          <div className="relative z-10">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center mx-auto mb-2 md:mb-3 border border-emerald-500/30 group-hover:scale-110 transition-transform duration-300">
              <Users className="w-5 h-5 md:w-6 md:h-6 text-emerald-400" />
            </div>
            <p className="text-2xl md:text-3xl font-black text-white mb-1">
              {counters.visits.toLocaleString('fa-IR')}
            </p>
            <p className="text-xs md:text-sm font-medium text-gray-300">بازدید کل</p>
            <div className="mt-2 h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0 transition-all duration-500 mx-auto rounded-full" />
          </div>
        </div>

        {/* کارت رضایت */}
        <div className="group relative bg-gradient-to-br from-white/8 to-white/0 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-5 text-center border border-white/10 hover:border-emerald-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10 hover:scale-105 cursor-default overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/10 group-hover:via-emerald-500/5 group-hover:to-transparent transition-all duration-500" />
          
          <div className="relative z-10">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center mx-auto mb-2 md:mb-3 border border-emerald-500/30 group-hover:scale-110 transition-transform duration-300">
              <Award className="w-5 h-5 md:w-6 md:h-6 text-emerald-400" />
            </div>
            <div className="relative inline-block">
              <p className="text-2xl md:text-3xl font-black text-white mb-1">
                {counters.satisfaction}
              </p>
              <span className="absolute -top-1 -right-4 text-sm font-bold text-emerald-400">٪</span>
            </div>
            <p className="text-xs md:text-sm font-medium text-gray-300">رضایت مشتریان</p>
            <div className="mt-2 h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0 transition-all duration-500 mx-auto rounded-full" />
          </div>
        </div>

        {/* کارت خدمات */}
        <div className="group relative bg-gradient-to-br from-white/8 to-white/0 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-5 text-center border border-white/10 hover:border-emerald-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10 hover:scale-105 cursor-default overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/10 group-hover:via-emerald-500/5 group-hover:to-transparent transition-all duration-500" />
          
          <div className="relative z-10">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center mx-auto mb-2 md:mb-3 border border-emerald-500/30 group-hover:scale-110 transition-transform duration-300">
              <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-emerald-400" />
            </div>
            <p className="text-2xl md:text-3xl font-black text-white mb-1">
              {counters.services}
            </p>
            <p className="text-xs md:text-sm font-medium text-gray-300">خدمات ویژه</p>
            <div className="mt-2 h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0 transition-all duration-500 mx-auto rounded-full" />
          </div>
        </div>
      </div>

      {/* استایل انیمیشن */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.1) forwards;
        }
      `}</style>
    </div>
  );
}