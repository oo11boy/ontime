// src/app/clientdashboard/customer-link/analytics/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Eye,
  Users,
  TrendingUp,
  Clock,
  Smartphone,
  Monitor,
  Tablet,
  MousePointer,
  MessageCircle,
  CalendarCheck,
  Instagram,
  Send,
  Phone,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Star,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface AnalyticsData {
  totalVisits: number;
  uniqueVisitors: number;
  todayVisits: number;
  avgTimeOnPage: number;
  bounceRate: number;
  conversionRate: number;
  totalBookings: number;
  totalReviews: number;
  avgRating: number;
  socialClicks: {
    instagram: number;
    telegram: number;
    whatsapp: number;
  };
  weeklyVisits: number[];
  deviceStats: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  popularHours: { hour: number; count: number }[];
}

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [period, setPeriod] = useState<"week" | "month">("week");

  const fetchAnalytics = async (showToast = false) => {
    try {
      const res = await fetch(`/api/client/customer-link/analytics?period=${period}`);
      const result = await res.json();
      if (result.success) {
        setData(result.data);
        if (showToast) toast.success("آمار بروزرسانی شد");
      } else {
        toast.error("خطا در دریافت آمار");
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchAnalytics(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">در حال بارگذاری آمار...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const weekDays = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"];
  const maxWeekly = Math.max(...data.weeklyVisits, 1);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-5 pb-20">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">
            📊 آمار بازدید
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">آمار لحظه‌ای لینک اختصاصی شما</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 transition"
        >
          <RefreshCw className={`w-5 h-5 text-slate-600 ${isRefreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2 bg-slate-100 dark:bg-white/5 rounded-xl p-1 w-fit">
        <button
          onClick={() => setPeriod("week")}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
            period === "week"
              ? "bg-emerald-600 text-white"
              : "text-slate-600 dark:text-gray-400"
          }`}
        >
          هفته جاری
        </button>
        <button
          onClick={() => setPeriod("month")}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
            period === "month"
              ? "bg-emerald-600 text-white"
              : "text-slate-600 dark:text-gray-400"
          }`}
        >
          ماه جاری
        </button>
      </div>

      {/* Stats Cards - ردیف اول */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-[#1a1e26] rounded-xl p-4 border border-slate-200 dark:border-white/10">
          <div className="flex items-center justify-between mb-2">
            <Eye className="w-5 h-5 text-emerald-500" />
            <span className="text-xs text-slate-400">کل بازدید</span>
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-white">
            {data.totalVisits.toLocaleString()}
          </p>
        </div>

        <div className="bg-white dark:bg-[#1a1e26] rounded-xl p-4 border border-slate-200 dark:border-white/10">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 text-emerald-500" />
            <span className="text-xs text-slate-400">بازدید یکتا</span>
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-white">
            {data.uniqueVisitors.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Stats Cards - ردیف دوم */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-[#1a1e26] rounded-xl p-3 text-center border border-slate-200 dark:border-white/10">
          <TrendingUp className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
          <p className="text-xl font-bold text-slate-800 dark:text-white">
            {data.todayVisits}
          </p>
          <p className="text-xs text-slate-500">بازدید امروز</p>
        </div>
        <div className="bg-white dark:bg-[#1a1e26] rounded-xl p-3 text-center border border-slate-200 dark:border-white/10">
          <Clock className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
          <p className="text-xl font-bold text-slate-800 dark:text-white">
            {formatTime(data.avgTimeOnPage)}
          </p>
          <p className="text-xs text-slate-500">میانگین زمان</p>
        </div>
        <div className="bg-white dark:bg-[#1a1e26] rounded-xl p-3 text-center border border-slate-200 dark:border-white/10">
          <MousePointer className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
          <p className="text-xl font-bold text-slate-800 dark:text-white">
            {data.bounceRate}%
          </p>
          <p className="text-xs text-slate-500">نرخ پرش</p>
        </div>
      </div>

      {/* نمودار */}
      <div className="bg-white dark:bg-[#1a1e26] rounded-2xl p-4 border border-slate-200 dark:border-white/10">
        <h3 className="font-semibold text-slate-800 dark:text-white mb-4">
          بازدیدهای {period === "week" ? "هفته جاری" : "۳۰ روز اخیر"}
        </h3>
        <div className="flex items-end justify-between gap-1 sm:gap-2 h-40">
          {data.weeklyVisits.map((value, i) => (
            <div key={i} className="flex-1 text-center">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(value / maxWeekly) * 100}%` }}
                transition={{ duration: 0.5, delay: i * 0.02 }}
                className="bg-gradient-to-t from-emerald-500 to-teal-500 rounded-lg cursor-pointer group relative"
                style={{ height: `${(value / maxWeekly) * 100}%`, minHeight: "4px" }}
              >
                <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                  {value}
                </div>
              </motion.div>
              <p className="text-[10px] sm:text-xs text-slate-500 mt-2">
                {period === "week" ? weekDays[i] : `${i + 1}`}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* آمار تعامل */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-[#1a1e26] rounded-xl p-4 border border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <CalendarCheck className="w-5 h-5 text-emerald-500" />
            <span className="text-sm font-medium">درخواست نوبت</span>
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-white">
            {data.totalBookings}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            نرخ تبدیل: {data.conversionRate}%
          </p>
        </div>
        <div className="bg-white dark:bg-[#1a1e26] rounded-xl p-4 border border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-5 h-5 text-emerald-500" />
            <span className="text-sm font-medium">نظرات</span>
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-white">
            {data.totalReviews}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            میانگین امتیاز: {data.avgRating.toFixed(1)}
          </p>
        </div>
      </div>

      {/* آمار دستگاه‌ها */}
      <div className="bg-white dark:bg-[#1a1e26] rounded-2xl p-4 border border-slate-200 dark:border-white/10">
        <h3 className="font-semibold text-slate-800 dark:text-white mb-3">
          دستگاه‌های بازدیدکننده
        </h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="flex items-center gap-1">
                <Smartphone className="w-4 h-4 text-emerald-500" /> موبایل
              </span>
              <span>{data.deviceStats.mobile}%</span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${data.deviceStats.mobile}%` }}
                className="h-full bg-emerald-500 rounded-full"
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="flex items-center gap-1">
                <Monitor className="w-4 h-4 text-emerald-500" /> دسکتاپ
              </span>
              <span>{data.deviceStats.desktop}%</span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${data.deviceStats.desktop}%` }}
                className="h-full bg-emerald-500 rounded-full"
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="flex items-center gap-1">
                <Tablet className="w-4 h-4 text-emerald-500" /> تبلت
              </span>
              <span>{data.deviceStats.tablet}%</span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${data.deviceStats.tablet}%` }}
                className="h-full bg-emerald-500 rounded-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* کلیک روی شبکه‌های اجتماعی */}
      <div className="bg-white dark:bg-[#1a1e26] rounded-2xl p-4 border border-slate-200 dark:border-white/10">
        <h3 className="font-semibold text-slate-800 dark:text-white mb-3">
          کلیک روی شبکه‌های اجتماعی
        </h3>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-2 rounded-xl bg-pink-50 dark:bg-pink-500/10">
            <Instagram className="w-5 h-5 text-pink-600 mx-auto mb-1" />
            <p className="text-xl font-bold text-pink-600">
              {data.socialClicks.instagram}
            </p>
            <p className="text-[10px] text-slate-500">اینستاگرام</p>
          </div>
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10">
            <Send className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <p className="text-xl font-bold text-blue-600">
              {data.socialClicks.telegram}
            </p>
            <p className="text-[10px] text-slate-500">تلگرام</p>
          </div>
          <div className="p-2 rounded-xl bg-green-50 dark:bg-green-500/10">
            <Phone className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <p className="text-xl font-bold text-green-600">
              {data.socialClicks.whatsapp}
            </p>
            <p className="text-[10px] text-slate-500">واتساپ</p>
          </div>
        </div>
      </div>

      {/* ساعات پربازدید */}
      {data.popularHours.length > 0 && (
        <div className="bg-white dark:bg-[#1a1e26] rounded-2xl p-4 border border-slate-200 dark:border-white/10">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-3">
            ⏰ ساعات پربازدید
          </h3>
          <div className="flex flex-wrap gap-2">
            {data.popularHours.map((item) => (
              <div
                key={item.hour}
                className="flex-1 text-center p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl"
              >
                <p className="text-lg font-bold text-emerald-600">
                  {item.hour}:00
                </p>
                <p className="text-[10px] text-slate-500">{item.count} بازدید</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* نکته پایانی */}
      <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-xl p-4 border border-emerald-200 dark:border-emerald-500/20">
        <p className="text-sm font-medium text-emerald-800 dark:text-emerald-400 text-center">
          💡 برای افزایش بازدید، لینک خود را در شبکه‌های اجتماعی به اشتراک بگذارید
        </p>
      </div>
    </div>
  );
}