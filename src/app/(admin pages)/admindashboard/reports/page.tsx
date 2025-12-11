"use client";
import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Users,
  PieChart,
  Activity,
  Download,
  Loader2,
  Target
} from "lucide-react";

// --- 1. پایگاه داده شبیه‌سازی شده (Data Mock) ---

// داده‌های نمودار میله‌ای (داینامیک)
const chartDatabase = {
  weekly: [
    { label: "شنبه", value: 30, height: "h-[30%]" },
    { label: "یکشنبه", value: 45, height: "h-[45%]" },
    { label: "دوشنبه", value: 25, height: "h-[25%]" },
    { label: "سه‌شنبه", value: 60, height: "h-[60%]" },
    { label: "چهارشنبه", value: 80, height: "h-[80%]" },
    { label: "پنجشنبه", value: 95, height: "h-[95%]" },
    { label: "جمعه", value: 50, height: "h-[50%]" },
  ],
  monthly: [
    { label: "فروردین", value: 45, height: "h-[45%]" },
    { label: "اردیبهشت", value: 60, height: "h-[60%]" },
    { label: "خرداد", value: 35, height: "h-[35%]" },
    { label: "تیر", value: 70, height: "h-[70%]" },
    { label: "مرداد", value: 85, height: "h-[85%]" },
    { label: "شهریور", value: 65, height: "h-[65%]" },
    { label: "مهر", value: 90, height: "h-[90%]" },
    { label: "آبان", value: 55, height: "h-[55%]" },
    { label: "آذر", value: 75, height: "h-[75%]" },
    { label: "دی", value: 60, height: "h-[60%]" },
    { label: "بهمن", value: 80, height: "h-[80%]" },
    { label: "اسفند", value: 95, height: "h-[95%]" },
  ],
  yearly: [
    { label: "۱۴۰۰", value: 40, height: "h-[40%]" },
    { label: "۱۴۰۱", value: 55, height: "h-[55%]" },
    { label: "۱۴۰۲", value: 75, height: "h-[75%]" },
    { label: "۱۴۰۳", value: 90, height: "h-[90%]" },
    { label: "۱۴۰۴", value: 30, height: "h-[30%]" },
  ]
};

// داده‌های کارت‌های خلاصه (داینامیک)
const summaryDatabase = {
  weekly: {
    revenue: "12,500,000", trendRev: "+5%", isPosRev: true,
    bookings: "145", trendBook: "+12%", isPosBook: true,
    cancelRate: "5%", trendCancel: "-1%", isPosCancel: true,
    newClients: "2", trendClients: "0%", isPosClients: true,
  },
  monthly: {
    revenue: "450,000,000", trendRev: "+15%", isPosRev: true,
    bookings: "2,450", trendBook: "+8%", isPosBook: true,
    cancelRate: "12%", trendCancel: "+2%", isPosCancel: false,
    newClients: "35", trendClients: "-5%", isPosClients: false,
  },
  yearly: {
    revenue: "5.4 B", trendRev: "+45%", isPosRev: true,
    bookings: "28,000", trendBook: "+30%", isPosBook: true,
    cancelRate: "10%", trendCancel: "-5%", isPosCancel: true,
    newClients: "420", trendClients: "+20%", isPosClients: true,
  }
};

// لیست کسب‌وکارهای برتر (ثابت)
const topBusinesses = [
  { name: "سالن زیبایی مریم", bookings: 1450, growth: "+12%" },
  { name: "کارواش مدرن", bookings: 980, growth: "+5%" },
  { name: "کلینیک دکتر راد", bookings: 850, growth: "-2%" },
  { name: "باشگاه اکسیژن", bookings: 740, growth: "+18%" },
];

