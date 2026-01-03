"use client";

import React, { useState } from "react";
import { 
  PhoneCall, UserPlus, Info, Headset, GraduationCap,
  Clock, CalendarOff, Building2, Calendar, ChevronRight
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const DashboardQuickActions = () => {
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const openGoftino = () => {
    if (typeof window !== "undefined" && (window as any).Goftino) {
      (window as any).Goftino.open();
    } else {
      alert("سیستم پشتیبانی در حال بارگذاری است.");
    }
  };

  const actions = [
    { id: 1, label: "پشتیبانی", icon: Headset, onClick: openGoftino, color: "#10b981", bg: "rgba(16,185,129,0.1)", badge: true },
    { id: 2, label: "آموزش", icon: GraduationCap, onClick: () => setShowModal(true), color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
    { id: 3, label: "ارتباط با ما", icon: PhoneCall, href: "./clientdashboard/support", color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
    { id: 4, label: "افزودن پرسنل", icon: UserPlus, onClick: () => setShowModal(true), color: "#8b5cf6", bg: "rgba(139,92,246,0.1)" },
    { id: 5, label: "تنظیم شیفت", icon: Clock, onClick: () => router.push("/clientdashboard/settings?tab=shifts"), color: "#ec4899", bg: "rgba(236,72,153,0.1)" },
    { id: 6, label: "روزهای تعطیل", icon: CalendarOff, onClick: () => router.push("/clientdashboard/settings?tab=holidays"), color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
    { id: 7, label: "اطلاعات بیزنس", icon: Building2, onClick: () => router.push("/clientdashboard/settings?tab=business"), color: "#06b6d4", bg: "rgba(6,182,212,0.1)" },
    { id: 8, label: "تقویم نوبت‌ها", icon: Calendar, onClick: () => router.push("/clientdashboard/calendar"), color: "#10b981", bg: "rgba(16,185,129,0.1)" },
  ];

  return (
    <div className="w-full px-4 py-6" dir="rtl">
      {/* هدر بخش دسترسی سریع */}
      <div className="flex items-center justify-between mb-6 px-1">
        <h2 className="text-lg font-black text-white/90 tracking-tight flex items-center gap-2">
          <span className="w-2 h-5 bg-emerald-500 rounded-full" />
          دسترسی سریع
        </h2>
        <span className="text-[10px] font-bold text-gray-500 bg-white/5 px-3 py-1 rounded-full uppercase tracking-widest">Shortcut</span>
      </div>

      {/* Grid Container */}
      <div className="grid grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
        {actions.map((action, index) => {
          const Icon = action.icon;
          const content = (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: index * 0.05, type: "spring", stiffness: 260, damping: 20 }}
              className="relative flex flex-col items-center justify-center aspect-square rounded-lg bg-[#161b26] border border-white/[0.05] shadow-xl group overflow-hidden active:scale-90 transition-transform"
            >
              {/* Overlay Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              {/* Badge */}
              {action.badge && (
                <span className="absolute top-3 right-3 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              )}

              {/* Icon Container */}
              <div 
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center mb-2 shadow-inner"
                style={{ backgroundColor: action.bg, color: action.color }}
              >
                <Icon strokeWidth={2.5} size={22} className="sm:w-6 sm:h-6" />
              </div>

              <span className="text-[9px] sm:text-[11px] font-black text-gray-400 group-hover:text-white transition-colors">
                {action.label}
              </span>
            </motion.div>
          );

          return (
            <div key={action.id} className="cursor-pointer">
              {action.href ? (
                <Link href={action.href}>{content}</Link>
              ) : (
                <div onClick={action.onClick}>{content}</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modern Modal / Bottom Sheet */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#060910]/80 backdrop-blur-md"
              onClick={() => setShowModal(false)}
            />
            
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative bg-[#161b26] border-t border-white/10 w-full max-w-md rounded-t-[2.5rem] sm:rounded-[3rem] p-8 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] text-center overflow-hidden"
            >
              {/* Decorative Background Element */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[50px] rounded-full" />
              
              <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8" />
              
              <div className="w-20 h-20 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                <Info size={40} className="text-emerald-500" />
              </div>
              
              <h3 className="text-2xl font-black text-white mb-3">به زودی...</h3>
              <p className="text-gray-400 text-sm mb-10 leading-relaxed px-6 font-medium">
                ما در حال کار روی این قابلیت جذاب هستیم. در نسخه‌های آینده منتظر فعال شدن آن باشید!
              </p>
              
              <button
                onClick={() => setShowModal(false)}
                className="w-full h-16 bg-white text-black font-black rounded-2xl transition-all active:scale-[0.96] shadow-xl hover:bg-emerald-400"
              >
                متوجه شدم
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardQuickActions;