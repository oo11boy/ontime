"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "next-themes";
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
  const { theme, systemTheme } = useTheme();

  const pricingPage = "/clientdashboard/pricingplan?expired=true";
const redirectPaths = ["/clientdashboard/bookingsubmit", "/clientdashboard/Staffs"];

  /**
   * فقط ریدایرکت برای مسیر بوکینگ
   */
useEffect(() => {
  if (redirectPaths.includes(pathname)) {
    router.replace(pricingPage);
  }
}, [pathname, router]);

  // تنظیم کلاس dark روی html بر اساس تم فعلی
  useEffect(() => {
    const currentTheme = theme === "system" ? systemTheme : theme;
    if (currentTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme, systemTheme]);

  if (isLoading) return <Loading />;

  // نمایش همه مسیرها بدون هیچ محدودیتی (حتی منقضی شده‌ها)
  return (
    <main dir="rtl" className="antialiased transition-colors duration-300">
      {children}
    </main>
  );
}