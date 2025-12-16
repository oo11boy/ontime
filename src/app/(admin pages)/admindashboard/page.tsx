// File Path: src\app\(admin pages)\admindashboard\page.tsx

"use client";
import React from "react";
import {
  Users,
  Briefcase,
  Layers,
  CalendarCheck,
  Wallet,
  BarChart4,
  CheckCircle2,
  Clock,
  XCircle
} from "lucide-react";

// --- داده‌های نمونه ---
const statsData = [
  { title: "کلاینت‌های ثبت‌نامی", value: "1,240", icon: Users, color: "text-blue-400", bg: "bg-blue-400/10" },
  { title: "مشاغل ثبت‌شده", value: "850", icon: Briefcase, color: "text-purple-400", bg: "bg-purple-400/10" },
  { title: "کل نوبت‌ها", value: "14,302", icon: CalendarCheck, color: "text-emerald-400", bg: "bg-emerald-400/10" },
  { title: "مشتریان کلاینت‌ها", value: "45,000+", icon: Users, color: "text-yellow-400", bg: "bg-yellow-400/10" },
  { title: "پلن‌های فعال", value: "320", icon: Layers, color: "text-orange-400", bg: "bg-orange-400/10" },
  { title: "درآمد کل", value: "2.4B تومن", icon: Wallet, color: "text-green-400", bg: "bg-green-400/10" },
];

const lastAppointments = [
  { id: 101, user: "مریم احمدی", service: "کاشت ناخن", business: "سالن زیبایی گلها", time: "۱۴:۰۰ - امروز", status: "confirmed", price: "450,000" },
  { id: 102, user: "علی حسینی", service: "اصلاح مو", business: "پیرایش مدرن", time: "۱۵:۳۰ - امروز", status: "pending", price: "200,000" },
  { id: 103, user: "سارا نوری", service: "مشاوره پوست", business: "کلینیک دکتر راد", time: "۱۶:۰۰ - امروز", status: "confirmed", price: "800,000" },
  { id: 104, user: "کامران کیانی", service: "تعویض روغن", business: "تعمیرگاه مرکزی", time: "۰۹:۰۰ - فردا", status: "pending", price: "350,000" },
  { id: 105, user: "زهرا موسوی", service: "ماساژ درمانی", business: "مرکز اسپا", time: "۱۰:۳۰ - فردا", status: "cancelled", price: "600,000" },
  { id: 106, user: "رضا کریمی", service: "ویزیت دندانپزشکی", business: "مطب دکتر سیب", time: "۱۱:۰۰ - فردا", status: "confirmed", price: "Free" },
  { id: 107, user: "الناز شاکری", service: "اکستنشن مژه", business: "سالن وایولت", time: "۱۲:۰۰ - فردا", status: "confirmed", price: "550,000" },
  { id: 108, user: "محمد تقی‌پور", service: "کارواش نانو", business: "کارواش لوکس", time: "۱۶:۴۵ - فردا", status: "pending", price: "150,000" },
  { id: 109, user: "نیما یوشیج", service: "رزرو میز شام", business: "رستوران ایتالیایی", time: "۲۰:۰۰ - جمعه", status: "confirmed", price: "--", },
  { id: 110, user: "پریناز ایزدی", service: "تراپی مو", business: "سالن زیبایی گلها", time: "۱۰:۰۰ - شنبه", status: "confirmed", price: "1,200,000" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 1. کارت‌های آمار */}
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

      {/* 2. جدول نوبت‌های اخیر */}
      <section className="bg-[#242933] border border-emerald-500/20 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-emerald-500/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            آخرین نوبت‌های ثبت شده
            <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-full mr-2 border border-emerald-500/20">۱۰ مورد اخیر</span>
          </h3>
          <button className="text-xs text-emerald-400 border border-emerald-500/30 px-4 py-2 rounded-lg hover:bg-emerald-500 hover:text-white transition">
            مشاهده همه نوبت‌ها
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-[#1a1e26] text-gray-400 text-xs uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">مشتری</th>
                <th className="px-6 py-4 font-medium">خدمت</th>
                <th className="px-6 py-4 font-medium">کسب‌ و کار (کلاینت)</th>
                <th className="px-6 py-4 font-medium">زمان نوبت</th>
                <th className="px-6 py-4 font-medium">مبلغ</th>
                <th className="px-6 py-4 font-medium">وضعیت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-500/10 text-sm">
              {lastAppointments.map((item) => (
                <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4 font-medium text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs">
                            {item.user[0]}
                        </div>
                        {item.user}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-300">{item.service}</td>
                  <td className="px-6 py-4 text-emerald-300">{item.business}</td>
                  <td className="px-6 py-4 text-gray-400 font-mono text-xs">{item.time}</td>
                  <td className="px-6 py-4 text-white font-bold">{item.price}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={item.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}

// بج وضعیت برای جدول (اختصاصی این صفحه)
function StatusBadge({ status }: { status: string }) {
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