// hooks/useLocalStorage.ts (یک هوک جداگانه برای مدیریت localStorage)
import { useState, useEffect } from "react";

const storageKey = "user_plan_status";

interface UserStatus {
  active_plan_key: string;
  has_used_free_trial: boolean;
}

export const useLocalStorage = () => {
  const getInitialUserStatus = (): UserStatus => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(storageKey);
      if (stored) return JSON.parse(stored);
    }
    return { active_plan_key: "free_trial", has_used_free_trial: false };
  };

  const [userStatus, setUserStatus] = useState<UserStatus>(getInitialUserStatus());

  const saveUserStatus = (status: UserStatus) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, JSON.stringify(status));
      setUserStatus(status);
    }
  };

  return {
    userStatus,
    saveUserStatus,
  };
};