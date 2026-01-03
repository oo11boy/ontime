// hooks/useHideFooter.ts
"use client";
import { useEffect } from "react";
import { useFooterManager } from "./useFooterManager";

export function useHideFooter() {
  const { setFooterVisible } = useFooterManager();

  useEffect(() => {
    // مخفی کردن فوتر هنگام ورود به صفحه
    setFooterVisible(false);

    // ظاهر کردن مجدد فوتر هنگام خروج از صفحه (Cleanup)
    return () => setFooterVisible(true);
  }, []); // فقط یکبار اجرا شود
}