import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryKey,
} from "@tanstack/react-query";

// تابع کمکی برای واکشی داده‌ها
export const fetchApi = async (url: string, options?: RequestInit) => {
  const res = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  let data: any;
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    // مهم: کل داده‌های JSON رو همراه error بفرست
    const error = new Error(data.message || `خطا: ${res.status}`) as any;
    error.status = res.status;        // وضعیت HTTP
    error.data = data;                // کل بدنه JSON (شامل isBlocked و ...)
    throw error;
  }

  return data;
};

// هوک GET با پشتیبانی از QueryKey استاندارد
export const useApiQuery = <T>(
  key: QueryKey,
  url: string | null,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    gcTime?: number;
  }
) => {
  return useQuery<T>({
    queryKey: key,
    queryFn: () => {
      if (!url) throw new Error("URL is required");
      return fetchApi(url);
    },
    staleTime: options?.staleTime || 5 * 60 * 1000,
    gcTime: options?.gcTime || 10 * 60 * 1000,
    enabled: (options?.enabled ?? true) && !!url,
  });
};

// هوک Mutation با پشتیبانی از دو Generic (Response و Variables)
export const useApiMutation = <T, V = any>(
  method: "POST" | "PUT" | "DELETE" | "PATCH",
  baseUrl: string = "",
  invalidateQueries?: QueryKey[]
) => {
  const queryClient = useQueryClient();

  return useMutation<T, Error, V>({
    mutationFn: async (input: any) => {
      // تشخیص اینکه ورودی به صورت {url, data} است یا مستقیم
      const isObjectInput =
        input &&
        typeof input === "object" &&
        ("url" in input || "data" in input);
      const finalUrl = isObjectInput ? input.url || baseUrl : baseUrl;
      const data = isObjectInput ? input.data : input;

      if (!finalUrl) throw new Error("آدرس API مشخص نشده");

      return fetchApi(finalUrl, {
        method,
        body: data ? JSON.stringify(data) : undefined,
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
