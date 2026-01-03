"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useDashboard } from "@/hooks/useDashboard";
import Loading from "./components/Loading";
import Footer from "./components/Footer/Footer";

export default function ClientDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data: dashboardData, isLoading } = useDashboard();
  const router = useRouter();
  const pathname = usePathname();

  // --- بررسی انقضای اشتراک ---
  useEffect(() => {
    if (!isLoading && dashboardData?.user) {
      const pricingPage = "/clientdashboard/pricingplan";

      if (pathname === pricingPage) return;

      const quotaEndsAt = dashboardData.user.quota_ends_at;

      if (typeof quotaEndsAt === "undefined") return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

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

  // --- لود گفتینو + مخفی کردن آیکون + فقط با کلیک باز شود ---
  useEffect(() => {
    if (typeof window === "undefined") return;

    const GOFTINO_ID = "wECjcJ"; // ← شناسه واقعی گفتینو خودت رو اینجا بگذار

    // تنظیمات اولیه گفتینو
    window.goftinoSettings = {
      hasIcon: false,          // آیکون دایره‌ای پیش‌فرض کاملاً مخفی
      hideCloseButton: false,  // دکمه بستن فعال باشه
      autoOpen: false,         // چت خودکار باز نشود
      widgetPosition: "bottom-right",
      welcomeMessage: "سلام عزیز! 👋\nبه پشتیبانی آنلاین آنتایم خوش آمدید.\nهر سؤالی داشتید، همین‌جا بپرسید.\nتیم ما آنلاین و آماده کمک است ❤️",
    };

    // لود اسکریپت گفتینو
    (function () {
      var i = GOFTINO_ID,
        a = window,
        d = document;
      function g() {
        var g = d.createElement("script"),
          s = "https://www.goftino.com/widget/" + i,
          l = localStorage.getItem("goftino_" + i);
        g.async = !0;
        g.src = l ? s + "?o=" + l : s;
        d.getElementsByTagName("head")[0].appendChild(g);
      }
      "complete" === d.readyState
        ? g()
        : a.attachEvent
        ? a.attachEvent("onload", g)
        : a.addEventListener("load", g, !1);
    })();

    // وقتی گفتینو آماده شد، تنظیمات نهایی رو اعمال کن
    const handleGoftinoReady = () => {
      if (window.Goftino) {
        // اطمینان از مخفی بودن آیکون
        window.Goftino.setWidget({
          hasIcon: false,
        });

        // ارسال اطلاعات کاربر
        if (dashboardData?.user) {
          window.Goftino.setUser({
            name: dashboardData.user.name || "کاربر عزیز",
            phone: dashboardData.user.phone || "",
          });
        }
      }
    };

    // رویداد آماده شدن گفتینو
    window.addEventListener("goftino_ready", handleGoftinoReady);

    // اگر گفتینو از قبل لود شده باشه (مثلاً در صفحه‌های دیگر)
    window.Goftino && handleGoftinoReady();

    return () => {
      window.removeEventListener("goftino_ready", handleGoftinoReady);
    };
  }, [dashboardData]);

  if (isLoading) return <Loading />;

  return (
    <main dir="rtl" className="antialiased">
      {children}
     
    </main>
  );
}