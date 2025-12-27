// File Path: src/lib/sms-client.ts

/**
 * پارامترهای ورودی برای تابع ارسال پیامک
 * شامل متغیرهای مورد نیاز برای جایگذاری در پترن‌های IPPanel
 */
interface SendSmsParams {
  to_phone: string;
  content?: string;
  sms_type?: string;
  booking_id?: number | null;
  booking_date?: string | null;
  booking_time?: string | null;
  sms_reminder_hours_before?: number | null;
  use_template?: boolean;
  template_key?: string | null;
  // متغیرهای داینامیک پترن
  name?: string;
  date?: string;
  time?: string;
  service?: string;
  link?: string;
  [key: string]: any; // اجازه ارسال هر پارامتر اضافه دیگر
}
/**
 * تابع ارسال پیامک هماهنگ با متغیرهای داینامیک
 */
export async function sendSingleSms(params: SendSmsParams): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch("/api/sms/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    return { success: res.ok && data.success, message: data.message };
  } catch (error) {
    return { success: false, message: "خطای شبکه" };
  }
}
