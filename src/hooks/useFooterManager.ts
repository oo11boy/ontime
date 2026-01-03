// hooks/useFooterManager.ts
"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const FOOTER_STATE_KEY = ["footer-visibility"];

export function useFooterManager() {
  const queryClient = useQueryClient();

  // خواندن وضعیت از کش (مقدار پیش‌فرض: true)
  const { data: isVisible } = useQuery({
    queryKey: FOOTER_STATE_KEY,
    queryFn: () => true, // مقدار اولیه
    staleTime: Infinity, // داده هیچ‌وقت منقضی نشود
    initialData: true,
  });

  // تابع تغییر وضعیت
  const setFooterVisible = (visible: boolean) => {
    queryClient.setQueryData(FOOTER_STATE_KEY, visible);
  };

  return { isVisible, setFooterVisible };
}