// src/hooks/useSendSms.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

// --- اینترفیس‌های مربوط به ارسال تکی ---
interface SendSinglePayload {
to_phone: string;
  content?: string;               // اختیاری شد
  sms_type?: string;
  booking_id?: number | null;
  template_key?: string | null;   // ← اضافه کن
  }

/**
 * هوک ارسال پیامک تکی
 */
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

// --- اینترفیس‌های مربوط به ارسال گروهی ---
interface BulkRecipient {
  phone: string;
  name?: string;
  booking_id?: number | null;
}

interface SendBulkPayload {
  recipients: BulkRecipient[];
  templateKey: string; // اصلاح شد: تغییر از message به templateKey برای هماهنگی با API و Page
  sms_type?: string;
}

/**
 * هوک ارسال پیامک گروهی
 */
export const useSendBulkSms = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SendBulkPayload) => {
      // دقت کنید آدرس API باید با فایلی که ساختید (api/sms/bulk) یکی باشد
      const res = await fetch("/api/sms/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "خطا در ارسال گروهی");
      }
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "ارسال گروهی با موفقیت انجام شد");
      // به‌روزرسانی موجودی در تمام بخش‌های اپلیکیشن
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["sms-balance"] });
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "خطا در عملیات ارسال گروهی");
    },
  });
};