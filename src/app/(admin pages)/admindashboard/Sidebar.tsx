// File Path: src\app\(admin pages)\admindashboard\Sidebar.tsx

"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation"; // useRouter اضافه شد
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Layers,
  Smartphone,
  BarChart4,
  MessageSquare,
  Settings,
  LogOut,
  CalendarCheck,
  X, 
  MessageSquareIcon
} from "lucide-react";
import toast from "react-hot-toast"; // برای نمایش پیام‌های خروج

// تعریف تایپ برای Props
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter(); // تعریف useRouter

  const menuItems = [
    { href: "/admindashboard", icon: LayoutDashboard, label: "داشبورد اصلی" },
    { href: "/admindashboard/systemstatus", icon: MessageSquareIcon, label: "سیستم پیامکی" },
    { title: "مدیریت کاربران" },
    { href: "/admindashboard/clients", icon: Users, label: "کلاینت‌ها" },
    { href: "/admindashboard/jobs", icon: Briefcase, label: "مشاغل" },
    { title: "سرویس‌ها و مالی" },
    { href: "/admindashboard/plans", icon: Layers, label: "پلن‌ها" },
    { href: "/admindashboard/sms", icon: Smartphone, label: "پلن‌های پیامکی" },
    { title: "اطلاعات و سیستم" },
    { href: "/admindashboard/reports", icon: BarChart4, label: "گزارشات و آمار" },
    { href: "/admindashboard/comments", icon: MessageSquare, label: "دیدگاه‌ها", badge: "5" },
    { href: "/admindashboard/settings", icon: Settings, label: "تنظیمات" },
  ];

  // تابع خروج از حساب
  const handleLogout = async () => {
    onClose(); // بستن منو در موبایل
    
    // از آنجایی که API خروج کوکی را پاک می‌کند، می‌توانیم مستقیماً پس از فراخوانی، کاربر را هدایت کنیم.
    try {
      const res = await fetch("/api/admin/admin-auth/logout", {
        method: "POST",
      });

      if (res.ok) {
        toast.success("با موفقیت خارج شدید.");
      } else {
        // حتی اگر API خطا بدهد، بهتر است به صفحه لاگین هدایت شود
        toast.error("خطا در خروج. در حال هدایت به صفحه لاگین...");
      }

      // هدایت کاربر به صفحه لاگین ادمین
      router.replace("/admin-login");
    } catch (error) {
      console.error("Logout API failed:", error);
      toast.error("خطای شبکه. در حال هدایت به صفحه لاگین...");
      router.replace("/admin-login");
    }
  };


  return (
    <>
      {/* --- OVERLAY (فقط در موبایل وقتی منو باز است) --- */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
          onClick={onClose}
        />
      )}

      {/* --- SIDEBAR --- */}
      <aside 
        className={`
          fixed md:static top-0 right-0 z-50 h-full w-72 
          bg-[#242933] border-l border-emerald-500/20 shadow-2xl 
          flex flex-col transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"}
        `}
      >
        
        {/* هدر سایدبار */}
        <div className="p-6 flex items-center justify-between border-b border-emerald-500/20 bg-[#242933]">
          <div className="flex items-center gap-3">
            {/* آیکون با تم اصلی (سبز) */}
            <CalendarCheck className="w-8 h-8 text-emerald-400" />
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">آن‌تایم</h1>
              <p className="text-xs text-gray-400">پنل مدیریت سیستم</p>
            </div>
          </div>
          {/* دکمه بستن فقط در موبایل */}
          <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* منوها */}
        <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-500/20">
          {menuItems.map((item, index) => {
            if (item.title) {
              return (
                <div key={index} className="py-3 px-4 text-xs font-bold text-gray-500 mt-2">
                  {item.title}
                </div>
              );
            }

            const isActive = pathname === item.href;
            const Icon = item.icon!;

            return (
              <Link
                key={index}
                href={item.href || "#"}
                onClick={onClose}
                className={`
                  w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group
                  ${isActive 
                    // بازگشت به تم سبز زمردی
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_-3px_rgba(16,185,129,0.2)]" 
                    : "text-gray-400 hover:bg-white/5 hover:text-gray-200"}
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? "text-emerald-400" : "group-hover:text-emerald-300 transition"}`} />
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full shadow-lg shadow-emerald-500/40">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* دکمه خروج (معمولاً قرمز می‌ماند اما اگر بخواهید سبز شود بگویید) */}
        <div className="p-4 border-t border-emerald-500/20 bg-[#242933]">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-400 transition"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">خروج از حساب</span>
          </button>
        </div>
      </aside>
    </>
  );
}