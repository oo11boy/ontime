"use client";

import React, { useState } from "react";
import {
  PhoneCall,
  UserPlus,
  Info,
  Headset,
  GraduationCap,
  Clock,
  CalendarOff,
  Building2,
  Calendar,
  ChevronRight,
  MessageCircle,
  MessageSquare,
  FileText,
  CalendarClock,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface DashboardQuickActionsProps {
  userType: "user" | "staff" | null;
}

const DashboardQuickActions: React.FC<DashboardQuickActionsProps> = ({
  userType,
}) => {
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const actions = [
    {
      id: "tickets",
      label: "ارتباط با ما",
      icon: MessageCircle,
      href: "/clientdashboard/support-tickets",
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-500/10",
      hoverBg: "group-hover:bg-purple-100 dark:group-hover:bg-purple-500/20",
    },
    {
      id: 4,
      label: "مدیریت پرسنل",
      icon: UserPlus,
      href: "./clientdashboard/Staffs",
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-500/10",
      hoverBg: "group-hover:bg-purple-100 dark:group-hover:bg-purple-500/20",
    },
    {
      id: 2,
      label: "آموزش",
      icon: GraduationCap,
      onClick: () => setShowModal(true),
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-500/10",
      hoverBg: "group-hover:bg-amber-100 dark:group-hover:bg-amber-500/20",
    },
    {
      id: 7,
      label: "اطلاعات بیزنس",
      icon: Building2,
      onClick: () => router.push("/clientdashboard/settings?tab=business"),
      color: "text-cyan-600 dark:text-cyan-400",
      bg: "bg-cyan-50 dark:bg-cyan-500/10",
      hoverBg: "group-hover:bg-cyan-100 dark:group-hover:bg-cyan-500/20",
    },
    {
      id: "sms-suggestions",
      label: "پیشنهاد متن پیام",
      icon: FileText,
      href: "/clientdashboard/sms-suggestions",
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-500/10",
      hoverBg: "group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20",
    },
    {
      id: 5,
      label: "تنظیم شیفت",
      icon: Clock,
      onClick: () => router.push("/clientdashboard/settings?tab=shifts"),
      color: "text-pink-600 dark:text-pink-400",
      bg: "bg-pink-50 dark:bg-pink-500/10",
      hoverBg: "group-hover:bg-pink-100 dark:group-hover:bg-pink-500/20",
    },
    {
      id: 6,
      label: "روزهای تعطیل",
      icon: CalendarOff,
      onClick: () => router.push("/clientdashboard/settings?tab=holidays"),
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-50 dark:bg-rose-500/10",
      hoverBg: "group-hover:bg-rose-100 dark:group-hover:bg-rose-500/20",
    },
    {
      id: 8,
      label: "تقویم نوبت‌ها",
      icon: Calendar,
      onClick: () => router.push("/clientdashboard/calendar"),
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-500/10",
      hoverBg: "group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20",
    },
    {
      id: "scheduled-sms",
      label: "وضعیت پیامک ها",
      icon: Clock,
      href: "/clientdashboard/scheduled-sms",
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-500/10",
      hoverBg: "group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20",
    },
    {
      id: "booking-changes",
      label: "تغییرات نوبت",
      icon: CalendarClock,
      href: "/clientdashboard/booking-changes",
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-500/10",
      hoverBg: "group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20",
    },
  ];

  const staffsactions = [
    {
      id: "tickets",
      label: "ارتباط با ما",
      icon: MessageCircle,
      href: "/clientdashboard/support-tickets",
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-500/10",
      hoverBg: "group-hover:bg-purple-100 dark:group-hover:bg-purple-500/20",
    },
    {
      id: 2,
      label: "آموزش",
      icon: GraduationCap,
      onClick: () => setShowModal(true),
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-500/10",
      hoverBg: "group-hover:bg-amber-100 dark:group-hover:bg-amber-500/20",
    },
    {
      id: "sms-suggestions",
      label: "پیشنهاد متن پیام",
      icon: FileText,
      href: "/clientdashboard/sms-suggestions",
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-500/10",
      hoverBg: "group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20",
    },
    {
      id: 8,
      label: "تقویم نوبت‌ها",
      icon: Calendar,
      onClick: () => router.push("/clientdashboard/calendar"),
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-500/10",
      hoverBg: "group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20",
    },
    {
      id: "scheduled-sms",
      label: "وضعیت پیامک ها",
      icon: Clock,
      href: "/clientdashboard/scheduled-sms",
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-500/10",
      hoverBg: "group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20",
    },
    {
      id: "booking-changes",
      label: "تغییرات نوبت",
      icon: CalendarClock,
      href: "/clientdashboard/booking-changes",
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-500/10",
      hoverBg: "group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20",
    },
  ];

  return (
    <div className="w-full px-4 py-6" dir="rtl">
      {/* هدر بخش دسترسی سریع */}
      <div className="flex items-center justify-between mb-6 px-1">
        <h2 className="text-lg font-black text-slate-800 dark:text-white/90 tracking-tight flex items-center gap-2 transition-colors">
          <span className="w-2 h-5 bg-emerald-600 dark:bg-emerald-500 rounded-full" />
          دسترسی سریع
        </h2>
        <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-full uppercase tracking-widest transition-colors">
          Shortcut
        </span>
      </div>

      {/* Grid Container */}
      <div className="grid grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
        {userType == "user" &&
          actions.map((action, index) => {
            const Icon = action.icon;
            const content = (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  delay: index * 0.05,
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                }}
                className="relative flex flex-col items-center justify-center aspect-square rounded-xl bg-white dark:bg-[#1a1f2e] border border-slate-200/60 dark:border-white/[0.05] shadow-sm dark:shadow-xl group overflow-hidden active:scale-95 transition-all duration-200 cursor-pointer hover:shadow-md dark:hover:shadow-2xl"
              >
                {/* Overlay Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-100/50 to-transparent dark:from-white/[0.02] dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Icon Container */}
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-2 transition-all duration-200 ${action.bg} ${action.hoverBg}`}
                >
                  <Icon
                    strokeWidth={2.5}
                    size={22}
                    className={`${action.color} sm:w-6 sm:h-6 transition-colors`}
                  />
                </div>

                <span className="text-[9px] sm:text-[11px] font-black text-slate-500 dark:text-gray-400 group-hover:text-slate-700 dark:group-hover:text-white transition-colors text-center px-1">
                  {action.label}
                </span>
              </motion.div>
            );

            return (
              <div key={action.id}>
                {action.href ? (
                  <Link href={action.href}>{content}</Link>
                ) : (
                  <div onClick={action.onClick}>{content}</div>
                )}
              </div>
            );
          })}

        {userType == "staff" &&
          staffsactions.map((action, index) => {
            const Icon = action.icon;
            const content = (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  delay: index * 0.05,
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                }}
                className="relative flex flex-col items-center justify-center aspect-square rounded-xl bg-white dark:bg-[#1a1f2e] border border-slate-200/60 dark:border-white/[0.05] shadow-sm dark:shadow-xl group overflow-hidden active:scale-95 transition-all duration-200 cursor-pointer hover:shadow-md dark:hover:shadow-2xl"
              >
                {/* Overlay Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-100/50 to-transparent dark:from-white/[0.02] dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Icon Container */}
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-2 transition-all duration-200 ${action.bg} ${action.hoverBg}`}
                >
                  <Icon
                    strokeWidth={2.5}
                    size={22}
                    className={`${action.color} sm:w-6 sm:h-6 transition-colors`}
                  />
                </div>

                <span className="text-[9px] sm:text-[11px] font-black text-slate-500 dark:text-gray-400 group-hover:text-slate-700 dark:group-hover:text-white transition-colors text-center px-1">
                  {action.label}
                </span>
              </motion.div>
            );

            return (
              <div key={action.id}>
                {action.href ? (
                  <Link href={action.href}>{content}</Link>
                ) : (
                  <div onClick={action.onClick}>{content}</div>
                )}
              </div>
            );
          })}
      </div>

      {/* مودال آموزش - در صورت نیاز */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">آموزش</h3>
            <p className="text-slate-600 dark:text-gray-400 mb-6">محتوای آموزشی در حال آماده‌سازی است...</p>
            <button
              onClick={() => setShowModal(false)}
              className="w-full py-3 bg-emerald-600 dark:bg-emerald-500 text-white rounded-xl font-bold"
            >
              بستن
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardQuickActions;