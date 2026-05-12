// src/app/(admin pages)/admindashboard/components/AppInstallStats.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Smartphone, Download, Users, Calendar, TrendingUp, RefreshCw } from "lucide-react";

interface InstallStats {
  total: number;
  filteredTotal: number;
  users: number;
  staffs: number;
  filteredUsers: number;
  filteredStaffs: number;
  today: {
    total: number;
    users: number;
    staffs: number;
  };
}

interface DailyStat {
  date: string;
  total: number;
}

interface RecentInstall {
  id: number;
  type: "user" | "staff";
  name: string;
  business_name: string | null;
  phone: string;
  installed_at: string;
}

const AppInstallStats: React.FC = () => {
  const [stats, setStats] = useState<InstallStats | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [recentInstalls, setRecentInstalls] = useState<RecentInstall[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<"all" | "today" | "week" | "month">("all");

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/app-install-stats?period=${period}`);
      const data = await res.json();
      
      if (data.success) {
        setStats(data.stats);
        setDailyStats(data.dailyStats || []);
        setRecentInstalls(data.recentInstalls || []);
      } else {
        console.error("API Error:", data.message);
      }
    } catch (error) {
      console.error("Error fetching app install stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [period]);

  const formatNumber = (num: number) => {
    return num.toLocaleString("fa-IR");
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("fa-IR", {
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="bg-[#242933] border border-emerald-500/20 rounded-2xl p-6">
        <div className="flex items-center justify-center h-32">
          <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin" />
        </div>
      </div>
    );
  }

  const safeStats = stats || {
    total: 0,
    filteredTotal: 0,
    users: 0,
    staffs: 0,
    filteredUsers: 0,
    filteredStaffs: 0,
    today: { total: 0, users: 0, staffs: 0 }
  };

  // مقدار نمایشی برای کل نصب‌ها بر اساس فیلتر
  const displayTotal = period === "all" ? safeStats.total : safeStats.filteredTotal;
  const displayUsers = period === "all" ? safeStats.users : safeStats.filteredUsers;
  const displayStaffs = period === "all" ? safeStats.staffs : safeStats.filteredStaffs;

  return (
    <div className="space-y-6">
      {/* هدر */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Smartphone className="w-6 h-6 text-emerald-400" />
          <h2 className="text-lg font-bold text-white">آمار نصب اپلیکیشن</h2>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-[#1a1e26] rounded-lg p-1">
            {[
              { value: "all", label: "همه زمان‌ها" },
              { value: "today", label: "امروز" },
              { value: "week", label: "هفته اخیر" },
              { value: "month", label: "ماه اخیر" },
            ].map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value as any)}
                className={`px-3 py-1.5 rounded-md text-sm transition ${
                  period === p.value
                    ? "bg-emerald-500 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          
          <button
            onClick={fetchStats}
            className="p-2 bg-[#1a1e26] rounded-lg hover:bg-[#2a2f3a] transition"
          >
            <RefreshCw className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* کارت‌های آماری */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#242933] border border-emerald-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
              <Download className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-xs text-gray-500">کل نصب‌ها</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatNumber(displayTotal)}</p>
          <p className="text-xs text-gray-400 mt-1">
            {period !== "all" && `از ${safeStats.total} کل`}
            {safeStats.today.total > 0 && period === "today" && `+${safeStats.today.total} امروز`}
          </p>
        </div>

        <div className="bg-[#242933] border border-emerald-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-xs text-gray-500">رییس‌ها</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatNumber(displayUsers)}</p>
          <p className="text-xs text-gray-400 mt-1">
            {period !== "all" && `از ${safeStats.users} کل`}
          </p>
        </div>

        <div className="bg-[#242933] border border-emerald-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-xs text-gray-500">پرسنل</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatNumber(displayStaffs)}</p>
          <p className="text-xs text-gray-400 mt-1">
            {period !== "all" && `از ${safeStats.staffs} کل`}
          </p>
        </div>

        <div className="bg-[#242933] border border-emerald-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-orange-400" />
            </div>
            <span className="text-xs text-gray-500">نرخ رشد</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {dailyStats.length > 1 && dailyStats[dailyStats.length-1]?.total > 0 && safeStats.total > 0
              ? `+${Math.round((dailyStats[dailyStats.length-1]?.total / safeStats.total) * 100)}%`
              : "۰%"}
          </p>
          <p className="text-xs text-gray-400 mt-1">در ۳۰ روز اخیر</p>
        </div>
      </div>

      {/* نمودار */}
      {dailyStats.length > 0 && (
        <div className="bg-[#242933] border border-emerald-500/20 rounded-xl p-5">
          <h3 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            روند نصب در ۳۰ روز اخیر
          </h3>
          <div className="relative h-48">
            <div className="absolute inset-0 flex items-end gap-1">
              {dailyStats.map((stat, index) => {
                const maxTotal = Math.max(...dailyStats.map(s => s.total), 1);
                const height = (stat.total / maxTotal) * 100;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-emerald-500/30 rounded-t hover:bg-emerald-500/50 transition cursor-pointer group relative"
                      style={{ height: `${height}%` }}
                    >
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                        {stat.total} نصب
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-500 mt-1">
                      {stat.date?.slice(5)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* آخرین نصب‌ها */}
      {recentInstalls.length > 0 && (
        <div className="bg-[#242933] border border-emerald-500/20 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-gray-700">
            <h3 className="text-sm font-medium text-gray-400">
              آخرین نصب‌ها 
              <span className="mr-2 text-xs text-emerald-400">({recentInstalls.length} مورد)</span>
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-[#1a1e26] text-gray-500 text-xs">
                <tr>
                  <th className="px-5 py-3">نوع</th>
                  <th className="px-5 py-3">نام</th>
                  <th className="px-5 py-3">کسب‌وکار</th>
                  <th className="px-5 py-3">شماره تماس</th>
                  <th className="px-5 py-3">زمان نصب</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {recentInstalls.map((install) => (
                  <tr key={`${install.type}-${install.id}`} className="hover:bg-white/5">
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs ${
                          install.type === "user"
                            ? "bg-blue-500/10 text-blue-400"
                            : "bg-purple-500/10 text-purple-400"
                        }`}
                      >
                        {install.type === "user" ? "رییس" : "پرسنل"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-white text-sm">{install.name}</td>
                    <td className="px-5 py-3 text-gray-400 text-sm">
                      {install.business_name || "-"}
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-sm dir-ltr">
                      {install.phone}
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs">
                      {formatDate(install.installed_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* پیام در صورت عدم وجود نصب */}
      {recentInstalls.length === 0 && safeStats.total === 0 && (
        <div className="bg-[#242933] border border-emerald-500/20 rounded-xl p-8 text-center">
          <Smartphone className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">هیچ نصب اپلیکیشنی ثبت نشده است</p>
          <p className="text-gray-500 text-sm mt-2">
            با نصب اولین اپلیکیشن، آمار اینجا نمایش داده می‌شود
          </p>
        </div>
      )}
    </div>
  );
};

export default AppInstallStats;