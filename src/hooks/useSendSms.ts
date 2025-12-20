import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

// --- اینترفیس‌های مربوط به ارسال تکی ---
interface SendSinglePayload {
  to_phone: string;
  content: string;
  sms_type?: string;
  booking_id?: number | null;
}

/**
 * هوک ارسال پیامک تکی
 * پس از موفقیت، کوئری 'dashboard' را ابطال می‌کند تا موجودی آپدیت شود
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
      // ابطال کش داشبورد برای دریافت موجودی جدید از سرور
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
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
  message: string;
  sms_type?: string;
}

/**
 * هوک ارسال پیامک گروهی
 * تعداد پیامک‌های کسر شده را بر اساس تعداد گیرندگان از موجودی کم می‌کند
 */
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
        throw new Error(data.message || "خطا در ارسال گروهی");
      }
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "ارسال گروهی با موفقیت انجام شد");
      // به‌روزرسانی آنی موجودی در رابط کاربری
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "خطا در عملیات ارسال گروهی");
    },
  });
};
