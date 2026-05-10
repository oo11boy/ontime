// src/hooks/useAnnouncements.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

interface Announcement {
  id: number;
  title: string;
  content: string;
  type: "info" | "warning" | "success" | "error" | "update";
  priority: "low" | "normal" | "high" | "urgent";
  action_link: string | null;
  is_dismissible: boolean;
  is_viewed: boolean;
  is_dismissed: boolean;
}

export const useAnnouncements = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      const res = await fetch("/api/client/announcements");
      if (!res.ok) throw new Error("خطا در دریافت اطلاعیه‌ها");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const markAsViewed = useMutation({
    mutationFn: async (announcementId: number) => {
      const res = await fetch("/api/client/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ announcementId, action: "view" }),
      });
      if (!res.ok) throw new Error("خطا در ثبت بازدید");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
  });

  const markAsDismissed = useMutation({
    mutationFn: async (announcementId: number) => {
      const res = await fetch("/api/client/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ announcementId, action: "dismiss" }),
      });
      if (!res.ok) throw new Error("خطا در بستن اطلاعیه");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
  });

  const markAsClicked = useMutation({
    mutationFn: async (announcementId: number) => {
      const res = await fetch("/api/client/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ announcementId, action: "click" }),
      });
      if (!res.ok) throw new Error("خطا در ثبت کلیک");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
  });

  return {
    announcements: data?.announcements || [],
    unviewedCount: data?.unviewedCount || 0,
    isLoading,
    refetch,
    markAsViewed: markAsViewed.mutate,
    markAsDismissed: markAsDismissed.mutate,
    markAsClicked: markAsClicked.mutate,
  };
};