type TimeFrame = "weekly" | "monthly" | "yearly";

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState<TimeFrame>("monthly");
  const [isLoading, setIsLoading] = useState(false);

  // افکت لودینگ نمایشی هنگام تغییر تب
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [timeRange]);

  const currentChartData = chartDatabase[timeRange];
  const currentSummary = summaryDatabase[timeRange];

  return (
    <div className="space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* --- Header & Filters --- */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Activity className="text-emerald-400 w-7 h-7" />
            گزارشات و تحلیل آماری
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            نمایش آمار به صورت <span className="text-emerald-400 font-bold">{timeRange === 'weekly' ? 'هفتگی' : timeRange === 'monthly' ? 'ماهانه' : 'سالانه'}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#242933] p-1 rounded-xl border border-emerald-500/20">
          {(["weekly", "monthly", "yearly"] as TimeFrame[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all relative ${
                timeRange === range
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {range === "weekly" ? "هفتگی" : range === "monthly" ? "ماهانه" : "سالانه"}
            </button>
          ))}
        </div>
      </div>

      {/* --- Dynamic Content Area --- */}
      <div className={`transition-all duration-300 ${isLoading ? "opacity-60 blur-[1px]" : "opacity-100"}`}>
        
        {/* 1. Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <SummaryCard 
            title="درآمد خالص" 
            value={currentSummary.revenue} 
            unit={timeRange === 'yearly' ? '' : 'تومان'}
            trend={currentSummary.trendRev} 
            isPositive={currentSummary.isPosRev} 
            icon={Wallet} 
          />
          <SummaryCard 
            title="تعداد نوبت‌ها" 
            value={currentSummary.bookings} 
            unit="نوبت"
            trend={currentSummary.trendBook} 
            isPositive={currentSummary.isPosBook} 
            icon={Calendar} 
          />
          <SummaryCard 
            title="نرخ لغو نوبت" 
            value={currentSummary.cancelRate} 
            unit=""
            trend={currentSummary.trendCancel} 
            isPositive={currentSummary.isPosCancel} 
            icon={PieChart} 
          />
          <SummaryCard 
            title="کلاینت‌های جدید" 
            value={currentSummary.newClients} 
            unit="مورد"
            trend={currentSummary.trendClients} 
            isPositive={currentSummary.isPosClients} 
            icon={Users} 
          />
        </div>

        {/* 2. Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          
          {/* Bar Chart */}
          <div className="lg:col-span-2 bg-[#242933] border border-emerald-500/20 rounded-2xl p-6 shadow-xl relative min-h-[350px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-400" />
                روند درآمد {timeRange === 'weekly' ? 'هفتگی' : timeRange === 'monthly' ? 'ماهانه' : 'سالانه'}
              </h3>
              <button className="text-xs flex items-center gap-1 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg hover:bg-emerald-500 hover:text-white transition">
                <Download className="w-3.5 h-3.5" />
                خروجی
              </button>
            </div>

            <div className="flex-1 flex items-end justify-between gap-2 sm:gap-4 px-2 pb-2">
              {currentChartData.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer h-full justify-end">
                  <div className="opacity-0 group-hover:opacity-100 absolute top-16 bg-white text-black text-xs font-bold px-3 py-1.5 rounded-lg transition-all shadow-xl z-10 whitespace-nowrap">
                     {data.value} واحد
                  </div>
                  
                  <div 
                    className={`w-full max-w-[50px] ${data.height} bg-gradient-to-t from-emerald-500/10 to-emerald-500 rounded-t-lg transition-all duration-700 ease-out group-hover:from-emerald-500/30 group-hover:to-emerald-400 relative overflow-hidden group-hover:scale-y-105 origin-bottom`}
                  >
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                  </div>
                  
                  <span className="text-[10px] sm:text-xs text-gray-400 font-medium truncate w-full text-center group-hover:text-emerald-400 transition-colors">
                    {data.label}
                  </span>
                </div>
              ))}
            </div>

            {isLoading && (
               <div className="absolute inset-0 flex items-center justify-center bg-[#242933]/60 backdrop-blur-[1px] rounded-2xl z-20">
                 <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
               </div>
            )}
          </div>

          {/* Pie Chart (Static Visualization) */}
          <div className="bg-[#242933] border border-emerald-500/20 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-emerald-400" />
              وضعیت کلی نوبت‌ها
            </h3>
            
            <div className="flex-1 flex items-center justify-center relative my-4">
              <div 
                className="w-48 h-48 rounded-full relative flex items-center justify-center animate-in zoom-in duration-500"
                style={{
                  background: `conic-gradient(
                    #10b981 0% 65%, 
                    #f59e0b 65% 85%, 
                    #ef4444 85% 100%
                  )`
                }}
              >
                <div className="w-36 h-36 bg-[#242933] rounded-full flex flex-col items-center justify-center z-10 shadow-inner">
                  <span className="text-3xl font-bold text-white">65%</span>
                  <span className="text-xs text-gray-400">نوبت‌های موفق</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
               <div className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-white/5 transition border border-transparent hover:border-emerald-500/10">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
                    <span className="text-gray-300">انجام شده</span>
                  </div>
                  <span className="font-bold text-white">65%</span>
               </div>
               <div className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-white/5 transition border border-transparent hover:border-yellow-500/10">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-[0_0_8px_#f59e0b]"></div>
                    <span className="text-gray-300">در انتظار</span>
                  </div>
                  <span className="font-bold text-white">20%</span>
               </div>
               <div className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-white/5 transition border border-transparent hover:border-red-500/10">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]"></div>
                    <span className="text-gray-300">لغو شده</span>
                  </div>
                  <span className="font-bold text-white">15%</span>
               </div>
            </div>
          </div>
        </div>

        {/* 3. Bottom Section: Top Businesses & Goals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Top Businesses List */}
          <div className="bg-[#242933] border border-emerald-500/20 rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              کسب‌وکارهای برتر دوره
            </h3>
            <div className="space-y-4">
              {topBusinesses.map((biz, idx) => (
                <div key={idx} className="flex items-center justify-between p-3.5 bg-[#1a1e26] rounded-xl border border-white/5 hover:border-emerald-500/30 transition group cursor-default">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold border ${idx === 0 ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' : 'bg-gray-800 text-emerald-400 border-emerald-500/20'}`}>
                      {idx + 1}
                    </div>
                    <span className="text-sm font-medium text-white group-hover:text-emerald-300 transition">{biz.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-400">{biz.bookings} نوبت</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-md ${biz.growth.includes('+') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                      {biz.growth}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Goals Progress */}
          <div className="bg-[#242933] border border-emerald-500/20 rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-400" />
              اهداف و تارگت‌ها
            </h3>
            <div className="space-y-7">
              <GoalProgress label="تکمیل پروفایل کلاینت‌ها" percent={85} color="bg-emerald-500" shadowColor="shadow-emerald-500/50" />
              <GoalProgress label="فروش پلن‌های طلایی" percent={45} color="bg-yellow-500" shadowColor="shadow-yellow-500/50" />
              <GoalProgress label="رضایت کاربران" percent={92} color="bg-blue-500" shadowColor="shadow-blue-500/50" />
              <GoalProgress label="بهینه‌سازی سرور" percent={30} color="bg-purple-500" shadowColor="shadow-purple-500/50" />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

// --- کامپوننت‌های کمکی (Helper Components) ---

function SummaryCard({ title, value, unit, trend, isPositive, icon: Icon }: any) {
  return (
    <div className="bg-[#242933] border border-emerald-500/20 rounded-2xl p-5 hover:border-emerald-500/50 hover:-translate-y-1 transition-all duration-300 shadow-lg group">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2.5 bg-[#1a1e26] rounded-xl text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition">
          <Icon className="w-5 h-5" />
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
          {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {trend}
        </div>
      </div>
      <h4 className="text-2xl font-bold text-white mb-1">
        {value} <span className="text-xs text-gray-500 font-normal">{unit}</span>
      </h4>
      <p className="text-xs text-gray-400">{title}</p>
    </div>
  );
}

function GoalProgress({ label, percent, color, shadowColor }: any) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-2">
        <span className="text-gray-300 font-medium">{label}</span>
        <span className="text-white font-bold">{percent}%</span>
      </div>
      <div className="w-full h-2.5 bg-[#1a1e26] rounded-full overflow-hidden border border-white/5">
        <div 
          className={`h-full rounded-full ${color} shadow-[0_0_10px_rgba(0,0,0,0.3)] relative overflow-hidden transition-all duration-1000 ease-out`} 
          style={{ width: `${percent}%` }}
        >
          {/* افکت شاین متحرک روی نوار پیشرفت */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-full -translate-x-full animate-[shimmer_2s_infinite]"></div>
        </div>
      </div>
    </div>

    
  );
}