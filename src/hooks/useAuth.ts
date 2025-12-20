// src/hooks/useAuth.ts
"use client";

import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";

interface JwtPayload {
  userId: number;
  exp?: number;
}

export function useAuth() {
  const [userId, setUserId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  const checkAuth = async () => {
    try {
      // اول از API سرور چک کنیم (قابل اعتمادتر)
      const response = await fetch("/api/client/auth/check");
      const data = await response.json();

      if (data.isAuthenticated && data.userId) {
        setUserId(data.userId);
        setIsAuthenticated(true);
        setIsLoading(false);
        return;
      }

      // اگر API جواب نداد، از کوکی چک کنیم
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("authToken="))
        ?.split("=")[1];

      if (!token) {
        setUserId(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      const decoded = jwtDecode<JwtPayload>(token);

      if (decoded.exp && Date.now() >= decoded.exp * 1000) {
        document.cookie =
          "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        setUserId(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        router.push("/login");
        return;
      }

      setUserId(decoded.userId);
      setIsAuthenticated(true);
    } catch (err) {
      console.error("خطا در بررسی احراز هویت:", err);
      setError("مشکل در احراز هویت");
      setUserId(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();

    // ریفرش هر ۵ دقیقه
    const interval = setInterval(checkAuth, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [router]);

  const logout = () => {
    document.cookie =
      "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setUserId(null);
    setIsAuthenticated(false);
    router.push("/login");
  };

  return {
    userId,
    isLoading,
    error,
    isAuthenticated,
    logout,
    refreshAuth: checkAuth,
  };
}
