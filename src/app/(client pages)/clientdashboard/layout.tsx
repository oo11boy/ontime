
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

  const isExpired = useMemo(() => {
    if (isLoading || !dashboardData?.user) return false;

    const endedAt = dashboardData.user.ended_at;

  if (!endedAt) return true;

    const now = new Date();
    const expiryDate = new Date(endedAt);

    // مقایسه زمان فعلی با زمان پایان پلن
    return expiryDate < now;
  }, [dashboardData, isLoading]);

 useEffect(() => {
    if (typeof window === "undefined") return;

    const GOFTINO_ID = "wECjcJ"; // ← شناسه واقعی گفتینو خودت رو اینجا بگذار

    window.goftinoSettings = {
      hasIcon: false,          // آیکون دایره‌ای پیش‌فرض کاملاً مخفی
      hideCloseButton: false,  // دکمه بستن فعال باشه
      autoOpen: false,         // چت خودکار باز نشود
      widgetPosition: "bottom-right",
      welcomeMessage: "سلام عزیز! 👋\nبه پشتیبانی آنلاین آنتایم خوش آمدید.\nهر سؤالی داشتید، همین‌جا بپرسید.\nتیم ما آنلاین و آماده کمک است ❤️",
    };

 
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

    const handleGoftinoReady = () => {
      if (window.Goftino) {

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

    window.addEventListener("goftino_ready", handleGoftinoReady);

    window.Goftino && handleGoftinoReady();

    return () => {
      window.removeEventListener("goftino_ready", handleGoftinoReady);
    };
  }, [dashboardData]);


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