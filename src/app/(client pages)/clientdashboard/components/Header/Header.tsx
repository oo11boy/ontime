// File Path: src\app\(client pages)\clientdashboard\components\Header\Header.tsx

// src/app/(client pages)/clientdashboard/header.tsx
"use client"; // 👈 این کامپوننت باید Client Component باشد

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function Header() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  /**
   * @description تماس با API لاگ اوت برای حذف کوکی HTTP-Only
   */
  const handleLogout = async () => {
    if (loading) return;
    setLoading(true);
    
    try {
      const res = await fetch("/api/client/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // ⭐️⭐️ credentials: 'include' برای ارسال کوکی در درخواست POST لازم است ⭐️⭐️
        credentials: "include", 
      });

      if (res.ok) {
        toast.success("با موفقیت از حساب خارج شدید.");
        // پس از خروج موفق، کاربر را به صفحه لاگین هدایت می‌کنیم
        router.replace("/login");
      } else {
        const data = await res.json();
        toast.error(data.message || "خطا در خروج از حساب کاربری");
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-[95%] sticky top-0 m-auto mb-4 shadow-2xl flex justify-start items-center flex-col">
      <div className="bg-[#1B1F28] font-semibold text-2xl h-full rounded-xl p-4 flex justify-between items-center shadow-sm w-full mx-auto">
        
        {/* عنوان */}
        <span className="text-emerald-400">ONTIME</span>
        
        {/* دکمه خروج */}
        <button
          onClick={handleLogout}
          disabled={loading}
          className="flex items-center gap-2 py-2 px-4 text-sm font-medium rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-red-600/40"
          aria-label="خروج از حساب کاربری"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <LogOut className="w-5 h-5" />
              خروج
            </>
          )}
        </button>
      </div>
    </div>
  );
}