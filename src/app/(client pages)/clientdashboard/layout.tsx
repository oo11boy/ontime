"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useDashboard } from "@/hooks/useDashboard";
import Loading from "./components/Loading";

// فقط در محیط development لاگ نمایش داده شود
const isDev = process.env.NODE_ENV === "development";
const log = (...args: any[]) => {
  if (isDev) console.log(...args);
};

export default function ClientDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isLoading } = useDashboard();
  const pathname = usePathname();
  const { theme, systemTheme } = useTheme();

  // تنظیم تم - بدون تأثیر روی عملکرد
  useEffect(() => {
    const currentTheme = theme === "system" ? systemTheme : theme;
    if (currentTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme, systemTheme]);

  // فقط برای لاگ در محیط توسعه
  useEffect(() => {
    if (!isLoading && isDev) {
      log(`[Layout] Rendering path: ${pathname}`);
    }
  }, [pathname, isLoading]);

  if (isLoading) {
    return <Loading />;
  }
  
  return (
    <main dir="rtl" className="antialiased transition-colors duration-300">
      {children}
    </main>
  );
}