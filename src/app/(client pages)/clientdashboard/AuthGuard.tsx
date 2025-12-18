// File Path: src\app\(client pages)\clientdashboard\AuthGuard.tsx

"use client";
import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

/**
 * @title AuthGuard (با چک تکمیل ثبت‌نام)
 * @description قبل از نمایش محتوای داشبورد، علاوه بر لاگین بودن، وضعیت تکمیل ثبت‌نام را نیز بررسی می‌کند.
 */
export default function AuthGuard({ children }: { children: ReactNode }): ReactNode {
  const router = useRouter();
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [canAccess, setCanAccess] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/client/auth/check");
        
        if (res.status === 401) {
            // توکن وجود ندارد یا نامعتبر است
            router.replace("/login"); 
        } else if (res.ok) {
          const data = await res.json();
          
          if (data.signupComplete === false) { 
              // کاربر لاگین است اما ثبت‌نام ناقص است
              setCanAccess(false);
              toast("لطفاً اطلاعات سالن خود را تکمیل کنید.", { icon: "⚠️" });
              // هدایت به صفحه لاگین با پارامتر signup
              router.replace("/login?step=signup"); 
          } else {
              // لاگین و ثبت‌نام کامل است
              setCanAccess(true);
          }
        } else {
            // خطاهای دیگر
            router.replace("/login");
        }
      } catch (e) {
        console.error("Failed to check authentication", e);
        router.replace("/login");
      } finally {
        setIsAuthChecked(true);
      }
    }

    // اگر توکن از روش قدیمی در localStorage باقی مانده، آن را حذف کن.
    if (typeof window !== 'undefined' && localStorage.getItem('authToken')) {
      localStorage.removeItem('authToken');
    }

    checkAuth();
  }, [router]);

  // نمایش لودر در حین بررسی وضعیت
  if (!isAuthChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1e26]">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        <span className="mr-3 text-white">در حال بررسی احراز هویت و ثبت‌نام...</span>
      </div>
    );
  }
  
  // اگر دسترسی کامل تأیید نشد، چیزی نمایش نده (تا زمان انجام ریدایرکت)
  if (!canAccess) {
      return null;
  }

  // اگر احراز هویت و تکمیل ثبت‌نام موفق بود، محتوای داشبورد را نمایش بده
  return <>{children}</>;
}