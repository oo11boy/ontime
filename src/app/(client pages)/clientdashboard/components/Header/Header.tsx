"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LogOut,
  Loader2,
  User,
  Bell,
  Settings,
  ChevronDown,
  X,
  XCircle,
  Calendar,
} from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useDashboard } from "@/hooks/useDashboard";

interface Notification {
  id: number;
  type: "cancel" | "reschedule" | "new";
  message: string;
  is_read: number;
  time: string;
}

export default function Header() {
  const router = useRouter();
  const { data: dashboardData, isLoading: isDashLoading } = useDashboard();
  const [loading, setLoading] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const isNotifOpenRef = useRef(false);
  const lastUnreadCount = useRef(0);

  const unreadCount = notifications.filter((n) => n.is_read === 0).length;

  const markAsRead = async () => {
    try {
      const res = await fetch("/api/client/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllAsRead: true }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
        lastUnreadCount.current = 0;
      }
    } catch (e) {
      console.error("Error marking as read", e);
    }
  };

  const openNotifPanel = () => {
    setIsNotifOpen(true);
    isNotifOpenRef.current = true;
    setIsProfileOpen(false);
    markAsRead();
  };

  const fetchNotifications = async () => {
    if (typeof document !== "undefined" && document.hidden) return;
    try {
      const res = await fetch("/api/client/notifications");
      const data = await res.json();
      if (data.success) {
        const currentUnreads = data.notifications.filter(
          (n: any) => n.is_read === 0
        ).length;

        if (currentUnreads > lastUnreadCount.current) {
          toast.custom(
            (t) => (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                className="fixed top-[10%] left-0 right-0 flex items-center justify-center z-[9999] pointer-events-none"
              >
                <div className="max-w-md w-[90%] bg-[#232936] shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-2xl pointer-events-auto flex flex-col ring-2 ring-emerald-500/40 border border-gray-700 overflow-hidden">
                  <div className="p-6 text-center" dir="rtl">
                    <div className="w-14 h-14 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                      <Bell className="w-7 h-7 text-emerald-400 animate-pulse" />
                    </div>
                    <p className="text-lg font-bold text-gray-100">
                      اعلان جدید
                    </p>
                    <p className="mt-2 text-sm text-gray-400 leading-relaxed">
                      شما {currentUnreads} پیام جدید دارید.
                    </p>
                  </div>
                  <div className="flex border-t border-gray-700 h-14">
                    <button
                      onClick={() => {
                        toast.dismiss(t.id);
                        openNotifPanel();
                      }}
                      className="flex-1 text-emerald-400 font-bold text-sm hover:bg-emerald-500/5 transition-colors"
                    >
                      مشاهده
                    </button>
                    <div className="w-px bg-gray-700" />
                    <button
                      onClick={() => toast.dismiss(t.id)}
                      className="flex-1 text-gray-500 text-sm hover:bg-white/5 transition-colors"
                    >
                      بستن
                    </button>
                  </div>
                </div>
              </motion.div>
            ),
            { duration: 5000 }
          );
        }
        if (!isNotifOpenRef.current) setNotifications(data.notifications);
        lastUnreadCount.current = currentUnreads;
      }
    } catch (error) {
      console.error("Error fetching notifications");
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target as Node)
      ) {
        setIsNotifOpen(false);
        isNotifOpenRef.current = false;
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/client/auth/logout", { method: "POST" });
      if (res.ok) {
        toast.success("خروج موفقیت‌آمیز بود");
        router.replace("/login");
      }
    } catch (error) {
      toast.error("خطا در ارتباط");
    } finally {
      setLoading(false);
    }
  };

  const isAnyModalOpen = isProfileOpen || isNotifOpen;

  return (
    <div className="w-full relative">
      {/* Backdrop با انیمیشن Framer Motion */}
      <AnimatePresence>
        {isAnyModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-md"
            onClick={() => {
              setIsProfileOpen(false);
              setIsNotifOpen(false);
              isNotifOpenRef.current = false;
            }}
          />
        )}
      </AnimatePresence>

      {/* Main Header */}
      <div className="bg-[#1B1F28] border border-gray-700/50 rounded-2xl p-3 md:p-4 flex justify-between items-center shadow-2xl relative z-[95]">
        <div className="flex items-center">
          <span
            className="text-emerald-400 font-black text-xl md:text-2xl tracking-tighter cursor-pointer"
            onClick={() => router.push("/clientdashboard")}
          >
            ONTIME
          </span>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {/* Notification Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() =>
                isNotifOpen
                  ? (setIsNotifOpen(false), (isNotifOpenRef.current = false))
                  : openNotifPanel()
              }
              className={`p-2.5 rounded-xl bg-gray-800/50 text-gray-400 hover:text-emerald-400 transition-all relative border border-gray-700/30 ${
                isNotifOpen
                  ? "ring-2 ring-emerald-500/50 text-emerald-400 bg-emerald-500/5"
                  : ""
              }`}
            >
              <Bell
                className={`w-5 h-5 ${unreadCount > 0 ? "animate-pulse" : ""}`}
              />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#1B1F28] animate-pulse">
                  {unreadCount > 9 ? "+9" : unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {isNotifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="fixed top-20 left-4 right-4 z-[100] bg-[#232936] rounded-2xl border border-gray-700 shadow-[0_20px_50px_rgba(0,0,0,0.6)] md:absolute md:top-full md:left-auto md:right-0 md:mt-4 md:w-80 overflow-hidden"
                >
                  <div
                    className="p-4 border-b border-gray-700/50 flex justify-between items-center bg-gray-800/30"
                    dir="rtl"
                  >
                    <span className="font-bold text-sm text-gray-200 flex items-center gap-2">
                      <Bell className="w-4 h-4 text-emerald-400" />
                      اعلان‌های اخیر
                    </span>
                    <X
                      className="w-4 h-4 text-gray-500 cursor-pointer"
                      onClick={() => setIsNotifOpen(false)}
                    />
                  </div>
                  <div className="max-h-[60vh] md:max-h-96 overflow-y-auto p-2 custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="p-12 text-center text-gray-500 text-xs">
                        اعلانی وجود ندارد
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <motion.div
                          key={notif.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`p-4 mb-2 rounded-xl border transition-all ${
                            notif.is_read === 0
                              ? "bg-emerald-400/5 border-emerald-500/10"
                              : "opacity-60 border-transparent"
                          }`}
                        >
                          <div className="flex gap-3 items-start text-right" dir="rtl">
                            {notif.type === "cancel" ? (
                              <XCircle className="text-red-400 w-5 h-5 shrink-0" />
                            ) : (
                              <Calendar className="text-blue-400 w-5 h-5 shrink-0" />
                            )}
                            <div className="flex-1">
                              <p className="text-[11px] text-gray-200 leading-5">
                                {notif.message}
                              </p>
                              <span className="text-[10px] text-gray-600 mt-2 block">
                                {notif.time}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => {
                setIsProfileOpen(!isProfileOpen);
                setIsNotifOpen(false);
                isNotifOpenRef.current = false;
              }}
              className={`flex items-center gap-2 p-1 md:p-1.5 md:pr-3 rounded-xl bg-gray-800/50 border border-gray-700/30 hover:bg-gray-700/50 transition-all ${
                isProfileOpen
                  ? "ring-2 ring-emerald-500/50 bg-emerald-500/5"
                  : ""
              }`}
            >
              <div className="hidden md:flex flex-col items-end">
                <span className="text-xs font-bold text-gray-200">
                  {isDashLoading ? "..." : dashboardData?.user?.name || "کاربر"}
                </span>
                <span className="text-[10px] text-emerald-500 font-medium">
                  آنلاین
                </span>
              </div>
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 font-bold">
                <User className="w-5 h-5" />
              </div>
              <ChevronDown
                className={`w-4 h-4 text-gray-500 transition-transform hidden md:block ${
                  isProfileOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="fixed top-20 left-4 right-4 z-[100] bg-[#232936] rounded-2xl border border-gray-700 p-2 shadow-[0_20px_50px_rgba(0,0,0,0.6)] md:absolute md:top-full md:left-auto md:right-0 md:mt-4 md:w-64"
                >
                  <div
                    className="p-4 border-b border-gray-700/50 flex items-center gap-3"
                    dir="rtl"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-sm font-bold text-gray-100">
                        {isDashLoading
                          ? "..."
                          : dashboardData?.user?.name || "کاربر"}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        مدیریت نوبت‌دهی
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 space-y-1">
                    <button
                      onClick={() => {
                        router.push("/clientdashboard/settings");
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-3 p-3 text-sm text-gray-300 hover:bg-emerald-500/10 hover:text-emerald-400 rounded-xl transition-all"
                      dir="rtl"
                    >
                      <Settings className="w-5 h-5 md:w-4 md:h-4 text-gray-500" />
                      <span>تنظیمات حساب</span>
                    </button>
                    <div className="h-px bg-gray-700/50 my-1 mx-2"></div>
                    <button
                      onClick={handleLogout}
                      disabled={loading}
                      className="w-full flex items-center gap-3 p-3 text-sm text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                      dir="rtl"
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 md:w-4 md:h-4 animate-spin" />
                      ) : (
                        <LogOut className="w-5 h-5 md:w-4 md:h-4" />
                      )}
                      <span>خروج از حساب</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* حذف تمام style jsx — دیگر نیاز نیست چون از Framer Motion استفاده کردیم */}
    </div>
  );
}