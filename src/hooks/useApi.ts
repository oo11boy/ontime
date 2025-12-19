// hooks/useApi.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Helper function برای fetch
export const fetchApi = async (url: string, options?: RequestInit) => {
  const res = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || `خطا: ${res.status}`);
  }

  return res.json();
};

// هوک برای GET
export const useApiQuery = <T,>(
  key: string[],
  url: string,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    cacheTime?: number;
  }
) => {
  return useQuery<T>({
    queryKey: key,
    queryFn: () => fetchApi(url),
    staleTime: options?.staleTime || 5 * 60 * 1000,
    gcTime: options?.cacheTime || 10 * 60 * 1000,
    enabled: options?.enabled ?? true,
  });
};

// هوک برای POST/PUT/DELETE/PATCH (پشتیبانی از دو حالت: با url پویا یا baseUrl ثابت)
export const useApiMutation = <T,>(
  method: "POST" | "PUT" | "DELETE" | "PATCH",
  baseUrl: string = "",
  invalidateQueries?: string[][]
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { url?: string; data?: any } | any) => {
      // اگر ورودی شیء { url, data } باشه
      if (input && typeof input === "object" && ("url" in input || "data" in input)) {
        const finalUrl = input.url || baseUrl;
        if (!finalUrl) throw new Error("آدرس API مشخص نشده");

        return fetchApi(finalUrl, {
          method,
          body: input.data ? JSON.stringify(input.data) : undefined,
        });
      }

      // حالت قدیمی: مستقیماً data رو پاس دادن (برای POST ساده)
      const finalUrl = baseUrl;
      if (!finalUrl) throw new Error("آدرس API مشخص نشده");

      return fetchApi(finalUrl, {
        method,
        body: input ? JSON.stringify(input) : undefined,
      });
    },
    onSuccess: () => {
      if (invalidateQueries) {
        invalidateQueries.forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey });
        });
      }
    },
  });
};