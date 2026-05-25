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
} from "lucide-react";

const tabs = [
  { id: "create-link", label: "لینک من", icon: LinkIcon, activeIcon: Zap, href: "/clientdashboard/customer-link" },
  { id: "analytics", label: "آمار", icon: BarChart3, activeIcon: TrendingUp, href: "/clientdashboard/customer-link/analytics" },
  { id: "bookings", label: "نوبت‌ها", icon: Calendar, activeIcon: Calendar, href: "/clientdashboard/customer-link/bookings" },
  { id: "reviews", label: "نظرات", icon: Star, activeIcon: Star, href: "/clientdashboard/customer-link/reviews" },
  { id: "plans", label: "پلن‌ها", icon: Crown, activeIcon: Crown, href: "/clientdashboard/customer-link/plans" },
 
];

export default function CustomerLinkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  
  const pendingCount = 3;
  const businessName = "آرایشگاه مدرن سارا";

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

  return (
    <div className="min-h-screen  lg:w-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rtl pb-20">
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
                  لینک اختصاصی
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {businessName}
                </p>
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
              {pendingCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>

            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 rounded-full bg-gray-100 dark:bg-gray-800"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - بدون انیمیشن */}
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

              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  replace
                  className="relative flex flex-col items-center justify-center flex-1 py-1 group"
                >
                  {/* فقط خط نشانگر فعال - بدون انیمیشن */}
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

                  {tab.id === "bookings" && pendingCount > 0 && (
                    <div className="absolute -top-1 right-1/4 min-w-[18px] h-[18px] bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-[10px] font-bold">
                        {pendingCount}
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

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <>
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-50"
          />
          <div className="fixed right-0 top-0 bottom-0 w-72 bg-white dark:bg-gray-900 z-50 shadow-xl">
            <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-gray-800 dark:text-white">
                  لینک اختصاصی
                </span>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-2">
              {tabs.map((tab) => (
                <Link
                  key={tab.id}
                  href={tab.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    pathname === tab.href
                      ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </Link>
              ))}

              <div className="border-t dark:border-gray-700 my-4 pt-4">
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                  <LogOut className="w-5 h-5" />
                  <span>خروج</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}