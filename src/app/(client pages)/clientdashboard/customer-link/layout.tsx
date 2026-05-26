// src/app/clientdashboard/customer-link/layout.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Link as LinkIcon,
  BarChart3,
  User,
  Calendar,
  Star,
  Zap,
  TrendingUp,
  Bell,
  Moon,
  Sun,
  Menu,
  X,
  LogOut,
  Home,
  Crown,
  MessageSquare,
  Settings, // اضافه کردن آیکون تنظیمات
} from "lucide-react";
import { toast } from "react-hot-toast";

// حذف "plans" و اضافه کردن "settings"
const tabs = [
  { id: "create-link", label: "لینک من", icon: LinkIcon, activeIcon: Zap, href: "/clientdashboard/customer-link" },
  { id: "analytics", label: "آمار", icon: BarChart3, activeIcon: TrendingUp, href: "/clientdashboard/customer-link/analytics" },
  { id: "bookings", label: "نوبت‌ها", icon: Calendar, activeIcon: Calendar, href: "/clientdashboard/customer-link/bookings" },
  { id: "reviews", label: "نظرات", icon: Star, activeIcon: Star, href: "/clientdashboard/customer-link/reviews" },
  { id: "settings", label: "تنظیمات", icon: Settings, activeIcon: Settings, href: "/clientdashboard/customer-link/settings" }, // جدید
];

export default function CustomerLinkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [pendingBookingsCount, setPendingBookingsCount] = useState(0);
  const [pendingReviewsCount, setPendingReviewsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  
  // دریافت تعداد درخواست‌های نوبت در انتظار تایید
  const fetchPendingBookings = async () => {
    try {
      const res = await fetch("/api/client/booking-changes");
      const data = await res.json();
      
      if (data.success && data.changes) {
        const pending = data.changes.filter(
          (change: any) => change.status === "pending"
        ).length;
        setPendingBookingsCount(pending);
      }
    } catch (error) {
      console.error("Error fetching pending bookings:", error);
    }
  };

  // دریافت تعداد نظرات در انتظار تایید
  const fetchPendingReviews = async () => {
    try {
      const res = await fetch("/api/client/reviews?status=pending");
      const data = await res.json();
      
      if (data.success && data.data) {
        setPendingReviewsCount(data.data.length);
      }
    } catch (error) {
      console.error("Error fetching pending reviews:", error);
    }
  };

  // دریافت هر دو تعداد
  const fetchAllCounts = async () => {
    await Promise.all([fetchPendingBookings(), fetchPendingReviews()]);
    setLoading(false);
  };

  useEffect(() => {
    fetchAllCounts();
    
    // آپدیت هر 30 ثانیه
    const interval = setInterval(fetchAllCounts, 30000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  // محاسبه مجموع درخواست‌های در انتظار برای زنگوله
  const totalPending = pendingBookingsCount + pendingReviewsCount;

  return (
    <div className="min-h-screen lg:w-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rtl pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/clientdashboard")}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
            >
              <Home className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-800 dark:text-white text-sm">
                  صفحه اختصاصی
                </h1>
          
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 relative">
              <Bell className="w-5 h-5" />
              {totalPending > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full flex items-center justify-center px-1">
                  <span className="text-white text-[10px] font-bold">
                    {totalPending > 99 ? "99+" : totalPending}
                  </span>
                </span>
              )}
            </button>

          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-4 pb-8 max-w-3xl mx-auto">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed max-w-md m-auto bottom-0 left-0 right-0 z-50">
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="flex items-center justify-around px-4 py-2">
            {tabs.map((tab) => {
              const isActive = pathname === tab.href;
              const Icon = tab.icon;
              
              // تعیین تعداد pending برای هر تب
              let badgeCount = 0;
              if (tab.id === "bookings") badgeCount = pendingBookingsCount;
              if (tab.id === "reviews") badgeCount = pendingReviewsCount;

              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  replace
                  className="relative flex flex-col items-center justify-center flex-1 py-1 group"
                >
                  {/* خط نشانگر فعال */}
                  {isActive && (
                    <div className="absolute -top-2 w-8 h-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full" />
                  )}

                  <div className={`transition-colors duration-150 ${
                    isActive
                      ? "text-purple-600 dark:text-purple-400"
                      : "text-gray-500 dark:text-gray-400"
                  }`}>
                    <Icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-150" />
                  </div>

                  <span className={`text-xs mt-1 font-medium ${
                    isActive
                      ? "text-purple-600 dark:text-purple-400"
                      : "text-gray-500 dark:text-gray-400"
                  }`}>
                    {tab.label}
                  </span>

                  {/* Badge برای نوبت‌ها و نظرات */}
                  {badgeCount > 0 && (
                    <div className="absolute -top-1 right-1/4 min-w-[18px] h-[18px] bg-red-500 rounded-full flex items-center justify-center px-1">
                      <span className="text-white text-[10px] font-bold">
                        {badgeCount > 99 ? "99+" : badgeCount}
                      </span>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
          
          <div className="flex justify-center pb-2 pt-1">
            <div className="w-32 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
          </div>
        </div>
      </nav>

    </div>
  );
}