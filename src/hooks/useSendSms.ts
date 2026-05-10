// src/hooks/useSendSms.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

interface SendSinglePayload {
  to_phone: string;
  content?: string;
  sms_type?: string;
  booking_id?: number | null;
  template_key?: string | null;
}

export const useSendSingleSms = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SendSinglePayload) => {
      const res = await fetch("/api/sms/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        // اگر خطای 402 (موجودی ناکافی) باشد، پیام خاص برگردان
        if (res.status === 402) {
          throw new Error(data.message || "موجودی پیامک شما کافی نیست");
        }
        throw new Error(data.message || "خطا در ارسال پیامک");
      }
      return data;
    },
    onSuccess: () => {
      toast.success("پیامک با موفقیت ارسال شد");
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["sms-balance"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "خطا در ارتباط با سرور");
    },
  });
};

interface BulkRecipient {
  phone: string;
  name?: string;
  booking_id?: number | null;
}

interface SendBulkPayload {
  recipients: BulkRecipient[];
  templateKey: string;
  sms_type?: string;
}

export const useSendBulkSms = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SendBulkPayload) => {
      const res = await fetch("/api/sms/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 402) {
          throw new Error(data.message || "موجودی پیامک کافی نیست");
        }
        throw new Error(data.message || "خطا در ارسال گروهی");
      }
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "ارسال گروهی با موفقیت انجام شد");
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["sms-balance"] });
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "خطا در عملیات ارسال گروهی");
    },
  });
};