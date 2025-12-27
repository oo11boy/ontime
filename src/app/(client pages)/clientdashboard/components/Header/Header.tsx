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
  Eye,
} from "lucide-react";
import toast from "react-hot-toast";

interface Notification {
  id: number;
  type: "cancel" | "reschedule" | "new";
  message: string;
  is_read: number;
  time: string;
  is_recent: number;
}

export default function Header() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const isNotifOpenRef = useRef(false);
  const lastUnreadCount = useRef(0);

  const unreadCount = notifications.filter((n) => n.is_read === 0).length;

  // تابع برای خواندن همه اعلان‌ها
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

  // تابع باز کردن مودال و خواندن همزمان
  const openNotifPanel = () => {
    setIsNotifOpen(true);
    isNotifOpenRef.current = true;
    setIsProfileOpen(false);
    markAsRead(); // بلافاصله همه را خوانده شده کن
  };

  const fetchNotifications = async () => {
    if (document.hidden) return;
    try {
      const res = await fetch("/api/client/notifications");
      const data = await res.json();
      if (data.success) {
        const currentUnreads = data.notifications.filter((n: any) => n.is_read === 0).length;

        if (currentUnreads > lastUnreadCount.current) {
          toast.custom((t) => (
            <div 
              className={`${
                t.visible ? 'animate-center-enter' : 'animate-center-leave'
              } fixed top-[15%] left-0 right-0 flex items-center justify-center z-9999 pointer-events-none`}
            >
              <div className="max-w-md w-[90%] bg-[#232936] shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded-2xl pointer-events-auto flex flex-col ring-2 ring-emerald-500/40 border border-gray-700 overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col items-center text-center" dir="rtl">
                    <div className="w-14 h-14 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
                      <Bell className="w-7 h-7 text-emerald-400 animate-swing" />
                    </div>
                    <p className="text-lg font-bold text-gray-100">اعلان جدید دریافت شد</p>
                    <p className="mt-2 text-sm text-gray-400 leading-relaxed">
                      شما {currentUnreads} پیام بررسی نشده دارید. برای مشاهده جزئیات روی دکمه زیر کلیک کنید.
                    </p>
                  </div>
                </div>
                
                <div className="flex border-t border-gray-700 h-14">
                  <button
                    onClick={() => {
                      toast.dismiss(t.id); // اول پاک کردن توست
                      openNotifPanel();   // بعد باز کردن پنل
                    }}
                    className="flex-1 flex items-center justify-center gap-2 text-sm font-bold text-emerald-400 hover:bg-emerald-500/5 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    مشاهده اعلان‌ها
                  </button>
                  <div className="w-px bg-gray-700" />
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    className="flex-1 flex items-center justify-center text-sm font-medium text-gray-500 hover:bg-white/5 transition-colors"
                  >
                    بستن
                  </button>
                </div>
              </div>
            </div>
          ), { duration: 120000 });
        }

        if (!isNotifOpenRef.current) {
          setNotifications(data.notifications);
        }
        lastUnreadCount.current = currentUnreads;
      }
    } catch (error) {
      console.error("خطا در دریافت اعلان‌ها");
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
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
        toast.success("خروج موفقیت‌آمیز بود");
        router.replace("/login");
      }
    } catch (error) {
      toast.error("خطا در ارتباط");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {(isProfileOpen || isNotifOpen) && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-90 md:hidden transition-all duration-300"
          onClick={() => {
            setIsProfileOpen(false);
            setIsNotifOpen(false);
            isNotifOpenRef.current = false;
          }}
        />
      )}

      <div className="bg-[#1B1F28] border border-gray-700/50 rounded-2xl p-3 md:p-4 flex justify-between items-center shadow-2xl relative z-95">
        <div className="flex items-center">
          <span
            className="text-emerald-400 font-black text-xl md:text-2xl tracking-tighter cursor-pointer"
            onClick={() => router.push("/clientdashboard")}
          >
            ONTIME
          </span>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => isNotifOpen ? (setIsNotifOpen(false), isNotifOpenRef.current = false) : openNotifPanel()}
              className="p-2.5 rounded-xl bg-gray-800/50 text-gray-400 hover:text-emerald-400 transition-all relative border border-gray-700/30"
            >
              <Bell className={`w-5 h-5 ${unreadCount > 0 ? "animate-swing" : ""}`} />
              {unreadCount > 0 && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#1B1F28] animate-pulse"></span>
              )}
            </button>

            {isNotifOpen && (
              <div className="fixed bottom-0 left-0 right-0 z-100 bg-[#232936] rounded-t-3xl border-t border-gray-700 md:absolute md:bottom-auto md:top-full md:left-0 md:right-auto md:mt-3 md:w-80 md:rounded-2xl md:border md:border-gray-700 animate-in slide-in-from-bottom md:slide-in-from-top-2 duration-300">
                <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto mt-3 mb-1 md:hidden" />
                <div className="p-4 border-b border-gray-700/50 flex justify-between items-center">
                  <span className="font-bold text-sm text-gray-200 text-right w-full">اعلان‌های اخیر</span>
                  <X className="w-5 h-5 text-gray-500 md:hidden" onClick={() => { setIsNotifOpen(false); isNotifOpenRef.current = false; }} />
                </div>
                <div className="max-h-[50vh] md:max-h-80 overflow-y-auto custom-scrollbar p-2">
                  {notifications.length === 0 ? (
                    <div className="p-10 text-center text-gray-500 text-xs">اعلانی وجود ندارد</div>
                  ) : (
                    notifications.map((notif) => (
                      <div key={notif.id} className={`p-4 mb-2 rounded-xl border border-transparent transition-all ${notif.is_read === 0 ? "bg-emerald-400/5 border-emerald-500/10" : "opacity-70"}`}>
                        <div className="flex gap-3 items-start text-right" dir="rtl">
                          {notif.type === "cancel" ? <XCircle className="text-red-400 w-5 h-5 shrink-0" /> : <Calendar className="text-blue-400 w-5 h-5 shrink-0" />}
                          <div className="flex-1">
                            <p className="text-[11px] text-gray-200 leading-5">{notif.message}</p>
                            <span className="text-[10px] text-gray-600 mt-2 block">{notif.time}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="w-px h-6 bg-gray-700/50 hidden md:block"></div>

          <div className="relative" ref={profileRef}>
            <button
              onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); isNotifOpenRef.current = false; }}
              className="flex items-center gap-2 p-1 md:p-1.5 md:pr-3 rounded-xl bg-gray-800/50 border border-gray-700/30 hover:bg-gray-700/50 transition-all"
            >
              <div className="hidden md:flex flex-col items-end">
                <span className="text-xs font-bold text-gray-200">مدیریت کلینیک</span>
                <span className="text-[10px] text-emerald-500">آنلاین</span>
              </div>
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 font-bold">
                <User className="w-5 h-5" />
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform hidden md:block ${isProfileOpen ? "rotate-180" : ""}`} />
            </button>

            {isProfileOpen && (
              <div className="fixed bottom-0 left-0 right-0 z-100 bg-[#232936] rounded-t-3xl border-t border-gray-700 p-2 md:absolute md:bottom-auto md:top-full md:left-0 md:right-auto md:mt-3 md:w-56 md:rounded-2xl md:border md:border-gray-700 animate-in slide-in-from-bottom md:slide-in-from-top-2 duration-300">
                <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto mt-2 mb-4 md:hidden" />
                <button
                  onClick={() => { router.push("/clientdashboard/settings"); setIsProfileOpen(false); }}
                  className="w-full flex items-center justify-between md:justify-start gap-3 p-4 md:p-3 text-sm text-gray-300 hover:bg-gray-700/50 rounded-2xl md:rounded-xl transition-colors mb-1"
                >
                  <div className="flex items-center gap-3 w-full" dir="rtl">
                    <Settings className="w-4 h-4 text-gray-500" />
                    <span>تنظیمات حساب</span>
                  </div>
                </button>
                <div className="h-px bg-gray-700/50 my-1 mx-2 hidden md:block"></div>
                <button
                  onClick={handleLogout}
                  disabled={loading}
                  className="w-full flex items-center justify-between md:justify-start gap-3 p-4 md:p-3 text-sm text-red-400 hover:bg-red-400/10 rounded-2xl md:rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3 w-full" dir="rtl">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                    <span>خروج از حساب</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <style jsx global>{`
        @keyframes center-enter { 0% { opacity: 0; transform: scale(0.9) translateY(20px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes center-leave { 0% { opacity: 1; transform: scale(1); } 100% { opacity: 0; transform: scale(0.9) translateY(20px); } }
        .animate-center-enter { animation: center-enter 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-center-leave { animation: center-leave 0.3s ease-in forwards; }
        @keyframes swing { 0% { transform: rotate(0); } 20% { transform: rotate(10deg); } 40% { transform: rotate(-10deg); } 100% { transform: rotate(0); } }
        .animate-swing { animation: swing 2s ease infinite; transform-origin: top center; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; border-radius: 10px; }
      `}</style>
    </div>
  );
}