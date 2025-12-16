"use client";
import React, { useState, useEffect } from "react";
import {
  Users,
  Briefcase,
  Layers,
  CalendarCheck,
  Wallet,
  BarChart4,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { toast } from "react-hot-toast";
import { TopBusinessesSection } from "./Components/TopBusinessesSection";

interface StatsData {
  title: string;
  value: string | number;
  icon: any;
  color: string;
  bg: string;
}

interface Booking {
  id: number;
  user: string;
  service: string;
  business: string;
  time: string;
  status: "confirmed" | "pending" | "cancelled" | "active" | "done";
  price?: string;
}

interface DashboardStats {
  totalClients: number;
  totalJobs: number;
  totalBookings: number;
  totalClientsCustomers: number;
  activePlans: number;
  totalRevenue: number;
  bookingsByStatus: {
    active: number;
    cancelled: number;
    done: number;
  };
  recentBookings: Booking[];
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [monthlyGrowth, setMonthlyGrowth] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/dashboard/stats");
      const data = await res.json();
      
      if (data.success) {
        setStats(data.stats);
        setMonthlyGrowth(data.monthlyGrowth || []);
      } else {
        toast.error(data.message || "خطا در دریافت اطلاعات داشبورد");
      }
    } catch (err) {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setIsLoading(false);
    }
  };

  // تبدیل وضعیت نوبت‌ها به حالت نمایش
  const mapBookingStatus = (status: string): "confirmed" | "pending" | "cancelled" => {
    switch (status) {
      case 'active': return 'pending';
      case 'done': return 'confirmed';
      case 'cancelled': return 'cancelled';
      default: return 'pending';
    }
  };

  // فرمت اعداد به فارسی با جداکننده هزارگان
  const formatNumber = (num: number) => {
    return num.toLocaleString('fa-IR');
  };

  // فرمت مبلغ به تومان
  const formatCurrency = (amount: number) => {
    if (amount === 0) return "رایگان";
    const formatted = (amount / 1000).toLocaleString('fa-IR');
    return `${formatted} هزار تومان`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-10 h-10 text-emerald-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">در حال دریافت اطلاعات داشبورد...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-4" />
          <p className="text-gray-400">خطا در بارگذاری اطلاعات</p>
          <button 
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition"
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  // داده‌های آمار
  const statsData: StatsData[] = [
    { 
      title: "کلاینت‌های ثبت‌نامی", 
      value: formatNumber(stats.totalClients), 
      icon: Users, 
      color: "text-blue-400", 
      bg: "bg-blue-400/10" 
    },
    { 
      title: "مشاغل ثبت‌شده", 
      value: formatNumber(stats.totalJobs), 
      icon: Briefcase, 
      color: "text-purple-400", 
      bg: "bg-purple-400/10" 
    },
    { 
      title: "کل نوبت‌ها", 
      value: formatNumber(stats.totalBookings), 
      icon: CalendarCheck, 
      color: "text-emerald-400", 
      bg: "bg-emerald-400/10" 
    },
    { 
      title: "مشتریان کلاینت‌ها", 
      value: stats.totalClientsCustomers > 1000 ? 
             `${formatNumber(Math.floor(stats.totalClientsCustomers / 1000))}+` : 
             formatNumber(stats.totalClientsCustomers), 
      icon: Users, 
      color: "text-yellow-400", 
      bg: "bg-yellow-400/10" 
    },
    { 
      title: "پلن‌های فعال", 
      value: formatNumber(stats.activePlans), 
      icon: Layers, 
      color: "text-orange-400", 
      bg: "bg-orange-400/10" 
    },
    { 
      title: "درآمد کل", 
      value: formatCurrency(stats.totalRevenue), 
      icon: Wallet, 
      color: "text-green-400", 
      bg: "bg-green-400/10" 
    },
  ];

  // آمار نوبت‌ها بر اساس وضعیت برای نمایش در کارت
  const bookingStats = [
    { 
      title: "نوبت‌های فعال", 
      value: formatNumber(stats.bookingsByStatus.active), 
      color: "text-yellow-400", 
      bg: "bg-yellow-400/10" 
    },
    { 
      title: "نوبت‌های تکمیل شده", 
      value: formatNumber(stats.bookingsByStatus.done), 
      color: "text-emerald-400", 
      bg: "bg-emerald-400/10" 
    },
    { 
      title: "نوبت‌های لغو شده", 
      value: formatNumber(stats.bookingsByStatus.cancelled), 
      color: "text-red-400", 
      bg: "bg-red-400/10" 
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* هدر با دکمه بروزرسانی */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">
            داشبورد مدیریت
          </h1>
          <p className="text-gray-400 text-sm">
            آمار و اطلاعات لحظه‌ای سیستم
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/20 transition"
          >
            <RefreshCw className="w-4 h-4" />
            بروزرسانی
          </button>
          {monthlyGrowth.length > 0 && (
            <div className="hidden md:flex items-center gap-2 text-sm text-emerald-400">
              <TrendingUp className="w-4 h-4" />
              رشد {Math.round(((monthlyGrowth[monthlyGrowth.length-1]?.count - monthlyGrowth[0]?.count) / monthlyGrowth[0]?.count) * 100)}% در ۶ ماه گذشته
            </div>
          )}
        </div>
      </div>

      {/* 1. کارت‌های آمار اصلی */}
      <section>
        <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
          <BarChart4 className="w-5 h-5 text-emerald-400" />
          آمار کلی سیستم
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {statsData.map((stat, index) => (
            <div key={index} className="bg-[#242933] border border-emerald-500/10 rounded-2xl p-4 hover:border-emerald-500/40 hover:-translate-y-1 transition-all duration-300 shadow-lg group">
              <div className={`w-10 h-10 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
              <p className="text-xs text-gray-400">{stat.title}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 2. آمار نوبت‌ها */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {bookingStats.map((stat, index) => (
            <div key={index} className="bg-[#242933] border border-emerald-500/10 rounded-2xl p-5 hover:border-emerald-500/40 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm text-gray-400">{stat.title}</h4>
                <div className={`w-8 h-8 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center`}>
                  {index === 0 && <Clock className="w-4 h-4" />}
                  {index === 1 && <CheckCircle2 className="w-4 h-4" />}
                  {index === 2 && <XCircle className="w-4 h-4" />}
                </div>
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">{stat.value}</h3>
              <div className={`h-2 rounded-full ${stat.bg} overflow-hidden`}>
                <div 
                  className={`h-full ${stat.color.replace('text-', 'bg-')} rounded-full transition-all duration-1000`}
                  style={{ 
                    width: `${(parseInt(stat.value.replace(/,/g, '')) / stats.totalBookings) * 100}%` 
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. جدول نوبت‌های اخیر */}
      <section className="bg-[#242933] border border-emerald-500/20 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-emerald-500/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            آخرین نوبت‌های ثبت شده
            <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-full mr-2 border border-emerald-500/20">
              {stats.recentBookings.length} مورد اخیر
            </span>
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">
              آخرین بروزرسانی: {new Date().toLocaleTimeString('fa-IR')}
            </span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-[#1a1e26] text-gray-400 text-xs uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">مشتری</th>
                <th className="px-6 py-4 font-medium">خدمت</th>
                <th className="px-6 py-4 font-medium">کسب‌ و کار (کلاینت)</th>
                <th className="px-6 py-4 font-medium">زمان نوبت</th>
                <th className="px-6 py-4 font-medium">وضعیت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-500/10 text-sm">
              {stats.recentBookings.length > 0 ? (
                stats.recentBookings.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 font-medium text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs">
                          {item.user?.[0] || "?"}
                        </div>
                        <span>{item.user || "نامشخص"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {item.service || "تعریف نشده"}
                    </td>
                    <td className="px-6 py-4 text-emerald-300">
                      {item.business || "بدون نام"}
                    </td>
                    <td className="px-6 py-4 text-gray-400 font-mono text-xs">
                      {item.time || "تعریف نشده"}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={mapBookingStatus(item.status)} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center">
                      <CalendarCheck className="w-12 h-12 text-gray-600 mb-3" />
                      <p>هیچ نوبت فعالی یافت نشد</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-emerald-500/10 bg-[#1a1e26]/50">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <div>
              مجموع نوبت‌ها: <span className="text-white font-bold">{formatNumber(stats.totalBookings)}</span>
              <span className="mx-2">•</span>
              فعال: <span className="text-yellow-400 font-bold">{formatNumber(stats.bookingsByStatus.active)}</span>
              <span className="mx-2">•</span>
              تکمیل شده: <span className="text-emerald-400 font-bold">{formatNumber(stats.bookingsByStatus.done)}</span>
              <span className="mx-2">•</span>
              لغو شده: <span className="text-red-400 font-bold">{formatNumber(stats.bookingsByStatus.cancelled)}</span>
            </div>
            <button 
              onClick={() => window.location.href = '/admin/bookings'}
              className="mt-2 md:mt-0 text-xs text-emerald-400 border border-emerald-500/30 px-4 py-2 rounded-lg hover:bg-emerald-500 hover:text-white transition"
            >
              مشاهده همه نوبت‌ها
            </button>
          </div>
        </div>
      </section>

      {/* 4. نمودار رشد (ساده) */}
      {monthlyGrowth.length > 0 && (
        <section className="bg-[#242933] border border-emerald-500/20 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            رشد ماهانه کاربران
          </h3>
          <div className="h-64 flex items-end gap-2">
            {monthlyGrowth.map((month, index) => {
              const maxCount = Math.max(...monthlyGrowth.map(m => m.count));
              const height = (month.count / maxCount) * 100;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="text-xs text-gray-500 mb-1">
                    {month.month.split('-')[1]}/{month.month.split('-')[0]}
                  </div>
                  <div 
                    className="w-full bg-emerald-500/20 rounded-t-lg transition-all duration-500 hover:bg-emerald-500/40"
                    style={{ height: `${height}%` }}
                    title={`${month.count} کاربر`}
                  />
                  <div className="text-xs text-gray-400 mt-1">
                    {formatNumber(month.count)}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className="bg-[#242933] border border-emerald-500/20 rounded-2xl p-6">
  <TopBusinessesSection />
</section>
    </div>

    
  );
}

// کامپوننت وضعیت
function StatusBadge({ status }: { status: "confirmed" | "pending" | "cancelled" }) {
  if (status === "confirmed") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <CheckCircle2 className="w-3.5 h-3.5" />
        تایید شده
      </span>
    );
  }
  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
        <Clock className="w-3.5 h-3.5" />
        در انتظار
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
      <XCircle className="w-3.5 h-3.5" />
      لغو شده
    </span>
  );
}