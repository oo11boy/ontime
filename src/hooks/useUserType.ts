import { useEffect, useState } from "react";

// هوک ساده برای گرفتن نوع کاربر از کوکی
export function useUserType() {
  const [userType, setUserType] = useState<"user" | "staff" | null>(null);
  const [staffName, setStaffName] = useState<string>("");

  useEffect(() => {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift();
      return null;
    };

    const type = getCookie("user_type") as "user" | "staff" | null;
    setUserType(type);
    
    if (type === "staff") {
      setStaffName(getCookie("staff_name") || "پرسنل");
    }
  }, []);

  return { userType, staffName };
}