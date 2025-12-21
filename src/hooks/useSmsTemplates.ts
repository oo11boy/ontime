// hooks/useSmsTemplates.ts
import { useApiQuery, useApiMutation } from "./useApi";

export interface SmsTemplate {
  id: number;
  title: string;
  content: string;
  type?: "reserve" | "reminder" | "generic";
  payamresan_id?: string | null;
}

interface SmsTemplatesResponse {
  success: boolean;
  templates: SmsTemplate[];
  message?: string;
}

export const useSmsTemplates = () => {
  return useApiQuery<SmsTemplatesResponse>(
    ["sms-templates"],
    "/api/smstemplates",
    {
      staleTime: 10 * 60 * 1000, // ۱۰ دقیقه کش — کاملاً معتبر
      // refetchOnWindowFocus: false, ← این خط رو حذف کن (خطا میده)
    }
  );
};

export const useCreateSmsTemplate = () => {
  return useApiMutation("POST", "/api/smstemplates", [["sms-templates"]]);
};

export const useUpdateSmsTemplate = () => {
  return useApiMutation("PUT", "/api/smstemplates", [["sms-templates"]]);
};

export const useDeleteSmsTemplate = () => {
  return useApiMutation("DELETE", "/api/smstemplates", [["sms-templates"]]);
};
