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
  RefreshCw,
  Star,
  BarChart3,
  Activity,
  MapPin,
  Share2,
  Globe,
  Link as LinkIcon,
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
    rubika: number;
    eitaa: number;
    bale: number;
    soroush: number;
  };
  shareClicks: { total: number; native_share: number; copy_link: number };
  weeklyVisits: number[];
  deviceStats: { mobile: number; desktop: number; tablet: number };
  popularHours: { hour: number; count: number }[];
  trafficSources: {
    source: string;
    sourcePersian: string;
    count: number;
    percentage: number;
  }[];
  topCities: { name: string; count: number }[];
  browsers: { name: string; count: number }[];
  osStats: { name: string; count: number }[];
  avgTimeAccurate: number;
  avgScrollDepth: number;
}

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [period, setPeriod] = useState<"week" | "month">("week");

  const fetchAnalytics = async (showToast = false) => {
    try {
      const res = await fetch(
        `/api/client/customer-link/analytics?period=${period}`
      );
      const result = await res.json();
      if (result.success) {
        setData(result.data);
        if (showToast) toast.success("آمار با موفقیت بروزرسانی شد");
      } else {
        toast.error(result.message || "خطا در دریافت آمار");
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

  if (!data) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">هیچ داده آماری موجود نیست</p>
          <p className="text-sm text-slate-400 mt-1">
            پس از بازدید کاربران، آمار نمایش داده می‌شود
          </p>
        </div>
      </div>
    );
  }

  const weekDays = [
    "شنبه",
    "یکشنبه",
    "دوشنبه",
    "سه‌شنبه",
    "چهارشنبه",
    "پنجشنبه",
    "جمعه",
  ];
  const maxWeekly = Math.max(...data.weeklyVisits, 1);
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "direct":
        return <Globe className="w-4 h-4" />;
      case "google":
        return <Globe className="w-4 h-4 text-blue-500" />;
      case "instagram":
        return <Instagram className="w-4 h-4 text-pink-500" />;
      case "telegram":
        return <Send className="w-4 h-4 text-blue-500" />;
      case "whatsapp":
        return <Phone className="w-4 h-4 text-green-500" />;
      default:
        return <LinkIcon className="w-4 h-4" />;
    }
  };

  const allSocials = [
    {
      key: "instagram",
      icon: Instagram,
      color: "text-pink-600",
      bg: "bg-pink-50 dark:bg-pink-500/10",
      name: "اینستاگرام",
    },
    {
      key: "telegram",
      icon: Send,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-500/10",
      name: "تلگرام",
    },
    {
      key: "whatsapp",
      icon: Phone,
      color: "text-green-600",
      bg: "bg-green-50 dark:bg-green-500/10",
      name: "واتساپ",
    },
    {
      key: "rubika",
      icon: MessageCircle,
      color: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-500/10",
      name: "روبیکا",
    },
    {
      key: "eitaa",
      icon: MessageCircle,
      color: "text-purple-600",
      bg: "bg-purple-50 dark:bg-purple-500/10",
      name: "ایتا",
    },
    {
      key: "bale",
      icon: MessageCircle,
      color: "text-amber-600",
      bg: "bg-amber-50 dark:bg-amber-500/10",
      name: "بله",
    },
    {
      key: "soroush",
      icon: MessageCircle,
      color: "text-indigo-600",
      bg: "bg-indigo-50 dark:bg-indigo-500/10",
      name: "سروش",
    },
  ];
  const activeSocials = allSocials.filter(
    (social) =>
      (data.socialClicks[social.key as keyof typeof data.socialClicks] ?? 0) >
      0
  );

  return (
    <div className="space-y-5 pb-20">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">
            📊 آمار بازدید
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            آمار لحظه‌ای لینک اختصاصی شما
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition disabled:opacity-50"
        >
          <RefreshCw
            className={`w-5 h-5 text-slate-600 dark:text-gray-400 ${
              isRefreshing ? "animate-spin" : ""
            }`}
          />
        </button>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2 bg-slate-100 dark:bg-white/5 rounded-xl p-1 w-fit">
        <button
          onClick={() => setPeriod("week")}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
            period === "week"
              ? "bg-emerald-600 text-white shadow-md"
              : "text-slate-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-white/10"
          }`}
        >
          هفته جاری
        </button>
        <button
          onClick={() => setPeriod("month")}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
            period === "month"
              ? "bg-emerald-600 text-white shadow-md"
              : "text-slate-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-white/10"
          }`}
        >
          ماه جاری
        </button>
      </div>

      {/* Stats Cards - ردیف اول */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-[#1a1e26] rounded-xl p-4 border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Eye className="w-5 h-5 text-emerald-500" />
            <span className="text-xs text-slate-400">کل بازدید</span>
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-white">
            {data.totalVisits.toLocaleString()}
          </p>
        </div>
        <div className="bg-white dark:bg-[#1a1e26] rounded-xl p-4 border border-slate-200 dark:border-white/10 shadow-sm">
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
        <div className="bg-white dark:bg-[#1a1e26] rounded-xl p-3 text-center border border-slate-200 dark:border-white/10 shadow-sm">
          <TrendingUp className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
          <p className="text-xl font-bold text-slate-800 dark:text-white">
            {data.todayVisits}
          </p>
          <p className="text-xs text-slate-500">بازدید امروز</p>
        </div>
        <div className="bg-white dark:bg-[#1a1e26] rounded-xl p-3 text-center border border-slate-200 dark:border-white/10 shadow-sm">
          <Clock className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
          <p className="text-xl font-bold text-slate-800 dark:text-white">
            {formatTime(data.avgTimeAccurate || data.avgTimeOnPage)}
          </p>
          <p className="text-xs text-slate-500">میانگین زمان</p>
        </div>
        <div className="bg-white dark:bg-[#1a1e26] rounded-xl p-3 text-center border border-slate-200 dark:border-white/10 shadow-sm">
          <MousePointer className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
          <p className="text-xl font-bold text-slate-800 dark:text-white">
            {data.bounceRate}%
          </p>
          <p className="text-xs text-slate-500">نرخ پرش</p>
        </div>
      </div>

      {/* نمودار بازدیدها */}
      <div className="bg-white dark:bg-[#1a1e26] rounded-2xl p-4 border border-slate-200 dark:border-white/10 shadow-sm">
        <h3 className="font-semibold text-slate-800 dark:text-white mb-4">
          بازدیدهای {period === "week" ? "هفته جاری" : "۳۰ روز اخیر"}
        </h3>
        <div
          className="flex items-end justify-between gap-1 sm:gap-2"
          style={{ height: "200px" }}
        >
          {data.weeklyVisits.map((val, i) => {
            const value = Number(val) || 0;
            const height = (value / maxWeekly) * 100;
            return (
              <div
                key={i}
                className="flex-1 text-center h-full flex flex-col justify-end"
              >
                <div
                  className="bg-gradient-to-t from-emerald-500 to-teal-500 rounded-lg cursor-pointer group relative w-full"
                  style={{
                    height: `${height}%`,
                    minHeight: value > 0 ? "20px" : "4px",
                  }}
                >
                  <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                    {value}
                  </div>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-500 mt-2">
                  {period === "week" ? weekDays[i] : `${i + 1}`}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* منبع ترافیک */}
      {data.trafficSources && data.trafficSources.length > 0 && (
        <div className="bg-white dark:bg-[#1a1e26] rounded-2xl p-4 border border-slate-200 dark:border-white/10 shadow-sm">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-500" />
            نحوه ورود بازدیدکنندگان
          </h3>
          <div className="space-y-3">
            {data.trafficSources.map((source, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="flex items-center gap-2">
                    {getSourceIcon(source.source)}
                    {source.sourcePersian}
                  </span>
                  <span className="font-medium">
                    {source.count} ({source.percentage}%)
                  </span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${source.percentage}%` }}
                    className="h-full bg-emerald-500 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* موقعیت جغرافیایی */}
      {data.topCities && data.topCities.length > 0 && (
        <div className="bg-white dark:bg-[#1a1e26] rounded-2xl p-4 border border-slate-200 dark:border-white/10 shadow-sm">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-500" />
            موقعیت جغرافیایی
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {data.topCities.map((city, idx) => (
              <div
                key={idx}
                className="text-center p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl"
              >
                <p className="font-bold text-emerald-700 dark:text-emerald-400">
                  {city.name}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {city.count} بازدید
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* آمار تعامل */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-[#1a1e26] rounded-xl p-4 border border-slate-200 dark:border-white/10 shadow-sm">
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
        <div className="bg-white dark:bg-[#1a1e26] rounded-xl p-4 border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-5 h-5 text-emerald-500" />
            <span className="text-sm font-medium">نظرات</span>
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-white">
            {data.totalReviews}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            میانگین امتیاز: {data.avgRating ? data.avgRating.toFixed(1) : "0.0"}
          </p>
        </div>
      </div>

      {/* آمار دستگاه‌ها */}
      <div className="bg-white dark:bg-[#1a1e26] rounded-2xl p-4 border border-slate-200 dark:border-white/10 shadow-sm">
        <h3 className="font-semibold text-slate-800 dark:text-white mb-3">
          دستگاه‌های بازدیدکننده
        </h3>
        <div className="space-y-3">
          {[
            {
              label: "موبایل",
              icon: Smartphone,
              percent: data.deviceStats.mobile,
            },
            {
              label: "دسکتاپ",
              icon: Monitor,
              percent: data.deviceStats.desktop,
            },
            { label: "تبلت", icon: Tablet, percent: data.deviceStats.tablet },
          ].map((item, idx) => (
            <div key={idx}>
              <div className="flex justify-between text-sm mb-1">
                <span className="flex items-center gap-1">
                  <item.icon className="w-4 h-4 text-emerald-500" />{" "}
                  {item.label}
                </span>
                <span>{item.percent}%</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.percent}%` }}
                  className="h-full bg-emerald-500 rounded-full"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* مرورگرها و سیستم عامل */}
      <div className="grid grid-cols-2 gap-3">
        {data.browsers && data.browsers.length > 0 && (
          <div className="bg-white dark:bg-[#1a1e26] rounded-xl p-4 border border-slate-200 dark:border-white/10 shadow-sm">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-2 text-sm">
              مرورگرهای محبوب
            </h3>
            <div className="space-y-2">
              {data.browsers.slice(0, 3).map((browser, idx) => (
                <div key={idx} className="flex justify-between text-xs">
                  <span>{browser.name}</span>
                  <span className="font-medium">{browser.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {data.osStats && data.osStats.length > 0 && (
          <div className="bg-white dark:bg-[#1a1e26] rounded-xl p-4 border border-slate-200 dark:border-white/10 shadow-sm">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-2 text-sm">
              سیستم‌عامل‌ها
            </h3>
            <div className="space-y-2">
              {data.osStats.slice(0, 3).map((os, idx) => (
                <div key={idx} className="flex justify-between text-xs">
                  <span>{os.name}</span>
                  <span className="font-medium">{os.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* کلیک روی شبکه‌های اجتماعی */}
      <div className="bg-white dark:bg-[#1a1e26] rounded-2xl p-4 border border-slate-200 dark:border-white/10 shadow-sm">
        <h3 className="font-semibold text-slate-800 dark:text-white mb-3">
          کلیک روی شبکه‌های اجتماعی
        </h3>
        {activeSocials.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {activeSocials.map((social) => {
              const Icon = social.icon;
              const count =
                data.socialClicks[
                  social.key as keyof typeof data.socialClicks
                ] ?? 0;
              return (
                <div
                  key={social.key}
                  className={`p-3 rounded-xl ${social.bg} text-center`}
                >
                  <Icon className={`w-6 h-6 ${social.color} mx-auto mb-1`} />
                  <p className={`text-xl font-bold ${social.color}`}>{count}</p>
                  <p className="text-[10px] text-slate-500">{social.name}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-slate-500">
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">هنوز هیچ کلیکی ثبت نشده است</p>
            <p className="text-xs mt-1">
              لینک خود را در شبکه‌های اجتماعی به اشتراک بگذارید
            </p>
          </div>
        )}
      </div>

      {/* کلیک روی اشتراک‌گذاری */}
      {data.shareClicks && data.shareClicks.total > 0 && (
        <div className="bg-white dark:bg-[#1a1e26] rounded-2xl p-4 border border-slate-200 dark:border-white/10 shadow-sm">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-emerald-500" />
            اشتراک‌گذاری لینک
          </h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {data.shareClicks.total}
              </p>
              <p className="text-xs text-slate-500">کل کلیک</p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {data.shareClicks.native_share}
              </p>
              <p className="text-xs text-slate-500">اشتراک Native</p>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-500/10 rounded-xl">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {data.shareClicks.copy_link}
              </p>
              <p className="text-xs text-slate-500">کپی لینک</p>
            </div>
          </div>
        </div>
      )}

      {/* عمق اسکرول */}
      {data.avgScrollDepth > 0 && (
        <div className="bg-white dark:bg-[#1a1e26] rounded-2xl p-4 border border-slate-200 dark:border-white/10 shadow-sm">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-3">
            📜 میانگین عمق اسکرول
          </h3>
          <div className="text-center">
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {data.avgScrollDepth}%
            </p>
            <p className="text-xs text-slate-500 mt-1">
              میانگین میزان اسکرول کاربران
            </p>
            <div className="mt-3 h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                style={{ width: `${data.avgScrollDepth}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ساعات پربازدید */}
      {data.popularHours.length > 0 && (
        <div className="bg-white dark:bg-[#1a1e26] rounded-2xl p-4 border border-slate-200 dark:border-white/10 shadow-sm">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-3">
            ⏰ ساعات پربازدید
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {data.popularHours.map((item) => (
              <div
                key={item.hour}
                className="text-center p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl"
              >
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {item.hour.toString().padStart(2, "0")}:00
                </p>
                <p className="text-[10px] text-slate-500">
                  {item.count} بازدید
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-500/10 dark:to-teal-500/10 rounded-xl p-4 border border-emerald-200 dark:border-emerald-500/20">
        <p className="text-sm font-medium text-emerald-800 dark:text-emerald-400 text-center flex items-center justify-center gap-2">
          💡 برای افزایش بازدید، لینک اختصاصی خود را در شبکه‌های اجتماعی به
          اشتراک بگذارید
        </p>
      </div>
    </div>
  );
}