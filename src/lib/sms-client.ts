// File Path: src/lib/sms-client.ts

/**
 * پارامترهای ورودی برای تابع ارسال پیامک
 */
interface SendSmsParams {
  to_phone: string;
  content: string;
  sms_type?: "reservation" | "reminder" | "other" | string;
  booking_id?: number | null;
  booking_date?: string | null;
  booking_time?: string | null;
  sms_reminder_hours_before?: number | null;
  use_template?: boolean;
  template_key?: string | null; // کد پترن داینامیک (مثلاً از دیتابیس)
}

/**
 * تابع ارسال پیامک که در کامپوننت‌های فرانت‌اند (مثل NewAppointmentPage) صدا می‌زنید.
 * این تابع درخواست را به API داخلی پروژه (/api/sms/send) ارسال می‌کند.
 */
export async function sendSingleSms({
  to_phone,
  content,
  sms_type = "other",
  booking_id = null,
  booking_date = null,
  booking_time = null,
  sms_reminder_hours_before = 24,
  use_template = false,
  template_key = null,
}: SendSmsParams): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch("/api/sms/send", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({
        to_phone,
        content,
        sms_type,
        booking_id,
        booking_date,
        booking_time,
        sms_reminder_hours_before,
        use_template,
        template_key, // ارسال کد پترن داینامیک به سرور
      }),
    });

    const data = await res.json();

    // بازگرداندن نتیجه نهایی
    return { 
      success: res.ok && data.success, 
      message: data.message || (res.ok ? "عملیات با موفقیت انجام شد" : "خطا در پاسخ سرور")
    };
  } catch (error) {
    console.error("SMS Client Error:", error);
    return { 
      success: false, 
      message: "خطای ارتباط با سرور. لطفاً اتصال اینترنت خود را بررسی کنید." 
    };
  }
}