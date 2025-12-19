"use client";

import React, { useEffect, useState } from "react";
import { Share, PlusSquare, X } from "lucide-react";

export default function IosInstallPrompt() {
  const [isIos, setIsIos] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // تشخیص دستگاه iOS
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    
    // تشخیص اینکه آیا در حال حاضر در حالت PWA (Standalone) هستیم یا خیر
    const isPwa = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;

    setIsIos(isIosDevice);
    setIsInstalled(isPwa);

    // اگر iOS بود و هنوز نصب نشده بود، بعد از ۳ ثانیه نمایش بده
    if (isIosDevice && !isPwa) {
      const timer = setTimeout(() => setIsVisible(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!isVisible || isInstalled) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 animate-bounce-in">
      <div className="bg-white rounded-2xl p-4 shadow-2xl relative border-2 border-emerald-500">
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full p-1"
        >
          <X size={16} />
        </button>

        <div className="flex flex-col gap-3 text-right" dir="rtl">
          <p className="text-gray-800 font-bold text-sm">
            نصب اپلیکیشن روی آیفون:
          </p>
          
          <div className="flex items-center gap-2 text-gray-600 text-xs">
            <span className="bg-gray-100 p-1 rounded">1. دکمه <Share size={18} className="inline text-blue-500" /> (Share) را در نوار پایین بزنید.</span>
          </div>

          <div className="flex items-center gap-2 text-gray-600 text-xs">
            <span className="bg-gray-100 p-1 rounded">2. گزینه <PlusSquare size={18} className="inline" /> (Add to Home Screen) را انتخاب کنید.</span>
          </div>
        </div>

        {/* فلش راهنما به سمت پایین (جایی که دکمه Share سافاری قرار دارد) */}
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[15px] border-t-white"></div>
      </div>
    </div>
  );
}