// src/app/c/[slug]/components/TrackingScript.tsx
"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

interface TrackingScriptProps {
  slug: string;
}

export function TrackingScript({ slug }: TrackingScriptProps) {
  const startTime = useRef(Date.now());
  const sessionId = useRef(Math.random().toString(36).substring(2, 15));
  const pathname = usePathname();

  useEffect(() => {
    // تشخیص دستگاه
    const getDeviceType = () => {
      const ua = navigator.userAgent;
      if (/(tablet|ipad|playbook|silk)|(android(?!.*mobile))/i.test(ua)) {
        return "tablet";
      }
      if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Fennec|Minimo|Opera M(obi|ini)|Blazer|Dolfin|Dolphin|Skyfire|Zune/i.test(ua)) {
        return "mobile";
      }
      return "desktop";
    };

    // ثبت بازدید
    const trackVisit = async () => {
      try {
        await fetch("/api/client/customer-link/track-visit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug,
            device_type: getDeviceType(),
            referrer: document.referrer || null,
            session_id: sessionId.current,
          }),
        });
      } catch (error) {
        console.error("Tracking error:", error);
      }
    };

    // ثبت زمان خروج
    const handleBeforeUnload = async () => {
      const timeOnPage = Math.floor((Date.now() - startTime.current) / 1000);
      try {
        await fetch("/api/client/customer-link/track-visit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug,
            time_on_page: timeOnPage,
            session_id: sessionId.current,
          }),
        });
      } catch (error) {
        console.error("Tracking error:", error);
      }
    };

    trackVisit();
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [slug, pathname]);

  return null;
}