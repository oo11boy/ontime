// File Path: src\app\(admin pages)\admindashboard\layout.tsx

"use client";
import React, { useState } from "react";

import Sidebar from "./Sidebar"; 
import { Menu, Search, Bell } from "lucide-react";

export default function AdminDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 1. تعریف وضعیت باز/بسته بودن منو
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    // ----------------------------------------------------
    // *** گارد احراز هویت ادمین در بالاترین سطح قرار می‌گیرد ***
    // ----------------------------------------------------

      <div className="flex h-screen bg-[#1a1e26] dir-rtl font-sans text-white overflow-hidden">
        
        {/* 2. ارسال وضعیت و تابع بستن به سایدبار */}
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />

        {/* --- محتوای اصلی --- */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          
          {/* هدر */}
          <header className="h-20 min-h-20 bg-[#1a1e26]/90 backdrop-blur-md border-b border-red-500/20 flex items-center justify-between px-6 sticky top-0 z-30">
            
            <div className="flex items-center gap-4 w-full max-w-lg">
              
              {/* 3. دکمه باز کردن منو (اتصال به State) */}
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden p-2 rounded-lg bg-[#242933] text-red-400 border border-red-500/30 hover:bg-red-500/10 transition" // تغییر رنگ به Red برای تم ادمین
              >
                <Menu className="w-6 h-6" />
              </button>

              <div className="hidden md:flex relative w-full group">
                <input
                  type="text"
                  placeholder="جستجو در پنل..."
                  className="w-full bg-[#242933] border border-red-500/20 rounded-xl py-2.5 px-4 pr-11 text-sm focus:outline-none focus:border-red-400/50 transition-all" // تغییر رنگ به Red برای تم ادمین
                />
                <Search className="absolute right-3.5 top-2.5 w-5 h-5 text-gray-500 group-focus-within:text-red-400 transition-colors" /> {/* تغییر رنگ به Red برای تم ادمین */}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-400 hover:text-red-400 transition"> {/* تغییر رنگ به Red برای تم ادمین */}
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              </button>
              <div className="w-10 h-10 rounded-full bg-linear-to-tr from-red-400 to-red-600 flex items-center justify-center font-bold text-white shadow-lg shadow-red-500/20"> {/* تغییر رنگ به Red برای تم ادمین */}
                A
              </div>
            </div>
          </header>

          {/* محتوای صفحات */}
          <main className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-red-500/20"> {/* تغییر رنگ به Red برای تم ادمین */}
            {children}
          </main>
          
        </div>
      </div>
  );
}