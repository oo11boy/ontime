"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import AuthGuard from "./AuthGuard";
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

  useEffect(() => {
    // فقط وقتی لودینگ تمام شد و دیتا موجود بود بررسی کن
    if (!isLoading && dashboardData?.user) {
      const pricingPage = "/clientdashboard/pricingplan";
      
      // اگر در صفحه خرید هستیم، کاری انجام نده
      if (pathname === pricingPage) return;

      const quotaEndsAt = dashboardData.user.quota_ends_at;

      // اگر فیلد از API نیامده باشد، فعلاً ریدایرکت نکن تا مانع کار نشود
      if (typeof quotaEndsAt === 'undefined') return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // اگر تاریخ انقضا وجود نداشت (null) یا منقضی شده بود
      if (!quotaEndsAt) {
        router.push(`${pricingPage}?expired=true`);
      } else {
        const expiry = new Date(quotaEndsAt);
        expiry.setHours(0, 0, 0, 0);

        if (expiry < today) {
          router.push(`${pricingPage}?expired=true`);
        }
      }
    }
  }, [dashboardData, isLoading, pathname, router]);

  if (isLoading) return <Loading />;

  return (
    <AuthGuard>
      <main dir="rtl" className="antialiased">
        {children}
      </main>
    </AuthGuard>
  );
}