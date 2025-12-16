// File Path: src\app\(admin pages)\admindashboard\AdminAuthGuard.tsx

// src/app/(admin pages)/admindashboard/AdminAuthGuard.tsx

"use client";
import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

/**
 * @title AdminAuthGuard
 * @description قبل از نمایش محتوای داشبورد، فقط لاگین بودن ادمین را بررسی می‌کند.
 */
export default function AdminAuthGuard({ children }: { children: ReactNode }): ReactNode {
  const router = useRouter();
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [canAccess, setCanAccess] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        // چک کردن با API مخصوص ادمین
        const res = await fetch("/api/admin/admin-auth/check"); 
        
        if (res.status === 401) {
          // توکن ادمین وجود ندارد یا نامعتبر است
          router.replace("/admin-login"); // مسیر صفحه لاگین ادمین
          toast.error("لطفاً ابتدا وارد حساب کاربری ادمین خود شوید.");
        } else if (res.ok) {
          // احراز هویت موفق بود
          setCanAccess(true);
        } else {
          // خطاهای دیگر
          router.replace("/admin-login");
        }
      } catch (e) {
        console.error("Failed to check admin authentication", e);
        router.replace("/admin-login");
      } finally {
        setIsAuthChecked(true);
      }
    }

    // حذف توکن‌های احتمالی قدیمی از localStorage
    if (typeof window !== 'undefined' && localStorage.getItem('adminAuthToken')) {
      localStorage.removeItem('adminAuthToken');
    }

    checkAuth();
  }, [router]);

  // نمایش لودر در حین بررسی وضعیت
  if (!isAuthChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1e26]">
        <Loader2 className="w-8 h-8 text-red-400 animate-spin" /> {/* Color Changed */}
        <span className="mr-3 text-white">در حال بررسی احراز هویت مدیر...</span>
      </div>
    );
  }
  
  // اگر دسترسی کامل تأیید نشد، چیزی نمایش نده (تا زمان انجام ریدایرکت)
  if (!canAccess) {
      return null;
  }

  // اگر احراز هویت موفق بود، محتوای داشبورد را نمایش بده
  return <>{children}</>;
}