"use client";

import { motion } from "framer-motion";
import { Home, Calendar, Star } from "lucide-react";

interface Tab {
  id: "info" | "booking" | "reviews";
  label: string;
  icon: any;
}

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: "info" | "booking" | "reviews") => void;
  visibleTabs?: Tab[]; // تب‌های قابل نمایش (اختیاری، برای سازگاری با قبل)
}

// تب‌های پیش‌فرض (برای زمانی که visibleTabs ارسال نشده)
const defaultTabs: Tab[] = [
  { id: "info", label: "معرفی", icon: Home },
  { id: "booking", label: "نوبت دهی", icon: Calendar },
  { id: "reviews", label: "نظرات", icon: Star },
];

export function BottomNav({ activeTab, onTabChange, visibleTabs }: BottomNavProps) {
  // استفاده از تب‌های ارسالی یا تب‌های پیش‌فرض
  const tabs = visibleTabs || defaultTabs;

  // محاسبه عرض دکمه‌ها بر اساس تعداد تب‌ها
  const getButtonWidth = () => {
    if (tabs.length === 2) return "flex-1";
    return "flex-1";
  };

  return (
    <nav className="fixed  max-w-md m-auto bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-t border-white/10 safe-bottom">
      <div className="flex items-center justify-around px-4 py-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center py-1 ${getButtonWidth()}`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-2 w-8 h-1 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <Icon
                className={`w-5 h-5 transition-all ${
                  isActive ? "text-emerald-400" : "text-gray-500"
                }`}
              />
              <span
                className={`text-xs mt-1 transition-all ${
                  isActive ? "text-emerald-400" : "text-gray-500"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}