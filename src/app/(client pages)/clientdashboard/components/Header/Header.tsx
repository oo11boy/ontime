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
  Calendar,
  XCircle,
  X,
  ShieldCheck,
  Zap,
} from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion"; // اضافه شدن برای انیمیشن‌های حرفه‌ای
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

  // --- منطق نوتیفیکیشن و خروج (همان منطق قبلی شما با کمی بهبود بصری) ---
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
        const currentUnreads = data.notifications.filter((n: any) => n.is_read === 0).length;
        if (currentUnreads > lastUnreadCount.current) {
          showToast(currentUnreads);
        }
        if (!isNotifOpenRef.current) setNotifications(data.notifications);
        lastUnreadCount.current = currentUnreads;
      }
    } catch (error) {
      console.error("Error fetching notifications");
    }
  };

  const showToast = (count: number) => {
    toast.custom(
      (t) => (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="max-w-md w-full bg-[#1e232e]/95 backdrop-blur-2xl border border-emerald-500/30 shadow-[0_20px_40px_rgba(0,0,0,0.4)] rounded-3xl overflow-hidden pointer-events-auto flex flex-col"
        >
          <div className="p-5 text-center" dir="rtl">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-3 mx-auto">
              <Bell className="w-6 h-6 text-emerald-400 animate-bounce" />
            </div>
            <p className="text-lg font-bold text-white">اعلان جدید</p>
            <p className="mt-1 text-sm text-gray-400">شما {count} پیام خوانده نشده دارید.</p>
          </div>
          <div className="flex border-t border-white/5 h-12">
            <button onClick={() => { toast.dismiss(t.id); openNotifPanel(); }} className="flex-1 text-emerald-400 font-bold text-sm hover:bg-emerald-500/5 transition-colors">مشاهده</button>
            <button onClick={() => toast.dismiss(t.id)} className="flex-1 text-gray-500 text-sm hover:bg-white/5 transition-colors">بستن</button>
          </div>
        </motion.div>
      ),
      { duration: 4000 }
    );
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setIsProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
        isNotifOpenRef.current = false;
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/client/auth/logout", { method: "POST" });
      if (res.ok) {
        toast.success("خروج موفقیت‌آمیز");
        router.replace("/login");
      }
    } catch (e) { toast.error("خطا در ارتباط"); }
    finally { setLoading(false); }
  };

  const isAnyModalOpen = isProfileOpen || isNotifOpen;

  return (
    <div className="w-full relative px-4 py-1 md:px-8 md:py-6">
      {/* --- Overlay Backdrop --- */}
      <AnimatePresence>
        {isAnyModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setIsProfileOpen(false); setIsNotifOpen(false); isNotifOpenRef.current = false; }}
            className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-md"
          />
        )}
      </AnimatePresence>

      {/* --- Main Header Container --- */}
      <div className="max-w-7xl mx-auto bg-[#161b22]/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-3 md:p-4 flex justify-between items-center shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] relative z-[95]">
        
        {/* Logo */}
        <div 
          className="flex items-center gap-2 cursor-pointer group" 
          onClick={() => router.push("/clientdashboard")}
        >
          <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)] group-hover:rotate-12 transition-transform">
            <Zap className="w-6 h-6 text-[#161b22] fill-current" />
          </div>
          <span className="text-white font-black text-xl md:text-2xl tracking-tighter">
            ON<span className="text-emerald-400">TIME</span>
          </span>
        </div>

        <div className="flex items-center gap-3 md:gap-5">
          {/* Notification Button */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => isNotifOpen ? (setIsNotifOpen(false), (isNotifOpenRef.current = false)) : openNotifPanel()}
              className={`p-3 rounded-2xl bg-white/5 border border-white/5 text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/5 transition-all relative ${isNotifOpen ? "ring-2 ring-emerald-500/50 text-emerald-400" : ""}`}
            >
              <Bell className={`w-5 h-5 ${unreadCount > 0 ? "animate-swing" : ""}`} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 text-[#161b22] text-[10px] font-black rounded-full flex items-center justify-center border-2 border-[#161b22]">
                  {unreadCount > 9 ? "+9" : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Modal */}
            <AnimatePresence>
              {isNotifOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="fixed top-24 left-4 right-4 z-[100] bg-[#1e232e] rounded-[2rem] border border-white/10 shadow-2xl md:absolute md:top-full md:left-0 md:right-auto md:mt-4 md:w-85 overflow-hidden"
                >
                  <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/[0.02]" dir="rtl">
                    <span className="font-bold text-sm text-white flex items-center gap-2">
                      <Bell className="w-4 h-4 text-emerald-400" /> اعلان‌های اخیر
                    </span>
                    <X className="w-5 h-5 text-gray-500 cursor-pointer hover:text-white" onClick={() => setIsNotifOpen(false)} />
                  </div>
                  <div className="max-h-[60vh] md:max-h-[400px] overflow-y-auto p-3 custom-scrollbar space-y-2">
                    {notifications.length === 0 ? (
                      <div className="p-12 text-center text-gray-500 text-xs">اعلانی وجود ندارد</div>
                    ) : (
                      notifications.map((notif) => (
                        <div key={notif.id} className={`p-4 rounded-2xl border border-transparent transition-all ${notif.is_read === 0 ? "bg-emerald-500/10 border-emerald-500/10" : "bg-white/[0.02] opacity-50 hover:opacity-100"}`} dir="rtl">
                          <div className="flex gap-4 items-start text-right">
                            <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${notif.type === 'cancel' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                              {notif.type === "cancel" ? <XCircle className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
                            </div>
                            <div className="flex-1">
                              <p className="text-[12px] text-gray-100 font-medium leading-5">{notif.message}</p>
                              <span className="text-[10px] text-gray-500 mt-2 block font-mono tracking-tighter">{notif.time}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile Button */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); }}
              className={`flex items-center gap-3 p-1.5 md:pr-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all ${isProfileOpen ? "ring-2 ring-emerald-500/50" : ""}`}
            >
              <div className="hidden md:flex flex-col items-end">
                <span className="text-xs font-bold text-white">{isDashLoading ? "..." : dashboardData?.user?.name || "کاربر"}</span>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest">Online</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-[#161b22] shadow-lg">
                <User className="w-6 h-6" strokeWidth={2.5} />
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform hidden md:block ${isProfileOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Profile Modal */}
            <AnimatePresence>
              {isProfileOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="fixed top-24 left-4 right-4 z-[100] bg-[#1e232e] rounded-[2rem] border border-white/10 p-3 shadow-2xl md:absolute md:top-full md:left-0 md:right-auto md:mt-4 md:w-72"
                >
                  <div className="p-4 flex items-center gap-4 bg-white/5 rounded-2xl mb-2" dir="rtl">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-400/20">
                      <ShieldCheck className="w-7 h-7" />
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-sm font-bold text-white leading-tight">{dashboardData?.user?.name || "کاربر خوش‌آمدید"}</span>
                      <span className="text-[10px] text-gray-500 mt-1 font-medium">پنل مدیریت هوشمند</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <button onClick={() => { router.push("/clientdashboard/settings"); setIsProfileOpen(false); }} className="w-full flex items-center justify-between p-3.5 text-sm text-gray-300 hover:bg-emerald-500/10 hover:text-emerald-400 rounded-xl transition-all" dir="rtl">
                      <div className="flex items-center gap-3">
                        <Settings className="w-5 h-5 text-gray-500" />
                        <span className="font-bold">تنظیمات حساب</span>
                      </div>
                      <ChevronDown className="-rotate-90 w-4 h-4 opacity-30" />
                    </button>
                    
                    <div className="h-px bg-white/5 my-2 mx-2" />
                    
                    <button onClick={handleLogout} disabled={loading} className="w-full flex items-center gap-3 p-3.5 text-sm text-red-400 hover:bg-red-400/10 rounded-xl transition-all font-bold" dir="rtl">
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogOut className="w-5 h-5" />}
                      <span>خروج از حساب کاربری</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes swing {
          0%, 100% { transform: rotate(0); }
          20% { transform: rotate(12deg); }
          40% { transform: rotate(-10deg); }
          60% { transform: rotate(6deg); }
          80% { transform: rotate(-4deg); }
        }
        .animate-swing {
          animation: swing 2s ease infinite;
          transform-origin: top center;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.4);
        }
      `}</style>
    </div>
  );
}