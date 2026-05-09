// hooks/useUserType.ts
import { useEffect, useState } from "react";

export function useUserType() {
  const [userType, setUserType] = useState<"user" | "staff" | null>(null);
  const [staffId, setStaffId] = useState<string | null>(null);
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
      setStaffId(getCookie("staff_id"));
      setStaffName(getCookie("staff_name") || "پرسنل");
    }
  }, []);

  return { userType, staffId, staffName };
}