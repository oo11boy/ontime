// src/hooks/useUserType.ts
import { useEffect, useState } from "react";

// کش برای ذخیره مقادیر کوکی در حافظه
let cachedUserType: "user" | "staff" | null = null;
let cachedStaffId: string | null = null;
let cachedStaffName: string = "";

// تابع دریافت کوکی (برای استفاده در کلاینت)
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

export function useUserType() {
  const [userType, setUserType] = useState<"user" | "staff" | null>(cachedUserType);
  const [staffId, setStaffId] = useState<string | null>(cachedStaffId);
  const [staffName, setStaffName] = useState<string>(cachedStaffName);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // اگر قبلاً مقداردهی شده بود، از کش استفاده کن
    if (cachedUserType !== null) {
      setUserType(cachedUserType);
      setStaffId(cachedStaffId);
      setStaffName(cachedStaffName);
      setIsLoading(false);
      return;
    }

    // خواندن از کوکی
    const type = getCookie("user_type") as "user" | "staff" | null;
    const staffIdValue = getCookie("staff_id");
    const staffNameValue = getCookie("staff_name") || "";

    // ذخیره در کش
    cachedUserType = type;
    cachedStaffId = staffIdValue;
    cachedStaffName = staffNameValue;

    setUserType(type);
    setStaffId(staffIdValue);
    setStaffName(staffNameValue);
    setIsLoading(false);

    //监听 localStorage و sessionStorage برای تغییرات (اختیاری)
    const handleStorageChange = () => {
      const newType = getCookie("user_type") as "user" | "staff" | null;
      const newStaffId = getCookie("staff_id");
      const newStaffName = getCookie("staff_name") || "";
      
      if (newType !== cachedUserType) {
        cachedUserType = newType;
        cachedStaffId = newStaffId;
        cachedStaffName = newStaffName;
        setUserType(newType);
        setStaffId(newStaffId);
        setStaffName(newStaffName);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    // همچنین می‌توانید یک event custom برای تغییر وضعیت پرسنل اضافه کنید
    window.addEventListener("userTypeChanged", handleStorageChange as EventListener);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("userTypeChanged", handleStorageChange as EventListener);
    };
  }, []);

  return { userType, staffId, staffName, isLoading };
}

// تابع کمکی برای تغییر وضعیت پرسنل (برای استفاده در صفحات)
export function setUserType(type: "user" | "staff" | null, staffId?: string | null, staffName?: string) {
  if (typeof document === "undefined") return;
  
  // تنظیم کوکی‌ها
  document.cookie = `user_type=${type || ""}; path=/; max-age=${60 * 60 * 24 * 30}`; // 30 روز
  
  if (type === "staff" && staffId) {
    document.cookie = `staff_id=${staffId}; path=/; max-age=${60 * 60 * 24 * 30}`;
    document.cookie = `staff_name=${staffName || "پرسنل"}; path=/; max-age=${60 * 60 * 24 * 30}`;
  } else {
    document.cookie = `staff_id=; path=/; max-age=0`;
    document.cookie = `staff_name=; path=/; max-age=0`;
  }
  
  // به‌روزرسانی کش
  cachedUserType = type;
  cachedStaffId = type === "staff" ? staffId || null : null;
  cachedStaffName = type === "staff" ? staffName || "" : "";
  
  // ارسال event برای اطلاع به سایر کامپوننت‌ها
  window.dispatchEvent(new CustomEvent("userTypeChanged"));
}

// تابع خروج از حالت پرسنل
export function exitStaffMode() {
  setUserType("user");
}