"use client";

import React, { useEffect, useState } from "react";
import { Download, Smartphone, Share2, Plus } from "lucide-react";

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  // تشخیص سیستم‌عامل کاربر
  useEffect(() => {
    const userAgent = navigator.userAgent;
    const android = /Android/i.test(userAgent);
    const ios = /iPhone|iPad|iPod/i.test(userAgent);
    
    setIsAndroid(android);
    setIsIOS(ios);
  }, []);

  useEffect(() => {
    // برای کاربران اندروید، این کامپوننت را نشان نده
    if (isAndroid) return;
    
    // برای کاربران غیر اندروید (iOS و دسکتاپ)
    if (!isAndroid && isAndroid !== undefined) {
      // برای دسکتاپ (Chrome, Edge, etc)
      if (!isIOS) {
        const handler = (e: any) => {
          e.preventDefault();
          setDeferredPrompt(e);
          setIsVisible(true);
        };
        window.addEventListener("beforeinstallprompt", handler);
        return () => window.removeEventListener("beforeinstallprompt", handler);
      } 
      // برای iOS همیشه راهنما را نشان بده
      else if (isIOS) {
        // بررسی اینکه آیا قبلاً راهنما نشان داده شده یا نه
        const hasSeenIOSGuide = localStorage.getItem('ios_pwa_guide_seen');
        if (!hasSeenIOSGuide) {
          setIsVisible(true);
        }
      }
    }
  }, [isAndroid, isIOS]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // برای دسکتاپ و کروم اندروید (اگر اینجا رسیدیم)
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === "accepted") {
        console.log("کاربر اپلیکیشن را نصب کرد");
      }
      
      setDeferredPrompt(null);
      setIsVisible(false);
    } else if (isIOS) {
      // برای iOS، راهنما را نشان بده و سپس مخفی کن
      localStorage.setItem('ios_pwa_guide_seen', 'true');
      setIsVisible(false);
      // می‌توانید یک alert یا toast راهنما نشان دهید
      alert("برای نصب:\n1. روی دکمه Share (اشتراک‌گذاری) کلیک کنید\n2. گزینه 'Add to Home Screen' را انتخاب کنید");
    }
  };

  // اگر کاربر اندروید است، کامپوننت را نشان نده
  if (isAndroid) return null;
  if (!isVisible) return null;

  return (
    <div className="w-[95%] mx-auto mb-4 p-4 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500 p-2 rounded-lg">
            {isIOS ? (
              <Smartphone className="text-white w-5 h-5" />
            ) : (
              <Download className="text-white w-5 h-5" />
            )}
          </div>
          <div>
            <p className="text-white text-sm font-bold">نصب اپلیکیشن آنتایم</p>
            <p className="text-gray-400 text-xs">
              {isIOS 
                ? "Add to Home Screen از طریق Safari" 
                : "نصب برای دسترسی سریع‌تر"}
            </p>
          </div>
        </div>
        <button
          onClick={handleInstallClick}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-blue-600 transition-colors flex items-center gap-1"
        >
          {isIOS ? (
            <>
              <Share2 className="w-3 h-3" />
              راهنما
            </>
          ) : (
            'نصب'
          )}
        </button>
      </div>
      
      {/* راهنمای مرحله به مرحله برای iOS */}
      {isIOS && (
        <div className="mt-3 pt-3 border-t border-blue-500/20">
          <p className="text-gray-400 text-xs mb-2">مراحل نصب:</p>
          <div className="flex items-center justify-around text-center">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center mb-1">
                <Share2 className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-gray-500 text-[10px]">1. کلیک Share</span>
            </div>
            <div className="text-blue-500">→</div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center mb-1">
                <Plus className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-gray-500 text-[10px]">2. Add to Home Screen</span>
            </div>
            <div className="text-blue-500">→</div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center mb-1">
                <Download className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-gray-500 text-[10px]">3. Add</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}