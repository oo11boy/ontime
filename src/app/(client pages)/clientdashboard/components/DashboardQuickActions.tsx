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

  const openGoftino = () => {
    if (typeof window !== "undefined" && (window as any).Goftino) {
      (window as any).Goftino.open();
    } else {
      alert("سیستم پشتیبانی در حال بارگذاری است.");
    }
  };

  const actions = [
    {
      id: "tickets",
      label: "ارتباط با ما",
      icon: MessageCircle,
      href: "/clientdashboard/support-tickets",
      color: "#8b5cf6",
      bg: "rgba(139,92,246,0.1)",
    },

    {
      id: 4,
      label: "مدیریت پرسنل",
      icon: UserPlus,
      href: "./clientdashboard/Staffs",
      color: "#8b5cf6",
      bg: "rgba(139,92,246,0.1)",
    },
    {
      id: 2,
      label: "آموزش",
      icon: GraduationCap,
      onClick: () => setShowModal(true),
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.1)",
    },
    {
      id: 7,
      label: "اطلاعات بیزنس",
      icon: Building2,
      onClick: () => router.push("/clientdashboard/settings?tab=business"),
      color: "#06b6d4",
      bg: "rgba(6,182,212,0.1)",
    },
    {
      id: "sms-suggestions",
      label: "پیشنهاد متن پیام",
      icon: FileText,
      href: "/clientdashboard/sms-suggestions",
      color: "#10b981",
      bg: "rgba(16,185,129,0.1)",
    },
    {
      id: 5,
      label: "تنظیم شیفت",
      icon: Clock,
      onClick: () => router.push("/clientdashboard/settings?tab=shifts"),
      color: "#ec4899",
      bg: "rgba(236,72,153,0.1)",
    },
    {
      id: 6,
      label: "روزهای تعطیل",
      icon: CalendarOff,
      onClick: () => router.push("/clientdashboard/settings?tab=holidays"),
      color: "#ef4444",
      bg: "rgba(239,68,68,0.1)",
    },

    {
      id: 8,
      label: "تقویم نوبت‌ها",
      icon: Calendar,
      onClick: () => router.push("/clientdashboard/calendar"),
      color: "#10b981",
      bg: "rgba(16,185,129,0.1)",
    },
  ];

  const staffsactions = [
    {
      id: "tickets",
      label: "ارتباط با ما",
      icon: MessageCircle,
      href: "/clientdashboard/support-tickets",
      color: "#8b5cf6",
      bg: "rgba(139,92,246,0.1)",
    },
    {
      id: 2,
      label: "آموزش",
      icon: GraduationCap,
      onClick: () => setShowModal(true),
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.1)",
    },
    {
      id: "sms-suggestions",
      label: "پیشنهاد متن پیام",
      icon: FileText,
      href: "/clientdashboard/sms-suggestions",
      color: "#10b981",
      bg: "rgba(16,185,129,0.1)",
    },
    {
      id: 8,
      label: "تقویم نوبت‌ها",
      icon: Calendar,
      onClick: () => router.push("/clientdashboard/calendar"),
      color: "#10b981",
      bg: "rgba(16,185,129,0.1)",
    },
  ];
  return (
    <div className="w-full px-4 py-6" dir="rtl">
      {/* هدر بخش دسترسی سریع */}
      <div className="flex items-center justify-between mb-6 px-1">
        <h2 className="text-lg font-black text-white/90 tracking-tight flex items-center gap-2">
          <span className="w-2 h-5 bg-emerald-500 rounded-full" />
          دسترسی سریع
        </h2>
        <span className="text-[10px] font-bold text-gray-500 bg-white/5 px-3 py-1 rounded-full uppercase tracking-widest">
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
                className="relative flex flex-col items-center justify-center aspect-square rounded-lg bg-[#161b26] border border-white/[0.05] shadow-xl group overflow-hidden active:scale-90 transition-transform"
              >
                {/* Overlay Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

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
                className="relative flex flex-col items-center justify-center aspect-square rounded-lg bg-[#161b26] border border-white/[0.05] shadow-xl group overflow-hidden active:scale-90 transition-transform"
              >
                {/* Overlay Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        

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
    </div>
  );
};

export default DashboardQuickActions;
