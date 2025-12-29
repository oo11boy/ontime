"use client";

import React, { useEffect, useState } from "react";
import { Download } from "lucide-react";

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      // جلوگیری از نمایش خودکار بنر پیش‌فرض مرورگر
      e.preventDefault();
      // ذخیره رویداد برای استفاده بعدی
      setDeferredPrompt(e);
      // نمایش دکمه نصب سفارشی ما
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      console.log("کاربر اپلیکیشن را نصب کرد");
      // چک کردن وجود gtag برای جلوگیری از کرش کردن برنامه
      if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag('event', 'pwa_install_accepted', {
          event_category: 'PWA',
          event_label: 'Android Install'
        });
      }
    }
    
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="w-[95%] mx-auto mb-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="bg-emerald-500 p-2 rounded-lg">
          <Download className="text-white w-5 h-5" />
        </div>
        <div>
          <p className="text-white text-sm font-bold">نصب اپلیکیشن آن‌تایم</p>
          <p className="text-gray-400 text-xs">دسترسی سریع‌تر و راحت‌تر</p>
        </div>
      </div>
      <button
        onClick={handleInstallClick}
        className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-emerald-600 transition-colors"
      >
        نصب
      </button>
    </div>
  );
}