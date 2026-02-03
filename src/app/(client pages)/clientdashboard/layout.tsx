"use client";

import { useEffect, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useDashboard } from "@/hooks/useDashboard";
import Loading from "./components/Loading";

export default function ClientDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data: dashboardData, isLoading } = useDashboard();
  const router = useRouter();
  const pathname = usePathname();

  const pricingPage = "/clientdashboard/pricingplan";

  /**
   * بررسی وضعیت انقضا بر اساس فیلد ended_at (مطابق دیتابیس)
   */
  const isExpired = useMemo(() => {
    if (isLoading || !dashboardData?.user) return false;

    const endedAt = dashboardData.user.ended_at;

    // اگر فیلد ended_at خالی باشد (null)، یعنی پلنی برای کاربر ثبت نشده است
    if (!endedAt) return true;

    const now = new Date();
    const expiryDate = new Date(endedAt);

    // مقایسه زمان فعلی با زمان پایان پلن
    return expiryDate < now;
  }, [dashboardData, isLoading]);

  /**
   * مدیریت ریدایرکت: اگر منقضی شده بود و در صفحه خرید نبود، ریدایرکت شود
   */
  useEffect(() => {
    if (!isLoading && isExpired && pathname !== pricingPage) {
      // استفاده از replace برای پاک کردن تاریخچه مرورگر و جلوگیری از برگشت کاربر
      router.replace(`${pricingPage}?expired=true`);
    }
  }, [isExpired, isLoading, pathname, router]);


  if (isLoading) return <Loading />;

  // ۲. قفل کردن محتوا: اگر منقضی شده و کاربر در صفحه خرید نیست، اصلاً children را رندر نکن
  if (isExpired && pathname !== pricingPage) {
    return <Loading />; 
  }

  // ۳. نمایش محتوا فقط برای کاربران دارای اعتبار یا در صفحه خرید
  return (
    <main dir="rtl" className="antialiased">
      {children}
    </main>
  );
}